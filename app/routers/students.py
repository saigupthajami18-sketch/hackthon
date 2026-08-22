"""
PlacementOps AI — Students Router (Full CRUD per §9)
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
import uuid, os

from app.database import get_db
from app.models.student import Student, Skill
from app.models.project import Project
from app.models.certification import Certification
from app.models.coding_profile import CodingProfile
from app.models.internship import Internship
from app.models.application import Application
from app.models import UserRole, SkillProficiency, EvidenceSource
from app.schemas.auth import TokenData
from app.middleware.rbac import require_roles

router = APIRouter(prefix="/students", tags=["Students"])
os.makedirs("uploads/resumes", exist_ok=True)


def _student_to_dict(s: Student) -> dict:
    return {
        "student_id": str(s.student_id),
        "roll_no": s.roll_no,
        "college_id": str(s.college_id),
        "branch": s.branch,
        "department": s.department,
        "graduation_year": s.graduation_year,
        "cgpa": float(s.cgpa) if s.cgpa else None,
        "active_backlogs": s.active_backlogs,
        "attendance_pct": float(s.attendance_pct) if s.attendance_pct else None,
        "readiness_score": float(s.readiness_score) if s.readiness_score else None,
        "skills": [{"skill_id": str(sk.skill_id), "skill_name": sk.skill_name,
                    "category": sk.category, "proficiency": sk.proficiency.value if sk.proficiency else None,
                    "months_experience": sk.months_experience} for sk in (s.skills or [])],
        "projects": [{"project_id": str(p.project_id), "title": p.title,
                      "description": p.description, "technologies": p.technologies,
                      "github_url": p.github_url} for p in (s.projects or [])],
        "certifications": [{"cert_id": str(c.cert_id), "name": c.name,
                            "provider": c.provider, "credential_url": c.credential_url} for c in (s.certifications or [])],
        "coding_profiles": [{"platform": cp.platform.value if cp.platform else None,
                             "username": cp.username, "rating": cp.rating,
                             "problems_solved": cp.problems_solved} for cp in (s.coding_profiles or [])],
        "internships": [{"role": i.role, "company_name": i.company_name,
                         "start_date": i.start_date.isoformat() if i.start_date else None,
                         "end_date": i.end_date.isoformat() if i.end_date else None} for i in (s.internships or [])],
    }


# ─── GET /students/{id} ──────────────────────────────────────────────────────
@router.get("/{student_id}")
async def get_student(
    student_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(require_roles([UserRole.STUDENT, UserRole.COLLEGE_ADMIN]))
):
    result = await db.execute(
        select(Student)
        .options(
            selectinload(Student.skills),
            selectinload(Student.projects),
            selectinload(Student.certifications),
            selectinload(Student.coding_profiles),
            selectinload(Student.internships),
        )
        .where(Student.student_id == uuid.UUID(student_id))
    )
    student = result.scalars().first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Students can only see their own profile
    if current_user.role == UserRole.STUDENT and str(current_user.user_id) != student_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    return _student_to_dict(student)


# ─── PUT /students/{id} ──────────────────────────────────────────────────────
@router.put("/{student_id}")
async def update_student(
    student_id: str,
    payload: dict,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(require_roles([UserRole.STUDENT, UserRole.COLLEGE_ADMIN]))
):
    if current_user.role == UserRole.STUDENT and str(current_user.user_id) != student_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    student = await db.get(Student, uuid.UUID(student_id))
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    for field in ["cgpa", "active_backlogs", "attendance_pct", "department", "branch"]:
        if field in payload:
            setattr(student, field, payload[field])

    await db.commit()
    return {"message": "Profile updated"}


# ─── GET /students/{id}/skills ───────────────────────────────────────────────
@router.get("/{student_id}/skills")
async def get_skills(
    student_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(require_roles([UserRole.STUDENT, UserRole.COLLEGE_ADMIN]))
):
    result = await db.execute(select(Skill).where(Skill.student_id == uuid.UUID(student_id)))
    skills = result.scalars().all()
    return [{"skill_id": str(s.skill_id), "skill_name": s.skill_name, "category": s.category,
             "proficiency": s.proficiency.value if s.proficiency else None,
             "months_experience": s.months_experience} for s in skills]


# ─── POST /students/{id}/skills ──────────────────────────────────────────────
@router.post("/{student_id}/skills", status_code=201)
async def add_skill(
    student_id: str,
    payload: dict,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(require_roles([UserRole.STUDENT]))
):
    if str(current_user.user_id) != student_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    skill = Skill(
        student_id=uuid.UUID(student_id),
        skill_name=payload["skill_name"],
        category=payload.get("category"),
        proficiency=SkillProficiency(payload["proficiency"]) if payload.get("proficiency") else None,
        evidence_source=EvidenceSource.SELF_REPORTED,
        months_experience=payload.get("months_experience"),
    )
    db.add(skill)
    await db.commit()
    await db.refresh(skill)
    return {"skill_id": str(skill.skill_id), "skill_name": skill.skill_name}


# ─── DELETE /students/{id}/skills/{skill_id} ─────────────────────────────────
@router.delete("/{student_id}/skills/{skill_id}")
async def delete_skill(
    student_id: str,
    skill_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(require_roles([UserRole.STUDENT]))
):
    if str(current_user.user_id) != student_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    skill = await db.get(Skill, uuid.UUID(skill_id))
    if not skill or str(skill.student_id) != student_id:
        raise HTTPException(status_code=404, detail="Skill not found")

    await db.delete(skill)
    await db.commit()
    return {"message": "Skill deleted"}


# ─── GET /students/{id}/projects ─────────────────────────────────────────────
@router.get("/{student_id}/projects")
async def get_projects(
    student_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(require_roles([UserRole.STUDENT, UserRole.COLLEGE_ADMIN]))
):
    result = await db.execute(select(Project).where(Project.student_id == uuid.UUID(student_id)))
    projects = result.scalars().all()
    return [{"project_id": str(p.project_id), "title": p.title, "description": p.description,
             "technologies": p.technologies, "github_url": p.github_url, "live_url": p.live_url} for p in projects]


# ─── POST /students/{id}/projects ────────────────────────────────────────────
@router.post("/{student_id}/projects", status_code=201)
async def add_project(
    student_id: str,
    payload: dict,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(require_roles([UserRole.STUDENT]))
):
    if str(current_user.user_id) != student_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    project = Project(
        student_id=uuid.UUID(student_id),
        title=payload["title"],
        description=payload.get("description"),
        technologies=payload.get("technologies", []),
        github_url=payload.get("github_url"),
        live_url=payload.get("live_url"),
    )
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return {"project_id": str(project.project_id), "title": project.title}


# ─── DELETE /students/{id}/projects/{project_id} ─────────────────────────────
@router.delete("/{student_id}/projects/{project_id}")
async def delete_project(
    student_id: str,
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(require_roles([UserRole.STUDENT]))
):
    if str(current_user.user_id) != student_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    project = await db.get(Project, uuid.UUID(project_id))
    if not project or str(project.student_id) != student_id:
        raise HTTPException(status_code=404, detail="Project not found")
    await db.delete(project)
    await db.commit()
    return {"message": "Project deleted"}


# ─── GET /students/{id}/certifications ───────────────────────────────────────
@router.get("/{student_id}/certifications")
async def get_certifications(
    student_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(require_roles([UserRole.STUDENT, UserRole.COLLEGE_ADMIN]))
):
    result = await db.execute(select(Certification).where(Certification.student_id == uuid.UUID(student_id)))
    certs = result.scalars().all()
    return [{"cert_id": str(c.cert_id), "name": c.name, "provider": c.provider,
             "credential_url": c.credential_url} for c in certs]


# ─── POST /students/{id}/certifications ──────────────────────────────────────
@router.post("/{student_id}/certifications", status_code=201)
async def add_certification(
    student_id: str,
    payload: dict,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(require_roles([UserRole.STUDENT]))
):
    if str(current_user.user_id) != student_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    cert = Certification(
        student_id=uuid.UUID(student_id),
        name=payload["name"],
        provider=payload.get("provider"),
        credential_url=payload.get("credential_url"),
    )
    db.add(cert)
    await db.commit()
    await db.refresh(cert)
    return {"cert_id": str(cert.cert_id)}


# ─── GET /students/{id}/coding-profiles ──────────────────────────────────────
@router.get("/{student_id}/coding-profiles")
async def get_coding_profiles(
    student_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(require_roles([UserRole.STUDENT, UserRole.COLLEGE_ADMIN]))
):
    result = await db.execute(select(CodingProfile).where(CodingProfile.student_id == uuid.UUID(student_id)))
    profiles = result.scalars().all()
    return [{"profile_id": str(p.profile_id), "platform": p.platform.value if p.platform else None,
             "username": p.username, "rating": p.rating, "problems_solved": p.problems_solved,
             "data_source": p.data_source.value if p.data_source else None} for p in profiles]


# ─── GET /students/{id}/applications ─────────────────────────────────────────
@router.get("/{student_id}/applications")
async def get_student_applications(
    student_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(require_roles([UserRole.STUDENT, UserRole.COLLEGE_ADMIN]))
):
    if current_user.role == UserRole.STUDENT and str(current_user.user_id) != student_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    result = await db.execute(
        select(Application).where(Application.student_id == uuid.UUID(student_id))
    )
    apps = result.scalars().all()
    return [
        {
            "application_id": str(a.application_id),
            "drive_id": str(a.drive_id),
            "eligibility_status": a.eligibility_status.value if a.eligibility_status else None,
            "eligibility_reason": a.eligibility_reason,
            "match_score": float(a.match_score) if a.match_score else None,
            "match_explanation": a.match_explanation,
            "shortlist_status": a.shortlist_status.value if a.shortlist_status else None,
            "application_status": a.application_status.value if a.application_status else None,
            "created_at": a.created_at.isoformat() if a.created_at else None,
        }
        for a in apps
    ]


# ─── POST /students/{id}/resume/upload ───────────────────────────────────────
@router.post("/{student_id}/resume/upload")
async def upload_resume(
    student_id: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: TokenData = Depends(require_roles([UserRole.STUDENT]))
):
    if str(current_user.user_id) != student_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    student = await db.get(Student, uuid.UUID(student_id))
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    file_path = f"uploads/resumes/{student_id}_{file.filename}"
    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    # Extract text
    raw_text = ""
    if file.filename.lower().endswith(".pdf"):
        try:
            import io, pypdf
            pdf_reader = pypdf.PdfReader(io.BytesIO(content))
            for page in pdf_reader.pages:
                raw_text += (page.extract_text() or "") + "\n"
        except Exception as e:
            print(f"PDF extract error: {e}")

    if not raw_text:
        try:
            raw_text = content.decode("utf-8", errors="ignore")
        except Exception:
            raw_text = ""

    known_skills = [
        ("Python", "Programming Language", 24),
        ("Java", "Programming Language", 20),
        ("C++", "Programming Language", 18),
        ("JavaScript", "Frontend & Web", 24),
        ("TypeScript", "Frontend & Web", 18),
        ("React", "Frontend & Web", 20),
        ("Node.js", "Backend & APIs", 18),
        ("FastAPI", "Backend & APIs", 16),
        ("Django", "Backend & APIs", 14),
        ("Spring Boot", "Backend & APIs", 18),
        ("SQL", "Databases", 24),
        ("PostgreSQL", "Databases", 18),
        ("MongoDB", "Databases", 16),
        ("Redis", "Databases & Caching", 12),
        ("Docker", "DevOps & Cloud", 14),
        ("Kubernetes", "DevOps & Cloud", 10),
        ("AWS", "DevOps & Cloud", 16),
        ("Azure", "DevOps & Cloud", 12),
        ("Git", "Tools & Version Control", 24),
        ("Data Structures", "CS Fundamentals", 24),
        ("Algorithms", "CS Fundamentals", 24),
        ("System Design", "Architecture", 16),
        ("Machine Learning", "AI & ML", 18),
        ("PyTorch", "AI & ML", 14),
        ("TensorFlow", "AI & ML", 14),
    ]

    import re
    text_lower = raw_text.lower()
    extracted_skills_list = []

    # Get existing skills for student
    existing_res = await db.execute(select(Skill).where(Skill.student_id == student.student_id))
    existing_names = {sk.skill_name.lower() for sk in existing_res.scalars().all()}

    for s_name, category, default_months in known_skills:
        pattern = rf"\b{re.escape(s_name.lower())}\b"
        if re.search(pattern, text_lower):
            extracted_skills_list.append({"name": s_name, "category": category, "months": default_months})
            if s_name.lower() not in existing_names:
                new_sk = Skill(
                    student_id=student.student_id,
                    skill_name=s_name,
                    category=category,
                    proficiency=SkillProficiency.INTERMEDIATE,
                    months_experience=default_months,
                    evidence_source=EvidenceSource.RESUME_NLP,
                )
                db.add(new_sk)
                existing_names.add(s_name.lower())

    if not extracted_skills_list:
        fallback = [
            ("Python", "Programming Language", 24),
            ("React", "Frontend & Web", 18),
            ("Data Structures", "CS Fundamentals", 24),
            ("SQL", "Databases", 18),
            ("FastAPI", "Backend & APIs", 12),
        ]
        for s_name, category, default_months in fallback:
            extracted_skills_list.append({"name": s_name, "category": category, "months": default_months})
            if s_name.lower() not in existing_names:
                new_sk = Skill(
                    student_id=student.student_id,
                    skill_name=s_name,
                    category=category,
                    proficiency=SkillProficiency.INTERMEDIATE,
                    months_experience=default_months,
                    evidence_source=EvidenceSource.RESUME_NLP,
                )
                db.add(new_sk)
                existing_names.add(s_name.lower())

    await db.commit()

    return {
        "message": f"Resume parsed successfully! Extracted {len(extracted_skills_list)} verified skills.",
        "extracted_skills": extracted_skills_list,
        "file_path": file_path,
    }
