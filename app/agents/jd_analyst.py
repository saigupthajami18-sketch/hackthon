"""
PlacementOps AI — JD Analyst Agent (§7.1)
Uses CrewAI with Google Gemini to extract structured data from Job Descriptions.
"""

from crewai import Agent, Task, Crew, Process
from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from app.config import settings

# ── Output Schema ─────────────────────────────────────────────────────────────

class JDExtractionResult(BaseModel):
    role: str = Field(description="The job role or title.")
    branches: List[str] = Field(description="Eligible engineering branches (e.g., ['CSE', 'IT']). Empty if any.")
    min_cgpa: Optional[float] = Field(description="Minimum CGPA required, if specified.")
    max_active_backlogs: Optional[int] = Field(description="Maximum allowed active backlogs, if specified.")
    graduation_years: List[int] = Field(description="Eligible graduation years (e.g., [2024, 2025]).")
    required_skills: List[str] = Field(description="Mandatory skills for the job.")
    preferred_skills: List[str] = Field(description="Nice-to-have or preferred skills.")
    ctc_range: Dict[str, float] = Field(description="CTC range in INR, e.g., {'min': 600000, 'max': 900000}.")
    employment_type: str = Field(description="One of: 'full_time', 'internship', 'intern_plus_ppo'.")
    ambiguous_fields: List[str] = Field(description="List of fields that were unclear or missing in the JD.")
    confidence: float = Field(description="Confidence score between 0.0 and 1.0 on the overall extraction quality.")


# ── Agent Definition ──────────────────────────────────────────────────────────

def extract_jd_data(raw_text: str) -> dict:
    """
    Runs the CrewAI agent to extract JD information.
    """
    llm = ChatGoogleGenerativeAI(
        model=settings.GEMINI_MODEL,
        google_api_key=settings.GEMINI_API_KEY,
        temperature=0.1
    )

    jd_analyst = Agent(
        role="Senior Technical Recruiter & Analyst",
        goal="Extract precise structured eligibility and skill requirements from a raw job description.",
        backstory=(
            "You are an expert technical recruiter analyzing job descriptions for campus placements. "
            "You accurately extract hard constraints (CGPA, branches, backlogs) and soft skills. "
            "You always normalize skill names to common industry standards."
        ),
        verbose=True,
        allow_delegation=False,
        llm=llm
    )

    extraction_task = Task(
        description=(
            f"Analyze the following Job Description and extract the required information.\n\n"
            f"Job Description:\n{raw_text}\n\n"
            f"Ensure you distinguish between required and preferred skills. If any hard constraint "
            f"(like CGPA or backlogs) is missing, note it in ambiguous_fields and lower the confidence."
        ),
        expected_output="A structured JSON object matching the JDExtractionResult schema.",
        agent=jd_analyst,
        output_json=JDExtractionResult
    )

    crew = Crew(
        agents=[jd_analyst],
        tasks=[extraction_task],
        process=Process.sequential,
        verbose=True
    )

    result = crew.kickoff()
    return result.json_dict
