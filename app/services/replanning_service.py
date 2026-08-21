import uuid
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from ortools.sat.python import cp_model

from app.models.interview_slot import InterviewSlot
from app.models.panel import Panel
from app.models import SlotStatus
from app.schemas.replanning import RescheduleRequest, ReplanDiffResponse
from app.services.scheduling_service import generate_time_slots

async def generate_minimal_replan(
    db: AsyncSession, 
    slot_id: str, 
    request: RescheduleRequest
) -> ReplanDiffResponse:
    # 1. Fetch the slot to be rescheduled
    old_slot = await db.get(InterviewSlot, uuid.UUID(slot_id))
    if not old_slot:
        raise ValueError("Slot not found")
        
    drive_id = old_slot.drive_id
    application_id = old_slot.application_id
    
    # 2. Fetch all other slots for this drive to avoid conflicts
    stmt_other_slots = select(InterviewSlot).where(
        InterviewSlot.drive_id == drive_id,
        InterviewSlot.slot_id != old_slot.slot_id,
        InterviewSlot.status.in_([SlotStatus.DRAFT, SlotStatus.CONFIRMED])
    )
    other_slots_result = await db.execute(stmt_other_slots)
    other_slots = other_slots_result.scalars().all()
    
    # 3. Fetch all panels for this drive
    stmt_panels = select(Panel).where(Panel.drive_id == drive_id)
    panels_result = await db.execute(stmt_panels)
    panels = panels_result.scalars().all()
    
    if not panels:
        raise ValueError("No panels available")
        
    # 4. Generate candidate time slots
    duration_minutes = int((old_slot.end_time - old_slot.start_time).total_seconds() / 60)
    
    # Use the same base logic as scheduling, or use the preferred time
    start_time = request.preferred_start or old_slot.start_time.replace(hour=9, minute=0, second=0, microsecond=0)
    end_time = request.preferred_end or old_slot.start_time.replace(hour=17, minute=0, second=0, microsecond=0)
    
    time_slots = generate_time_slots(start_time, end_time, duration_minutes)
    
    if not time_slots:
        raise ValueError("No valid time slots in the preferred range")
        
    # 5. Build minimal CP-SAT model to find the best available slot
    model = cp_model.CpModel()
    
    num_panels = len(panels)
    num_slots = len(time_slots)
    
    # x[p, t] = 1 if the rescheduled interview is assigned to panel p at time t
    x = {}
    for p in range(num_panels):
        for t in range(num_slots):
            x[p, t] = model.NewBoolVar(f'x_p{p}_t{t}')
            
            # Check if this panel at this time overlaps with any existing slot
            slot_start, slot_end = time_slots[t]
            is_conflict = False
            for existing in other_slots:
                # If panel is the same, and time overlaps
                if existing.panel_id == panels[p].panel_id:
                    if not (slot_end <= existing.start_time or slot_start >= existing.end_time):
                        is_conflict = True
                        break
                # Also candidate shouldn't be double booked (though unlikely if we are rescheduling their only slot)
                if existing.application_id == application_id:
                    if not (slot_end <= existing.start_time or slot_start >= existing.end_time):
                        is_conflict = True
                        break
                        
            if is_conflict:
                model.Add(x[p, t] == 0)
                
    # We need exactly one assignment
    model.Add(sum(x[p, t] for p in range(num_panels) for t in range(num_slots)) == 1)
    
    # Solve
    solver = cp_model.CpSolver()
    status = solver.Solve(model)
    
    if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
        for p in range(num_panels):
            for t in range(num_slots):
                if solver.Value(x[p, t]) == 1:
                    new_start, new_end = time_slots[t]
                    new_panel = panels[p]
                    
                    # Store the diff and update the slot
                    response = ReplanDiffResponse(
                        slot_id=old_slot.slot_id,
                        old_start_time=old_slot.start_time,
                        old_end_time=old_slot.end_time,
                        old_panel_id=old_slot.panel_id,
                        new_start_time=new_start,
                        new_end_time=new_end,
                        new_panel_id=new_panel.panel_id,
                        reason=request.reason,
                        message="Minimal replan successful"
                    )
                    
                    old_slot.start_time = new_start
                    old_slot.end_time = new_end
                    old_slot.panel_id = new_panel.panel_id
                    old_slot.status = SlotStatus.RESCHEDULED
                    
                    await db.commit()
                    return response
                    
    raise ValueError("Could not find a conflict-free slot to reschedule to.")
