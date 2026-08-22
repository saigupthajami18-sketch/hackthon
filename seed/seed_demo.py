"""
PlacementOps AI — Master Demo Seeder (Kaggle-Quality Dataset)
=============================================================================================
Populates:
  1. National Institute of Technology & Engineering  (college)
  2. College Admin:           admin@tech.edu           / password123
  3. 5 Top-Tier Companies (Microsoft, Google, Adobe, Amazon, Infosys) + 1 Recruiter each
  4. 50 Realistic Engineering Students with:
       - CGPA range 6.2–9.8, realistic backlog distribution
       - Diverse skill stacks (Full Stack, ML, Backend, Cloud Native, Mobile/Android)
       - 2 Projects per student with GitHub links
       - LeetCode + GitHub coding profiles (synthetic, marked as demo_synthetic)
       - 1–2 Certifications per student (AWS, GCP, Coursera, Oracle)
       - Internship records for ~40% of students
       - Attendance 72%–98%
  5. 5 Placement Drives at varying pipeline stages
  6. Full Microsoft Drive pipeline: applications → eligible → matched → shortlisted
       → interview slots (confirmed) → 3 offers issued
  7. Rooms, Panels, Notifications, Audit Logs
=============================================================================================
Run:  python -m seed.seed_demo
"""

import asyncio
import uuid
import random
from datetime import datetime, timedelta, date

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.database import async_session, engine, Base
from app.models.user import User
from app.models.student import Student, Skill
from app.models.project import Project
from app.models.coding_profile import CodingProfile
from app.models.certification import Certification
from app.models.internship import Internship
from app.models.college import College
from app.models.company import Company
from app.models.job_drive import JobDrive
from app.models.room import Room
from app.models.panel import Panel
from app.models.application import Application
from app.models.interview_slot import InterviewSlot
from app.models.offer import Offer
from app.models.notification import Notification
from app.models.audit_log import AuditLog
from app.models import (
    UserRole, SkillProficiency, EvidenceSource, CodingPlatform,
    DataSource, DriveStatus, ExtractionStatus, EmploymentType,
    InterviewMode, InterviewRound, SlotStatus, SlotGenerator,
    EligibilityStatus, ApplicationStatus, ShortlistStatus,
    PanelMemberType, OfferStatus, NotificationType, NotificationChannel,
    NotificationStatus, ActorType,
)
from app.services.auth_service import get_password_hash

# ─── Student Data Pool ───────────────────────────────────────────────────────
FIRST_NAMES = [
    "Aditya", "Rohan", "Sneha", "Pooja", "Vikram", "Ananya", "Rahul", "Karthik", "Priya", "Nikhil",
    "Deepak", "Swati", "Arjun", "Neha", "Varun", "Shruti", "Gaurav", "Divya", "Suresh", "Megha",
    "Amit", "Tanvi", "Sanjay", "Ritu", "Harish", "Kavita", "Abhishek", "Pallavi", "Manish", "Shilpa",
    "Ravi", "Preeti", "Ajay", "Smitha", "Vinay", "Lakshmi", "Sunil", "Chitra", "Prasad", "Geeta",
]
LAST_NAMES = [
    "Sharma", "Verma", "Patel", "Iyer", "Mehta", "Reddy", "Nair", "Kulkarni",
    "Gupta", "Rao", "Joshi", "Bose", "Choudhury", "Menon", "Singh", "Kumar",
]

# 5 distinct tech stacks to make matching interesting
TECH_STACKS = [
    {
        "stack": "Full Stack",
        "skills": [
            ("React", "Framework", "advanced", 24),
            ("Node.js", "Runtime", "advanced", 20),
            ("TypeScript", "Language", "intermediate", 18),
            ("PostgreSQL", "Database", "intermediate", 18),
            ("Docker", "Tool", "intermediate", 12),
            ("REST APIs", "Architecture", "advanced", 24),
        ],
        "projects": [
            ("E-Commerce Platform", "Full-stack marketplace with React frontend, Node.js backend, Stripe payments, and PostgreSQL.", ["React", "Node.js", "PostgreSQL", "Stripe", "Docker"]),
            ("Real-Time Chat App", "WebSocket-based chat with rooms, file sharing, and end-to-end encryption.", ["React", "Socket.io", "Redis", "Node.js"]),
        ],
        "certs": [("Meta Front-End Developer", "Coursera"), ("AWS Cloud Practitioner", "Amazon")],
        "lc_range": (1600, 2000),
        "lc_problems": (150, 300),
    },
    {
        "stack": "ML / AI",
        "skills": [
            ("Python", "Language", "advanced", 30),
            ("PyTorch", "Framework", "intermediate", 18),
            ("Scikit-Learn", "Library", "advanced", 24),
            ("Pandas", "Library", "advanced", 24),
            ("SQL", "Language", "intermediate", 18),
            ("Data Structures", "CS Fundamentals", "intermediate", 24),
        ],
        "projects": [
            ("Resume Parser & JD Matcher", "NLP-based system that extracts skills from resumes and ranks candidates for job descriptions using BERT embeddings.", ["Python", "HuggingFace", "FastAPI", "PostgreSQL"]),
            ("Stock Price Predictor", "LSTM + Transformer hybrid model for intraday stock prediction with 79% directional accuracy.", ["Python", "PyTorch", "yfinance", "Streamlit"]),
        ],
        "certs": [("Deep Learning Specialization", "Coursera"), ("Google Professional ML Engineer", "Google")],
        "lc_range": (1400, 1800),
        "lc_problems": (120, 220),
    },
    {
        "stack": "Backend / Systems",
        "skills": [
            ("Python", "Language", "advanced", 30),
            ("FastAPI", "Framework", "advanced", 20),
            ("System Design", "Architecture", "intermediate", 24),
            ("PostgreSQL", "Database", "advanced", 24),
            ("Redis", "Cache", "intermediate", 18),
            ("REST APIs", "Architecture", "advanced", 24),
            ("Data Structures", "CS Fundamentals", "advanced", 30),
        ],
        "projects": [
            ("Distributed Task Queue", "High-throughput async worker queue with Redis and Raft consensus for fault tolerance.", ["Python", "FastAPI", "Redis", "Docker", "PostgreSQL"]),
            ("API Gateway & Rate Limiter", "Custom reverse proxy with token-bucket rate limiting, circuit breakers, and distributed tracing.", ["Go", "Redis", "Prometheus", "Docker"]),
        ],
        "certs": [("AWS Solutions Architect Associate", "Amazon"), ("Oracle Java SE 11", "Oracle")],
        "lc_range": (1750, 2200),
        "lc_problems": (280, 450),
    },
    {
        "stack": "Cloud Native / DevOps",
        "skills": [
            ("AWS", "Cloud", "intermediate", 18),
            ("Docker", "Tool", "advanced", 20),
            ("Kubernetes", "Orchestration", "intermediate", 12),
            ("Python", "Language", "intermediate", 18),
            ("Linux", "OS", "advanced", 36),
            ("CI/CD", "DevOps", "intermediate", 14),
        ],
        "projects": [
            ("Kubernetes Multi-Tenant Cluster", "Deployed a production-grade K8s cluster on AWS EKS with auto-scaling, RBAC, and Helm charts.", ["Kubernetes", "AWS EKS", "Helm", "Prometheus", "Grafana"]),
            ("MLOps Pipeline", "End-to-end MLOps pipeline on GCP with Kubeflow, automated retraining, and A/B deployment.", ["GCP", "Kubeflow", "Docker", "Python", "Airflow"]),
        ],
        "certs": [("AWS DevOps Professional", "Amazon"), ("Google Cloud Professional DevOps Engineer", "Google")],
        "lc_range": (1500, 1900),
        "lc_problems": (100, 180),
    },
    {
        "stack": "Java / Spring",
        "skills": [
            ("Java", "Language", "advanced", 30),
            ("Spring Boot", "Framework", "advanced", 24),
            ("MySQL", "Database", "advanced", 24),
            ("REST APIs", "Architecture", "advanced", 24),
            ("Kafka", "Messaging", "intermediate", 12),
            ("System Design", "Architecture", "intermediate", 18),
        ],
        "projects": [
            ("Banking Microservices Platform", "12 microservices with Spring Boot, Kafka event streaming, circuit breakers, and distributed transactions.", ["Java", "Spring Boot", "Kafka", "Docker", "MySQL"]),
            ("Inventory Management System", "Real-time inventory tracking with barcode scanning, alerts, and analytics dashboard.", ["Java", "Spring MVC", "Thymeleaf", "MySQL", "Bootstrap"]),
        ],
        "certs": [("Spring Professional Certification", "VMware"), ("Oracle Certified Professional Java SE 11", "Oracle")],
        "lc_range": (1550, 1950),
        "lc_problems": (200, 350),
    },
]

BRANCHES = ["CSE", "CSE", "CSE", "IT", "ECE", "CSE", "IT"]  # CSE-heavy

COMPANY_DATA = [
    {
        "name": "Microsoft",
        "industry": "Cloud & Enterprise Software",
        "email": "recruiter@microsoft.com",
        "recruiter": "Siddharth Rao",
        "drive": {
            "title": "Software Development Engineer - 1",
            "ctc_min": 2450000, "ctc_max": 2450000,
            "min_cgpa": 7.5, "max_backlogs": 0,
            "branches": ["CSE", "IT", "ECE"],
            "grad_years": ["2027"],
            "required_skills": ["Python", "Data Structures", "REST APIs", "System Design", "SQL"],
            "preferred_skills": ["Azure", "Docker", "Distributed Systems"],
            "status": DriveStatus.SCHEDULE_CONFIRMED,
            "jd_text": """Microsoft SDE-1 Role – Cloud & Enterprise
            We are looking for sharp software engineers to join our Azure team.
            Required: Python or Java, solid DSA (LeetCode 200+ problems preferred),
            REST API design, SQL. CGPA >= 7.5, no active backlogs, CSE/IT/ECE.
            Location: Hyderabad / Bengaluru. Package: ₹24.5 LPA.
            Preferred: Docker, Azure experience, distributed systems knowledge.""",
        }
    },
    {
        "name": "Google",
        "industry": "Search & Cloud Infrastructure",
        "email": "recruiter@google.com",
        "recruiter": "Ananya Sen",
        "drive": {
            "title": "Software Engineer (New Grad)",
            "ctc_min": 3200000, "ctc_max": 4000000,
            "min_cgpa": 8.0, "max_backlogs": 0,
            "branches": ["CSE", "IT"],
            "grad_years": ["2027"],
            "required_skills": ["Data Structures", "Algorithms", "System Design", "Python"],
            "preferred_skills": ["Kubernetes", "Distributed Systems", "Go"],
            "status": DriveStatus.SHORTLIST_APPROVED,
            "jd_text": """Google New Grad SWE – Infrastructure
            Join Google's infrastructure team. Strong DSA required (LeetCode Hard).
            CGPA >= 8.0, CSE/IT only. Package: ₹32-40 LPA.
            We value problem-solving, not just frameworks.""",
        }
    },
    {
        "name": "Adobe",
        "industry": "Digital Media & Creative Cloud",
        "email": "recruiter@adobe.com",
        "recruiter": "Vikram Sethi",
        "drive": {
            "title": "Member of Technical Staff",
            "ctc_min": 2200000, "ctc_max": 2800000,
            "min_cgpa": 7.0, "max_backlogs": 1,
            "branches": ["CSE", "IT", "ECE"],
            "grad_years": ["2027"],
            "required_skills": ["React", "JavaScript", "REST APIs", "System Design"],
            "preferred_skills": ["TypeScript", "AWS", "GraphQL"],
            "status": DriveStatus.ELIGIBILITY_COMPLETE,
            "jd_text": """Adobe MTS – Creative Cloud Platform
            We build tools used by 25M+ creatives. Looking for full-stack engineers.
            Required: React, JavaScript, REST APIs. CGPA >= 7.0. Backlogs <= 1.
            Package: ₹22-28 LPA. Location: Noida / Bengaluru.""",
        }
    },
    {
        "name": "Amazon AWS",
        "industry": "E-Commerce & Cloud Platforms",
        "email": "recruiter@amazon.com",
        "recruiter": "Pooja Hegde",
        "drive": {
            "title": "SDE-1 (Amazon Web Services)",
            "ctc_min": 2600000, "ctc_max": 3400000,
            "min_cgpa": 7.0, "max_backlogs": 0,
            "branches": ["CSE", "IT", "ECE"],
            "grad_years": ["2027"],
            "required_skills": ["Java", "Data Structures", "System Design", "AWS"],
            "preferred_skills": ["Docker", "Kubernetes", "Python", "Kafka"],
            "status": DriveStatus.PUBLISHED,
            "jd_text": """Amazon SDE-1 – AWS Platform
            Build services at massive scale. Strong DSA + Java required.
            OOP expertise mandatory. AWS knowledge preferred.
            CGPA >= 7.0, no backlogs. Package: ₹26-34 LPA.""",
        }
    },
    {
        "name": "Infosys",
        "industry": "Global IT Services & Consulting",
        "email": "recruiter@infosys.com",
        "recruiter": "Ravi Shankar",
        "drive": {
            "title": "Systems Engineer",
            "ctc_min": 360000, "ctc_max": 450000,
            "min_cgpa": 6.5, "max_backlogs": 1,
            "branches": ["CSE", "IT", "ECE", "MECH"],
            "grad_years": ["2027"],
            "required_skills": ["Java", "Python", "SQL"],
            "preferred_skills": ["Spring Boot", "MySQL", "REST APIs"],
            "status": DriveStatus.PUBLISHED,
            "jd_text": """Infosys Systems Engineer
            Entry-level role for all engineering branches.
            Basic programming in Java or Python required. SQL proficiency needed.
            CGPA >= 6.5, backlogs <= 1. Package: ₹3.6-4.5 LPA.""",
        }
    },
]


async def seed_master_data(db: AsyncSession):
    print("\n[INFO] Starting PlacementOps AI Master Demo Seeder...")
    print("=" * 70)

    DEFAULT_PW_HASH = get_password_hash("password123")

    # ── 1. College ────────────────────────────────────────────────────────────
    college = College(
        name="National Institute of Technology & Engineering",
        domain="tech.edu",
        accreditation_info="NAAC A++ | NIRF Rank 12",
    )
    db.add(college)
    await db.flush()
    print(f"[OK] College created: {college.name} (domain: tech.edu)")

    # ── 2. College Admin ──────────────────────────────────────────────────────
    admin_user = User(
        role=UserRole.COLLEGE_ADMIN,
        org_id=college.college_id,
        name="Dr. Rajesh Raman",
        email="admin@tech.edu",
        phone="+91 9876500001",
        password_hash=DEFAULT_PW_HASH,
        is_verified=True,
    )
    db.add(admin_user)
    print("[OK] College admin created: admin@tech.edu")

    # ── 3. Rooms ──────────────────────────────────────────────────────────────
    rooms = []
    for r_num in ["301", "302", "303", "401", "402", "403"]:
        room = Room(
            college_id=college.college_id,
            name=f"Academic Block B — Room {r_num}",
            location="Block B, Ground Floor" if int(r_num) < 400 else "Block B, First Floor",
            capacity=1,
        )
        db.add(room)
        rooms.append(room)
    await db.flush()
    print(f"[OK] {len(rooms)} interview rooms created")

    # ── 4. Companies & Recruiters ─────────────────────────────────────────────
    company_objs = []
    for c_info in COMPANY_DATA:
        comp = Company(name=c_info["name"], industry=c_info["industry"])
        db.add(comp)
        await db.flush()
        company_objs.append(comp)

        recruiter = User(
            role=UserRole.COMPANY_RECRUITER,
            org_id=comp.company_id,
            name=c_info["recruiter"],
            email=c_info["email"],
            phone=f"+91 98765{random.randint(10000,99999)}",
            password_hash=DEFAULT_PW_HASH,
            is_verified=True,
        )
        db.add(recruiter)
    print(f"[OK] {len(COMPANY_DATA)} companies + recruiters created")

    # ── 5. 50 Students ────────────────────────────────────────────────────────
    student_objects = []
    used_emails = set()

    for i in range(1, 51):
        first = random.choice(FIRST_NAMES)
        last = random.choice(LAST_NAMES)
        full_name = f"{first} {last}"

        if i == 1:
            email = "student@tech.edu"  # Primary demo student
            cgpa_val = 8.85
            branch_choice = "CSE"
            backlogs = 0
            stack_idx = 2  # Backend/Systems — best match for Microsoft
        else:
            base_email = f"{first.lower()}.{last.lower()}{i}@tech.edu"
            email = base_email if base_email not in used_emails else f"s{i}@tech.edu"
            used_emails.add(email)

            # CGPA distribution: 10% below 7.0, 30% 7.0-7.5, 40% 7.5-8.5, 20% above 8.5
            rand = random.random()
            if rand < 0.10:
                cgpa_val = round(random.uniform(6.2, 7.0), 2)
            elif rand < 0.40:
                cgpa_val = round(random.uniform(7.0, 7.5), 2)
            elif rand < 0.80:
                cgpa_val = round(random.uniform(7.5, 8.5), 2)
            else:
                cgpa_val = round(random.uniform(8.5, 9.8), 2)

            # Backlogs: 80% have 0, 15% have 1, 5% have 2
            rand_b = random.random()
            backlogs = 0 if rand_b < 0.80 else (1 if rand_b < 0.95 else 2)
            branch_choice = random.choice(BRANCHES)
            stack_idx = random.randint(0, len(TECH_STACKS) - 1)

        stack = TECH_STACKS[stack_idx]

        user = User(
            role=UserRole.STUDENT,
            org_id=college.college_id,
            name=full_name,
            email=email,
            phone=f"+91 9{random.randint(100000000, 999999999)}",
            password_hash=DEFAULT_PW_HASH,
            is_verified=True,
        )
        db.add(user)
        await db.flush()

        student = Student(
            student_id=user.user_id,
            roll_no=f"23{branch_choice[:2]}{str(i).zfill(3)}",
            college_id=college.college_id,
            branch=branch_choice,
            department=f"Department of {branch_choice}",
            graduation_year=2027,
            cgpa=cgpa_val,
            active_backlogs=backlogs,
            total_backlogs_history=backlogs,
            attendance_pct=round(random.uniform(72, 98), 1),
            semester_gpas=[
                {"semester": s, "gpa": round(random.uniform(max(6.0, cgpa_val - 1.5), min(10.0, cgpa_val + 1.0)), 2)}
                for s in range(1, 7)
            ],
        )
        db.add(student)

        # Skills
        for skill_name, category, proficiency, months in stack["skills"]:
            # Add slight randomness — some students miss 1-2 skills
            if i > 1 and random.random() < 0.2:
                continue
            skill = Skill(
                student_id=user.user_id,
                skill_name=skill_name,
                category=category,
                proficiency=SkillProficiency(proficiency),
                evidence_source=EvidenceSource.PROJECT_LINKED,
                months_experience=months + random.randint(-3, 6),
            )
            db.add(skill)

        # Projects
        for proj_title, proj_desc, techs in stack["projects"]:
            project = Project(
                student_id=user.user_id,
                title=proj_title,
                description=proj_desc,
                technologies=techs,
                github_url=f"https://github.com/{first.lower()}/{proj_title.lower().replace(' ', '-')}",
                team_size=random.randint(1, 4),
                duration_months=random.randint(2, 6),
            )
            db.add(project)

        # LeetCode profile
        lc_rating = random.randint(*stack["lc_range"])
        lc_problems = random.randint(*stack["lc_problems"])
        lc_profile = CodingProfile(
            student_id=user.user_id,
            platform=CodingPlatform.LEETCODE,
            username=f"{first.lower()}_{last.lower()}_{i}",
            profile_url=f"https://leetcode.com/{first.lower()}{i}",
            rating=lc_rating,
            problems_solved=lc_problems,
            contests_count=random.randint(5, 40),
            data_source=DataSource.DEMO_SYNTHETIC,
            last_synced_at=datetime.utcnow() - timedelta(days=random.randint(1, 30)),
        )
        db.add(lc_profile)

        # GitHub profile
        gh_profile = CodingProfile(
            student_id=user.user_id,
            platform=CodingPlatform.GITHUB,
            username=f"{first.lower()}-{last.lower()}",
            profile_url=f"https://github.com/{first.lower()}-{last.lower()}",
            data_source=DataSource.DEMO_SYNTHETIC,
            last_synced_at=datetime.utcnow(),
        )
        db.add(gh_profile)

        # Certifications
        for cert_name, cert_provider in stack["certs"]:
            cert = Certification(
                student_id=user.user_id,
                name=cert_name,
                provider=cert_provider,
                issue_date=datetime.utcnow() - timedelta(days=random.randint(90, 500)),
                credential_url=f"https://credential.example.com/{uuid.uuid4().hex[:12]}",
            )
            db.add(cert)

        # Internships (40% of students)
        if i > 1 and random.random() < 0.40:
            intern_companies = ["Wipro Technologies", "TCS Innovation Lab", "Zoho Corp", "Freshworks", "PhonePe", "CRED", "Meesho"]
            internship = Internship(
                student_id=user.user_id,
                company_name=random.choice(intern_companies),
                role=f"{stack['stack']} Intern",
                start_date=datetime.utcnow() - timedelta(days=random.randint(180, 400)),
                end_date=datetime.utcnow() - timedelta(days=random.randint(30, 90)),
                technologies=random.choice(stack["skills"])[:3] if stack["skills"] else [],
                responsibilities=f"Worked on {stack['stack']} projects, contributed to production codebase.",
            )
            db.add(internship)

        student_objects.append((user, student, stack))

    await db.flush()
    print(f"[OK] 50 students seeded with realistic profiles (CGPA, skills, projects, LeetCode, certs)")

    # ── 6. Job Drives ─────────────────────────────────────────────────────────
    drive_objs = []
    for idx, c_info in enumerate(COMPANY_DATA):
        comp = company_objs[idx]
        d_info = c_info["drive"]

        drive = JobDrive(
            company_id=comp.company_id,
            college_id=college.college_id,
            title=d_info["title"],
            raw_jd_text=d_info["jd_text"],
            employment_type=EmploymentType.FULL_TIME,
            ctc_min=d_info["ctc_min"],
            ctc_max=d_info["ctc_max"],
            eligibility_min_cgpa=d_info["min_cgpa"],
            eligibility_max_backlogs=d_info["max_backlogs"],
            eligibility_branches=d_info["branches"],
            eligibility_grad_years=[str(y) for y in d_info["grad_years"]],
            required_skills=d_info["required_skills"],
            preferred_skills=d_info["preferred_skills"],
            drive_date=datetime.utcnow() + timedelta(days=5 + idx * 3),
            application_deadline=datetime.utcnow() + timedelta(days=2 + idx),
            status=d_info["status"],
            extraction_status=ExtractionStatus.CONFIRMED,
            extraction_confidence=round(random.uniform(0.88, 0.97), 2),
            extracted_jd_json={
                "role": d_info["title"],
                "branches": d_info["branches"],
                "min_cgpa": d_info["min_cgpa"],
                "max_active_backlogs": d_info["max_backlogs"],
                "graduation_years": [int(y) for y in d_info["grad_years"]],
                "required_skills": d_info["required_skills"],
                "preferred_skills": d_info["preferred_skills"],
                "ctc_range": {"min": d_info["ctc_min"], "max": d_info["ctc_max"]},
                "employment_type": "full_time",
                "ambiguous_fields": [],
                "confidence": round(random.uniform(0.88, 0.97), 2),
            },
        )
        db.add(drive)
        drive_objs.append(drive)

    await db.flush()
    print(f"[OK] 5 placement drives seeded across multiple pipeline stages")

    # ── 7. Panels for Microsoft drive ────────────────────────────────────────
    msft_drive = drive_objs[0]
    panel_1 = Panel(
        drive_id=msft_drive.drive_id,
        name="Panel A — Cloud & Backend Core",
        member_type=PanelMemberType.COMPANY_SIDE,
        members=[
            {"user_id": None, "name": "Siddharth Rao", "role": "Principal SDE"},
            {"user_id": None, "name": "Neha Sharma", "role": "Lead Cloud Architect"},
        ],
        availability_slots=[
            {"start": (datetime.utcnow() + timedelta(days=5)).replace(hour=9, minute=0).isoformat(),
             "end": (datetime.utcnow() + timedelta(days=5)).replace(hour=17, minute=0).isoformat()},
        ],
    )
    panel_2 = Panel(
        drive_id=msft_drive.drive_id,
        name="Panel B — Systems & Concurrency",
        member_type=PanelMemberType.COMPANY_SIDE,
        members=[
            {"user_id": None, "name": "Amit Kapoor", "role": "Senior SDE-2"},
            {"user_id": None, "name": "Priya Desai", "role": "Engineering Manager"},
        ],
        availability_slots=[
            {"start": (datetime.utcnow() + timedelta(days=5)).replace(hour=9, minute=0).isoformat(),
             "end": (datetime.utcnow() + timedelta(days=5)).replace(hour=17, minute=0).isoformat()},
        ],
    )
    panel_3 = Panel(
        drive_id=msft_drive.drive_id,
        name="Panel C — HR & Culture Fit",
        member_type=PanelMemberType.MIXED,
        members=[
            {"user_id": None, "name": "Rohan Malhotra", "role": "HR Manager (Microsoft)"},
            {"user_id": None, "name": "Dr. Rajesh Raman", "role": "TPO (College)"},
        ],
        availability_slots=[
            {"start": (datetime.utcnow() + timedelta(days=5)).replace(hour=13, minute=0).isoformat(),
             "end": (datetime.utcnow() + timedelta(days=5)).replace(hour=17, minute=0).isoformat()},
        ],
    )
    db.add_all([panel_1, panel_2, panel_3])
    await db.flush()

    # ── 8. Applications + Eligibility + Matching for Microsoft Drive ──────────
    msft_required = msft_drive.required_skills
    msft_preferred = msft_drive.preferred_skills

    selected_app_ids = []
    slot_time = (datetime.utcnow() + timedelta(days=5)).replace(hour=9, minute=0, second=0, microsecond=0)
    panel_cycle = [panel_1, panel_2, panel_3]
    room_cycle = rooms[:3]
    slot_counter = 0

    for user_obj, student_obj, stack in student_objects:
        # Eligibility check
        branch_ok = student_obj.branch.upper() in [b.upper() for b in msft_drive.eligibility_branches]
        cgpa_ok = float(student_obj.cgpa or 0) >= float(msft_drive.eligibility_min_cgpa)
        backlogs_ok = (student_obj.active_backlogs or 0) <= msft_drive.eligibility_max_backlogs
        year_ok = student_obj.graduation_year in [int(y) for y in msft_drive.eligibility_grad_years]

        if branch_ok and cgpa_ok and backlogs_ok and year_ok:
            elig_status = EligibilityStatus.ELIGIBLE
            elig_reason = "Meets all eligibility criteria."
        elif not branch_ok:
            elig_status = EligibilityStatus.NOT_ELIGIBLE
            elig_reason = f"Branch {student_obj.branch} not eligible."
        elif not cgpa_ok:
            elig_status = EligibilityStatus.NOT_ELIGIBLE
            elig_reason = f"CGPA {student_obj.cgpa} below cutoff 7.5."
        elif not backlogs_ok:
            elig_status = EligibilityStatus.NOT_ELIGIBLE
            elig_reason = f"Active backlogs {student_obj.active_backlogs} exceed limit."
        else:
            elig_status = EligibilityStatus.NOT_ELIGIBLE
            elig_reason = f"Graduation year {student_obj.graduation_year} not eligible."

        # Skill match score from student's stack
        student_skill_names = {s[0].lower() for s in stack["skills"]}

        required_lower = [s.lower() for s in msft_required]
        preferred_lower = [s.lower() for s in msft_preferred]
        req_matched = sum(1 for s in required_lower if s in student_skill_names)
        pref_matched = sum(1 for s in preferred_lower if s in student_skill_names)

        # Multi-factor score: Skills (50) + CGPA (30) + Coding (20)
        skill_pts = (req_matched / len(required_lower) * 40) + (pref_matched / max(1, len(preferred_lower)) * 10)
        cgpa_pts = (float(student_obj.cgpa or 7.0) / 10.0) * 30
        coding_pts = 15.0 if stack["stack"] in ["Backend / Systems", "ML / AI"] else 10.0
        match_score = round(min(98.0, skill_pts + cgpa_pts + coding_pts), 1)

        skill_gap = [s for s in msft_required if s.lower() not in student_skill_names]
        matched_req = [s for s in msft_required if s.lower() in student_skill_names]
        explanation = (
            f"Matched required: {', '.join(matched_req) if matched_req else 'none'}. "
            f"{'Gaps: ' + ', '.join(skill_gap) + '.' if skill_gap else 'No critical gaps.'} "
            f"CGPA {student_obj.cgpa}. Score: {match_score}/100."
        )

        # Determine shortlist and application status
        is_eligible = elig_status == EligibilityStatus.ELIGIBLE
        is_shortlisted = is_eligible and match_score >= 60
        shortlist_st = ShortlistStatus.APPROVED if is_shortlisted else (
            ShortlistStatus.NOT_SHORTLISTED if is_eligible else ShortlistStatus.NOT_SHORTLISTED
        )

        # Assign interview/selection status for shortlisted ones
        if is_shortlisted and slot_counter < 18:
            app_status = ApplicationStatus.INTERVIEW_SCHEDULED
        elif is_eligible:
            app_status = ApplicationStatus.MATCHED if match_score else ApplicationStatus.ELIGIBLE
        else:
            app_status = ApplicationStatus.APPLIED

        application = Application(
            student_id=student_obj.student_id,
            drive_id=msft_drive.drive_id,
            eligibility_status=elig_status,
            eligibility_reason=elig_reason,
            match_score=match_score if is_eligible else None,
            match_explanation=explanation if is_eligible else None,
            skill_gap=skill_gap if is_eligible else [],
            shortlist_status=shortlist_st,
            application_status=app_status,
        )
        db.add(application)
        await db.flush()

        # Create interview slots for shortlisted candidates (up to 18)
        if is_shortlisted and slot_counter < 18:
            panel = panel_cycle[slot_counter % 3]
            room = room_cycle[slot_counter % 3]
            slot_start = slot_time + timedelta(minutes=slot_counter * 50)
            slot_end = slot_start + timedelta(minutes=45)

            slot = InterviewSlot(
                drive_id=msft_drive.drive_id,
                application_id=application.application_id,
                panel_id=panel.panel_id,
                room_id=room.room_id,
                mode=InterviewMode.OFFLINE,
                start_time=slot_start,
                end_time=slot_end,
                round=InterviewRound.TECHNICAL_1,
                status=SlotStatus.CONFIRMED,
                generated_by=SlotGenerator.AI_SCHEDULER,
            )
            db.add(slot)

            if slot_counter < 3:
                selected_app_ids.append(application.application_id)
            slot_counter += 1

    await db.flush()
    print(f"[OK] Microsoft drive: {slot_counter} interview slots scheduled, applications seeded")

    # ── 9. Offers for top 3 ──────────────────────────────────────────────────
    for app_id in selected_app_ids:
        offer = Offer(
            application_id=app_id,
            offer_letter_url="https://placementops.ai/offers/sample_offer.pdf",
            ctc_offered=2450000,
            issued_at=datetime.utcnow() - timedelta(days=1),
            status=OfferStatus.ISSUED,
        )
        db.add(offer)

        # Update application status
        app_obj = await db.get(Application, app_id)
        if app_obj:
            app_obj.application_status = ApplicationStatus.OFFER_ISSUED
    print("[OK] 3 offer letters issued to top candidates")

    # ── 10. Notifications for demo student (student@tech.edu) ────────────────
    demo_user = student_objects[0][0]
    demo_notifications = [
        (NotificationType.SHORTLISTED, "Congratulations! You've been shortlisted for Microsoft SDE-1. Check your Interview Center for slot details."),
        (NotificationType.INTERVIEW_SCHEDULED, "Your Microsoft interview is scheduled for 09:00 AM in Room 301, Block B. Bring your college ID."),
        (NotificationType.INTERVIEW_REMINDER, "Reminder: Microsoft Technical Interview in 24 hours. Review System Design and Python fundamentals."),
        (NotificationType.ELIGIBILITY_RESULT, "You are eligible for Google SWE (New Grad). AI matching will begin shortly."),
        (NotificationType.GENERIC, "New drive announced: Amazon SDE-1 (26-34 LPA). Application deadline in 2 days."),
    ]
    for notif_type, message in demo_notifications:
        notif = Notification(
            user_id=demo_user.user_id,
            type=notif_type,
            channel=NotificationChannel.IN_APP,
            message=message,
            status=NotificationStatus.SENT,
            sent_at=datetime.utcnow() - timedelta(hours=random.randint(1, 48)),
        )
        db.add(notif)
    print("[OK] Demo notifications seeded for student@tech.edu")

    # ── 11. Audit Logs ────────────────────────────────────────────────────────
    audit_entries = [
        ("shortlist_approved", "application", "Shortlist approved for Microsoft SDE-1 — 18 candidates"),
        ("eligibility_run_complete", "job_drive", "Eligibility run completed: 34 eligible / 50 evaluated"),
        ("matching_complete", "job_drive", "AI matching completed: 18 candidates scored >= 65%"),
        ("schedule_confirmed", "job_drive", "OR-Tools schedule confirmed — 18 slots, 0 conflicts"),
        ("drive_published", "job_drive", "Microsoft SDE-1 drive published by college admin"),
        ("company_verified", "company", "Google verified as placement partner"),
    ]
    for action, entity_type, reason in audit_entries:
        audit = AuditLog(
            actor_id=admin_user.user_id,
            actor_type=ActorType.HUMAN,
            action_type=action,
            entity_type=entity_type,
            entity_id=str(msft_drive.drive_id),
            before_state={},
            after_state={"status": "updated"},
            reason=reason,
        )
        db.add(audit)
    print("[OK] Audit log entries seeded")

    await db.commit()
    print("\n" + "=" * 70)
    print("[SUCCESS] PlacementOps AI — Master Demo Dataset Successfully Seeded!")
    print("=" * 70)
    print("Demo Credentials (all passwords: password123)")
    print("-" * 70)
    print(f"{'Role':<25} {'Email':<35} {'Password'}")
    print("-" * 70)
    print(f"{'College Admin':<25} {'admin@tech.edu':<35} password123")
    print(f"{'Student (main)':<25} {'student@tech.edu':<35} password123")
    print(f"{'Microsoft Recruiter':<25} {'recruiter@microsoft.com':<35} password123")
    print(f"{'Google Recruiter':<25} {'recruiter@google.com':<35} password123")
    print(f"{'Adobe Recruiter':<25} {'recruiter@adobe.com':<35} password123")
    print(f"{'Amazon Recruiter':<25} {'recruiter@amazon.com':<35} password123")
    print("-" * 70)
    print("Pipeline Status:")
    print(f"  Microsoft SDE-1  -> Schedule Confirmed (18 interviews, 3 offers issued)")
    print(f"  Google SWE       -> Shortlist Approved")
    print(f"  Adobe MTS        -> Eligibility Complete")
    print(f"  Amazon SDE-1     -> Published")
    print(f"  Infosys SE       -> Published")
    print("=" * 70 + "\n")


async def main():
    print("[INFO] Creating database tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("[OK] Tables created")

    async with async_session() as session:
        await seed_master_data(session)


if __name__ == "__main__":
    asyncio.run(main())
