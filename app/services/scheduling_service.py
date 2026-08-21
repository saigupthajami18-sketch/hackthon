import uuid
from typing import List, Dict, Any, Tuple
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from ortools.sat.python import cp_model

from app.models.job_drive import JobDrive
from app.models.application import Application
from app.models.panel import Panel
from app.models.room import Room
from app.models.interview_slot import InterviewSlot
from app.models import SlotStatus, SlotGenerator, InterviewMode, InterviewRound, ShortlistStatus
from app.schemas.scheduling import ScheduleGenerateRequest, UnscheduledCandidate, ScheduleGenerateResponse

def generate_time_slots(start_time: datetime, end_time: datetime, duration_minutes: int) -> List[Tuple[datetime, datetime]]:
    slots = []
    current = start_time
    while current + timedelta(minutes=duration_minutes) <= end_time:
        slots.append((current, current + timedelta(minutes=duration_minutes)))
        current += timedelta(minutes=duration_minutes)
    return slots

async def generate_schedule(
    db: AsyncSession, 
    drive_id: str, 
    request: ScheduleGenerateRequest
) -> ScheduleGenerateResponse:
    # 1. Fetch data
    drive = await db.get(JobDrive, uuid.UUID(drive_id))
    if not drive:
        raise ValueError("Drive not found")
        
    # Get shortlisted candidates
    stmt = select(Application).where(
        Application.drive_id == uuid.UUID(drive_id),
        Application.shortlist_status == ShortlistStatus.APPROVED
    )
    candidates_result = await db.execute(stmt)
    candidates = candidates_result.scalars().all()
    
    if not candidates:
        return ScheduleGenerateResponse(
            message="No approved candidates to schedule.",
            scheduled_count=0,
            unscheduled_candidates=[]
        )

    # Get panels
    stmt_panels = select(Panel).where(Panel.drive_id == uuid.UUID(drive_id))
    panels_result = await db.execute(stmt_panels)
    panels = panels_result.scalars().all()
    
    if not panels:
        raise ValueError("No panels available for scheduling.")

    # Get rooms if offline
    rooms = []
    if request.mode == InterviewMode.OFFLINE:
        stmt_rooms = select(Room).where(Room.college_id == drive.college_id)
        rooms_result = await db.execute(stmt_rooms)
        rooms = rooms_result.scalars().all()
        if not rooms:
            raise ValueError("No rooms available for offline scheduling.")

    # 2. Setup Time Slots (Simplified: assume a single block 9AM-5PM on drive_date)
    # If drive.drive_date is null, just use tomorrow
    base_date = drive.drive_date if drive.drive_date else datetime.utcnow() + timedelta(days=1)
    base_date = base_date.replace(hour=9, minute=0, second=0, microsecond=0)
    
    start_time = request.start_date or base_date
    end_time = request.end_date or base_date.replace(hour=17)
    
    time_slots = generate_time_slots(start_time, end_time, request.interview_duration_minutes)
    
    if not time_slots:
        raise ValueError("Time range is too small to generate slots.")

    # 3. Setup OR-Tools Model
    model = cp_model.CpModel()
    
    num_candidates = len(candidates)
    num_panels = len(panels)
    num_slots = len(time_slots)
    
    # x[c, p, t] = 1 if candidate c is interviewed by panel p at time t
    x = {}
    for c in range(num_candidates):
        for p in range(num_panels):
            for t in range(num_slots):
                x[c, p, t] = model.NewBoolVar(f'x_c{c}_p{p}_t{t}')
                
    # Constraints
    # 1. Each candidate should be scheduled exactly once
    candidate_scheduled = []
    for c in range(num_candidates):
        is_scheduled = model.NewBoolVar(f'scheduled_c{c}')
        candidate_scheduled.append(is_scheduled)
        model.Add(sum(x[c, p, t] for p in range(num_panels) for t in range(num_slots)) == is_scheduled)

    # 2. Each panel can do at most one interview at a time
    for p in range(num_panels):
        for t in range(num_slots):
            model.Add(sum(x[c, p, t] for c in range(num_candidates)) <= 1)
            
    # 3. Each candidate can do at most one interview at a time (trivially satisfied since they only have 1 round for now, but good practice)
    for c in range(num_candidates):
        for t in range(num_slots):
            model.Add(sum(x[c, p, t] for p in range(num_panels)) <= 1)

    # 4. If offline, total concurrent interviews <= number of rooms
    if request.mode == InterviewMode.OFFLINE:
        num_rooms = len(rooms)
        for t in range(num_slots):
            model.Add(sum(x[c, p, t] for c in range(num_candidates) for p in range(num_panels)) <= num_rooms)
            
    # Objective: Maximize the number of scheduled candidates
    model.Maximize(sum(candidate_scheduled))
    
    # 4. Solve
    solver = cp_model.CpSolver()
    status = solver.Solve(model)
    
    unscheduled_candidates = []
    scheduled_count = 0
    
    if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
        # Create InterviewSlot objects
        new_slots = []
        for c in range(num_candidates):
            scheduled = False
            for p in range(num_panels):
                for t in range(num_slots):
                    if solver.Value(x[c, p, t]) == 1:
                        # Found assignment
                        room_id = None
                        if request.mode == InterviewMode.OFFLINE:
                            # Assign a room (simple round-robin or based on availability)
                            # Assuming num_concurrent <= num_rooms due to constraint
                            # Let's just pick the first available room for that timeslot (mocked)
                            room_id = rooms[scheduled_count % len(rooms)].room_id

                        slot_start, slot_end = time_slots[t]
                        
                        slot = InterviewSlot(
                            drive_id=uuid.UUID(drive_id),
                            application_id=candidates[c].application_id,
                            panel_id=panels[p].panel_id,
                            room_id=room_id,
                            mode=request.mode,
                            start_time=slot_start,
                            end_time=slot_end,
                            round=request.interview_round,
                            status=SlotStatus.DRAFT,
                            generated_by=SlotGenerator.AI_SCHEDULER,
                            meeting_link="https://meet.google.com/mock-link" if request.mode == InterviewMode.ONLINE else None
                        )
                        new_slots.append(slot)
                        scheduled = True
                        scheduled_count += 1
            if not scheduled:
                unscheduled_candidates.append(
                    UnscheduledCandidate(
                        application_id=candidates[c].application_id,
                        reason="No available panel/time capacity"
                    )
                )
                
        # Persist to DB
        if new_slots:
            # Optionally clear existing DRAFT slots for this drive/round?
            # stmt_delete = delete(InterviewSlot).where(...)
            db.add_all(new_slots)
            # Update drive status
            drive.status = "schedule_draft" # Assuming status is a string enum
            await db.commit()
            
        return ScheduleGenerateResponse(
            message="Scheduling completed successfully.",
            scheduled_count=scheduled_count,
            unscheduled_candidates=unscheduled_candidates
        )
    else:
        return ScheduleGenerateResponse(
            message="Could not find a feasible schedule.",
            scheduled_count=0,
            unscheduled_candidates=[
                UnscheduledCandidate(application_id=c.application_id, reason="Infeasible") 
                for c in candidates
            ]
        )
