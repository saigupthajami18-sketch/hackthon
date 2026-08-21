"""
PlacementOps AI — Matching Service (§8.2)
Uses Gemini for embeddings and pgvector for semantic search.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import text
from app.models.job_drive import JobDrive
from app.models.application import Application
from app.models.student import Student
from app.models import EligibilityStatus, ApplicationStatus
import google.generativeai as genai
from app.config import settings
import json

genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel(settings.GEMINI_MODEL)

async def get_embedding(text: str) -> list[float]:
    """Get embedding using Gemini."""
    result = genai.embed_content(
        model="models/text-embedding-004",
        content=text,
        task_type="retrieval_document"
    )
    return result['embedding']


async def generate_match_explanation(student: Student, drive: JobDrive, score: float) -> str:
    """Generate a natural language explanation for the match score."""
    prompt = f"""
    You are an AI placement assistant. Explain why this student is a good or bad fit for the job.
    
    Job Requirements:
    - Required Skills: {drive.extracted_jd_json.get('required_skills', [])}
    - Preferred Skills: {drive.extracted_jd_json.get('preferred_skills', [])}
    
    Student Profile:
    - Branch: {student.branch}
    - CGPA: {student.cgpa}
    
    Match Score: {score}/100
    
    Provide a concise, 2-3 sentence explanation for the recruiter.
    """
    
    response = model.generate_content(prompt)
    return response.text.strip()


async def run_matching(drive_id: str, db: AsyncSession):
    """
    Runs semantic matching for all ELIGIBLE applications in a drive.
    """
    drive = await db.get(JobDrive, drive_id)
    if not drive or not drive.extracted_jd_json:
        raise ValueError("Drive not found or JD not extracted")

    # Embed the JD required skills
    jd_skills = " ".join(drive.extracted_jd_json.get('required_skills', []))
    if not jd_skills:
        jd_skills = drive.raw_jd_text[:1000] # fallback

    jd_embedding = await get_embedding(jd_skills)

    # Fetch eligible applications
    result = await db.execute(
        select(Application, Student)
        .join(Student, Application.student_id == Student.student_id)
        .where(Application.drive_id == drive.drive_id)
        .where(Application.eligibility_status == EligibilityStatus.ELIGIBLE)
    )
    
    applications = result.all()

    for app, student in applications:
        # In a real app with pgvector, we would do an exact vector distance query in SQL.
        # e.g., db.execute(text("SELECT embedding <=> :jd_emb FROM students WHERE id = :id"))
        
        # For hackathon mockup, we'll assign a simulated score based on a dummy calculation 
        # or we could assume the student has an embedding and compute cosine similarity in Python.
        
        # Simulate match score (0-100)
        match_score = 85.0 # Replace with actual vector distance
        
        explanation = await generate_match_explanation(student, drive, match_score)
        
        app.match_score = match_score
        app.match_explanation = explanation
        app.status = ApplicationStatus.SHORTLISTED # Or APPLIED depending on workflow

    await db.commit()
    return len(applications)
