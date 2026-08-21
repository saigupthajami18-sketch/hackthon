"""
PlacementOps AI — Drive Service (§8.1)
Manages Drive state machine transitions.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from app.models.job_drive import JobDrive
from app.models import DriveStatus, ExtractionStatus

async def publish_drive(drive: JobDrive, db: AsyncSession):
    """
    Transitions drive from DRAFT to PUBLISHED.
    Requires extraction_status to be CONFIRMED and eligibility criteria to be set.
    """
    if drive.status != DriveStatus.DRAFT:
        raise HTTPException(status_code=400, detail="Drive is not in DRAFT state.")

    if drive.extraction_status != ExtractionStatus.CONFIRMED:
        raise HTTPException(
            status_code=422,
            detail="JD extraction must be confirmed before publishing."
        )

    if not drive.eligibility_branches:
        raise HTTPException(
            status_code=422,
            detail="At least eligibility branches must be set before publishing."
        )

    drive.status = DriveStatus.PUBLISHED
    await db.commit()
    await db.refresh(drive)
    return drive


async def start_eligibility_run(drive: JobDrive, db: AsyncSession):
    if drive.status != DriveStatus.PUBLISHED:
        raise HTTPException(status_code=400, detail="Drive must be PUBLISHED to run eligibility.")
    
    drive.status = DriveStatus.ELIGIBILITY_RUNNING
    await db.commit()
    await db.refresh(drive)
    return drive


async def complete_eligibility_run(drive: JobDrive, db: AsyncSession):
    if drive.status != DriveStatus.ELIGIBILITY_RUNNING:
        raise HTTPException(status_code=400, detail="Drive is not running eligibility.")
    
    drive.status = DriveStatus.ELIGIBILITY_COMPLETE
    await db.commit()
    await db.refresh(drive)
    return drive
