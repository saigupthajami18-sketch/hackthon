"""
PlacementOps AI — Matching Service
Skill-overlap scoring + Gemini explanation generation.
No pgvector needed for hackathon — uses deterministic skill intersection
with Gemini for natural language explanation (falls back gracefully if no API key).
"""

import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.models.job_drive import JobDrive
from app.models.application import Application
from app.models.student import Student, Skill
from app.models import EligibilityStatus, ApplicationStatus, ShortlistStatus, DriveStatus
from app.config import settings


def _compute_skill_score(student_skill_names: list[str], required: list[str], preferred: list[str]) -> tuple[float, list[str]]:
    """
    Deterministic skill-overlap scoring (no LLM needed).
    Returns (score_0_to_100, skill_gap_list)
    """
    student_set = {s.lower().strip() for s in student_skill_names}
    required_lower = [s.lower().strip() for s in required]
    preferred_lower = [s.lower().strip() for s in preferred]

    required_matched = sum(1 for s in required_lower if s in student_set)
    preferred_matched = sum(1 for s in preferred_lower if s in student_set)

    required_score = (required_matched / len(required_lower) * 70) if required_lower else 70
    preferred_score = (preferred_matched / len(preferred_lower) * 30) if preferred_lower else 15

    final_score = round(required_score + preferred_score, 1)

    skill_gap = [s for s in required if s.lower() not in student_set]

    return final_score, skill_gap


def _build_explanation(student: Student, required: list[str], preferred: list[str],
                       score: float, skill_gap: list[str]) -> str:
    """Generate deterministic explanation without LLM."""
    skill_names = [sk.skill_name for sk in (student.skills or [])]
    matched_req = [s for s in required if s.lower() in {x.lower() for x in skill_names}]
    matched_pref = [s for s in preferred if s.lower() in {x.lower() for x in skill_names}]

    parts = []
    if matched_req:
        parts.append(f"Matched required: {', '.join(matched_req)}")
    if matched_pref:
        parts.append(f"Preferred matches: {', '.join(matched_pref)}")
    if skill_gap:
        parts.append(f"Gaps: {', '.join(skill_gap)}")

    cgpa_note = f"CGPA {student.cgpa}" if student.cgpa else ""
    summary = ". ".join(parts) if parts else "General profile match."
    return f"{summary}. {cgpa_note}. Overall fit: {score}/100."


async def _generate_gemini_explanation(student: Student, drive: JobDrive,
                                       score: float, skill_gap: list[str]) -> str | None:
    """Try Gemini; return None if no API key or any error."""
    if not settings.GEMINI_API_KEY:
        return None
    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel(settings.GEMINI_MODEL)

        required = drive.extracted_jd_json.get("required_skills", []) if drive.extracted_jd_json else drive.required_skills or []
        skill_names = [sk.skill_name for sk in (student.skills or [])]

        prompt = (
            f"You are a placement officer. Provide a concise 2-sentence explanation of why "
            f"this student (CGPA {student.cgpa}, branch {student.branch}, skills: {', '.join(skill_names)}) "
            f"scored {score}/100 for the role '{drive.title}' requiring {', '.join(required)}. "
            f"Skill gaps: {', '.join(skill_gap) if skill_gap else 'none'}. "
            f"Be factual and professional."
        )
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception:
        return None


async def run_matching(drive_id: str, db: AsyncSession) -> int:
    """
    Runs skill-overlap matching for all ELIGIBLE applications in a drive.
    Returns count of applications matched.
    """
    drive = await db.get(JobDrive, uuid.UUID(drive_id))
    if not drive:
        raise ValueError("Drive not found")

    # Extract required/preferred from confirmed JD or fallback to drive fields
    if drive.extracted_jd_json and drive.extraction_status and drive.extraction_status.value == "confirmed":
        required = drive.extracted_jd_json.get("required_skills", [])
        preferred = drive.extracted_jd_json.get("preferred_skills", [])
    else:
        required = drive.required_skills or []
        preferred = drive.preferred_skills or []

    # Fetch eligible applications WITH student skills loaded
    result = await db.execute(
        select(Application, Student)
        .join(Student, Application.student_id == Student.student_id)
        .options(selectinload(Student.skills))
        .where(Application.drive_id == uuid.UUID(drive_id))
        .where(Application.eligibility_status == EligibilityStatus.ELIGIBLE)
    )
    rows = result.all()

    if not rows:
        raise ValueError("No eligible applications found for this drive")

    for app, student in rows:
        skill_names = [sk.skill_name for sk in (student.skills or [])]
        score, skill_gap = _compute_skill_score(skill_names, required, preferred)

        # Try Gemini; fall back to deterministic explanation
        explanation = await _generate_gemini_explanation(student, drive, score, skill_gap)
        if not explanation:
            explanation = _build_explanation(student, required, preferred, score, skill_gap)

        app.match_score = score
        app.match_explanation = explanation
        app.skill_gap = skill_gap
        app.application_status = ApplicationStatus.MATCHED
        app.shortlist_status = ShortlistStatus.PENDING_APPROVAL

    drive.status = DriveStatus.MATCHING_COMPLETE
    await db.commit()
    return len(rows)
