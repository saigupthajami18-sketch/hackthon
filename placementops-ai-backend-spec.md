# PlacementOps AI
### AI-Powered Campus Placement Operations & Interview Coordination Agent
## Backend & System Build Specification (v2)

> Scope note: This spec covers **backend, data, and AI-agent architecture only**, per your requirement. Frontend pages are referenced in §5 purely as a traceability map (which page needs which API) — full UI/component specs are deferred until you build the frontend.

---

## 1. Project Objective

A three-sided platform connecting:

1. 👨‍🎓 **Students**
2. 🏫 **College Placement Management**
3. 🏢 **Companies / Recruiters**

Managing the full placement lifecycle:

```
Company Job Requirement
  → JD Analysis (AI)
  → Eligibility Extraction (AI)
  → Student Eligibility Verification (Rules Engine)
  → Candidate Matching (AI, explainable)
  → Shortlisting (Human-approved)
  → Assessment
  → Interview Scheduling (Optimization Engine)
  → Panel/Room Coordination
  → Conflict Detection
  → Dynamic Replanning
  → Human Approval
  → Notifications
  → Interview Results
  → Selection (Human decision)
  → Offer Letter
  → Placement Analytics
```

**Hard constraint:** The AI never makes the final hiring decision. AI recommends, explains, prioritizes, and coordinates logistics. Humans (college staff, company recruiters) approve every high-impact step: eligibility overrides, shortlists, schedule confirmations, and selections.

---

## 2. Core Architecture Principle — Separation of Concerns

The system explicitly separates four kinds of "intelligence" so the LLM never silently makes a hard decision:

| Layer | Responsibility | Technology |
|---|---|---|
| **LLM Reasoning** | Unstructured → structured extraction, natural-language explanations, semantic skill matching | Claude/OpenAI via CrewAI agents |
| **Deterministic Business Rules** | Eligibility checks (CGPA, backlog, branch, batch cutoffs) | Rules engine in FastAPI (plain Python/SQL logic, not LLM) |
| **Constraint Optimization** | Interview/panel/room scheduling, conflict detection, replanning | OR-Tools (CP-SAT solver) |
| **Workflow Automation & Integrations** | Notifications, reminders, external triggers (email/SMS), cross-system syncing | n8n |

**Rule:** The LLM extracts and explains. The rules engine decides eligibility. OR-Tools decides scheduling. n8n moves messages. Humans approve. No component skips this chain.

---

## 3. Tech Stack

| Layer | Choice |
|---|---|
| Backend API | FastAPI (Python) |
| Database | PostgreSQL |
| Vector store (skill/resume embeddings) | pgvector |
| AI Agent Orchestration | CrewAI |
| Scheduling / Constraint Solving | Google OR-Tools (CP-SAT) |
| Workflow Automation / Notifications | n8n |
| Task Queue | Celery + Redis (async jobs: extraction, matching, scheduling runs) |
| Auth | JWT + RBAC middleware, org-scoped tokens |
| File Storage | S3-compatible bucket (resumes, JD files, offer letters) |
| Frontend (later) | React / Next.js — not in this scope |

---

## 4. Roles & Permissions Matrix

Three roles: **Student**, **College (Placement Cell)**, **Company (Recruiter)**. All data is org-scoped — a College user only sees their institution's data; a Company user only sees their own drives and candidates authorized for those drives.

| Feature / Resource | Student | College | Company |
|---|---|---|---|
| Own profile (academic, skills, projects, certs, coding profiles) | CRUD (own only) | View (read-only, all students in org) | No access |
| Other students' profiles | No access | CRUD | View — only for candidates in their own active drive pipeline |
| Attendance data | View (own) | CRUD | No access |
| Company profile | View (public info only) | View/Verify | CRUD (own) |
| College partnership records | No access | CRUD | View/Request |
| Job / JD creation | No access | View, Approve/Publish | CRUD (own JDs) |
| JD AI analysis (extraction) | No access | Trigger, Review, Override | Trigger, View result |
| Eligibility rule config | No access | CRUD | Propose (subject to college approval) |
| Eligibility check run | View own result | Trigger, Override exceptions | View result |
| Candidate matching (AI) | View own match score + explanation | Trigger, View all, Approve/Reject | View shortlisted candidates only, Review |
| Shortlisting | View own status | CRUD, Approve | Approve/Reject candidates presented to them |
| Assessment/test scheduling | View own | CRUD | Request, View |
| Interview scheduling | View own slot | CRUD, Approve, Reschedule | Propose slots, Confirm own panel availability |
| Interview panel management | No access | CRUD | CRUD (own company-side panelists only) |
| Venue/room management | No access | CRUD | No access |
| Conflict detection & replanning | No access | View, Resolve, Approve replan | View (read-only) affecting their drive |
| Notifications | Receive | CRUD (send), View all logs | Receive, Send to own pipeline only |
| Interview feedback / result entry | View own result | View all | CRUD (own panel's feedback) |
| Selection decision | View own status | View, Approve final list | CRUD (own drive) — subject to college co-sign |
| Offer letter | View/Accept/Decline (own) | View, Approve template | CRUD (own drive) |
| Placement analytics | View own readiness score | Full access (org-wide) | Own drive/hiring analytics only |
| Skill-gap analytics | View own gap report | Full access | No access |
| Audit log | No access | Full access | Own actions only |
| AI Assistant | Grounded to own data | Grounded to org data | Grounded to own company/drive data |

---

## 5. Page → API Traceability (for later frontend build)

Listed only to make sure the backend exposes everything the eventual UI needs. No component-level detail — that's frontend scope.

**Student:** Dashboard, Profile, Academics, Attendance, Skills, Projects, Coding Profiles, Certifications, Internships, Opportunities, Applications, Interview Center, Placement Journey, Offer Letters, Notifications, Readiness Report, AI Assistant, Settings.

**College:** Dashboard, Student Mgmt, Student Detail, Company Mgmt, Company Detail, Job Mgmt, JD Upload/Analysis, Drive Mgmt, Eligibility Analysis, Candidate Matching, Shortlisting, Interview Planning, Schedule Calendar, Venue Mgmt, Panel Mgmt, Conflict Center, Dynamic Replanning, Notifications, Selection Mgmt, Offer Mgmt, Placement Analytics, Skill-Gap Analytics, Reports, AI Assistant, Settings.

**Company:** Dashboard, Company Profile, College Partnerships, Recruitment Calendar, Job Roles, JD Upload/Analysis, Candidate Pipeline, Candidate Detail, AI Matching View, Shortlist Review, Interview Planning, Interview Schedule, Interview Results, Selection Mgmt, Offer Mgmt, Hiring Analytics, AI Assistant, Settings.

Every page above maps to endpoints defined in §9. Build the endpoints first; UI attaches later without backend rework.

---

## 6. Data Models

### 6.1 User (base auth table)
```
user_id (PK, UUID)
role (enum: student | college_admin | company_recruiter)
org_id (FK → College or Company, nullable per role)
name, email (unique), phone
password_hash
is_verified (bool)
created_at, updated_at
```

### 6.2 Student
```
student_id (PK, FK → User)
roll_no (unique per college)
college_id (FK)
department, branch, batch, graduation_year
photo_url

-- Academic
cgpa (decimal)
semester_gpas (JSON array: {semester, gpa})
subjects (JSON array: {name, marks, semester})
active_backlogs (int)
total_backlogs_history (int)
attendance_pct (decimal)

-- Derived
readiness_score (decimal, computed by Analytics Agent)
```

### 6.3 Skill
```
skill_id (PK)
student_id (FK)
skill_name (normalized, FK → SkillTaxonomy)
category (e.g. Language, Framework, Tool, Soft Skill)
proficiency (enum: beginner | intermediate | advanced)
evidence_source (enum: self-reported | project-linked | certification-linked | coding-profile-verified)
months_experience (int, nullable)
```

### 6.4 SkillTaxonomy (normalization reference table)
```
skill_id (PK)
canonical_name
aliases (JSON array, e.g. "JS" → "JavaScript")
category
```

### 6.5 Project
```
project_id (PK)
student_id (FK)
title, description
role_in_project
technologies (JSON array)
github_url, live_url
duration_months
team_size
evidence_files (array of S3 URLs)
```

### 6.6 Internship
```
internship_id (PK)
student_id (FK)
company_name, role
start_date, end_date
responsibilities (text)
technologies (JSON array)
certificate_url
conversion_status (enum: none | PPO_offered | PPO_accepted | PPO_declined)
```

### 6.7 Certification
```
cert_id (PK)
student_id (FK)
provider, name
issue_date, expiry_date (nullable)
credential_url
```

### 6.8 CodingProfile
```
profile_id (PK)
student_id (FK)
platform (enum: LeetCode | GFG | CodeChef | Codeforces | HackerRank | GitHub | GitLab | Kaggle)
username, profile_url
rating, problems_solved, contests_count (nullable, platform-dependent)
last_synced_at
data_source (enum: verified_api | manual_entry | demo_synthetic)  -- MUST be explicit, never fabricate as verified
```

### 6.9 College
```
college_id (PK, FK → User for the admin org)
name, address, accreditation_info
domain (email domain for auto-verification)
```

### 6.10 Company
```
company_id (PK, FK → User for the org)
name, logo_url, industry, website
recruiter_contacts (JSON array: {name, email, phone})
locations (JSON array)
verification_status (enum: pending | verified | rejected)
hiring_history (derived, not stored directly — computed from Application/Offer tables)
```

### 6.11 CollegeCompanyPartnership
```
partnership_id (PK)
college_id (FK), company_id (FK)
status (enum: requested | active | inactive)
started_at
```

### 6.12 JobDrive (JD + drive configuration)
```
drive_id (PK)
company_id (FK), college_id (FK)
title, raw_jd_text, raw_jd_file_url
employment_type (enum: full_time | internship | intern_plus_ppo)
ctc_min, ctc_max
locations (JSON array)

-- AI-extracted structured fields (see §7 JD Analyst Agent)
extracted_jd_json (JSONB)
extraction_confidence (decimal)
extraction_status (enum: pending | needs_review | confirmed)

-- Eligibility criteria (confirmed, human-approved version of extracted_jd_json eligibility fields)
eligibility_branches (JSON array)
eligibility_min_cgpa (decimal)
eligibility_max_backlogs (int)
eligibility_grad_years (JSON array)
required_skills (JSON array)
preferred_skills (JSON array)

application_deadline (timestamp)
drive_date (timestamp)
status (enum: draft | published | eligibility_running | eligibility_complete |
              matching_running | matching_complete | shortlist_pending_approval |
              shortlist_approved | scheduling_running | schedule_draft |
              schedule_pending_approval | schedule_confirmed | interviews_in_progress |
              results_pending | selection_pending_approval | selection_confirmed |
              offers_issued | closed)
created_at, updated_at
```

### 6.13 Application (student ↔ drive)
```
application_id (PK)
student_id (FK), drive_id (FK)
eligibility_status (enum: pending | eligible | not_eligible | needs_manual_review)
eligibility_reason (text, human-readable)
match_score (decimal, 0-100)
match_explanation (text, AI-generated, e.g. "Matched: Python, SQL. Gap: AWS (required)")
skill_gap (JSON array)
shortlist_status (enum: not_shortlisted | pending_approval | approved | rejected)
application_status (enum: applied | eligible | matched | shortlisted | interview_scheduled |
                     interview_completed | result_pending | selected | rejected | waitlisted |
                     offer_issued | offer_accepted | offer_declined)
created_at, updated_at
UNIQUE(student_id, drive_id)
```

### 6.14 Panel
```
panel_id (PK)
drive_id (FK)
name
member_type (enum: college_side | company_side | mixed)
members (JSON array: {user_id, name, role})
availability_slots (JSON array: {start, end})
```

### 6.15 Room
```
room_id (PK)
college_id (FK)
name, location, capacity
availability_slots (JSON array: {start, end})
```

### 6.16 InterviewSlot
```
slot_id (PK)
drive_id (FK), application_id (FK)
panel_id (FK), room_id (FK, nullable for online)
mode (enum: online | offline)
meeting_link (nullable)
start_time, end_time
round (enum: assessment | technical_1 | technical_2 | hr | other)
status (enum: draft | confirmed | conflict | rescheduled | completed | cancelled)
generated_by (enum: ai_scheduler | manual)
created_at, updated_at
```

### 6.17 Feedback
```
feedback_id (PK)
application_id (FK), slot_id (FK), panel_id (FK)
remarks (text)
decision (enum: advance | reject | hold)
submitted_by (FK → User)
submitted_at
```

### 6.18 Offer
```
offer_id (PK)
application_id (FK)
offer_letter_url
ctc_offered
issued_at
status (enum: issued | accepted | declined | expired)
responded_at
```

### 6.19 Notification
```
notification_id (PK)
user_id (FK)
type (enum: eligibility_result | shortlisted | interview_scheduled | interview_reminder |
      rescheduled | result_declared | offer_issued | generic)
channel (enum: email | sms | in_app)
message
status (enum: queued | sent | failed)
sent_at
```

### 6.20 AuditLog
```
log_id (PK)
actor_id (FK → User, nullable if system/AI-generated)
actor_type (enum: human | ai_agent)
action_type (text, e.g. "eligibility_override", "shortlist_approved", "schedule_replanned")
entity_type, entity_id
before_state (JSONB), after_state (JSONB)
reason (text, required for overrides)
timestamp
```

---

## 7. AI Agent Specifications

Each agent is a CrewAI agent with a bounded tool set — it can call specific backend functions/APIs, never write directly to the database without going through the deterministic layer.

### 7.1 JD Analyst Agent
**Trigger:** Company submits/uploads a JD (text or PDF).
**Input:** `raw_jd_text` or extracted PDF text.
**Responsibilities:**
1. Extract structured requirements (role, branches, CGPA, backlog policy, grad years, required/preferred skills, CTC, location, employment type).
2. Normalize skill names against `SkillTaxonomy`.
3. Distinguish hard eligibility criteria (must-have, blocking) from soft preferences (nice-to-have, scored).
4. Flag ambiguous/missing fields and produce a **confidence score**.
5. If `confidence < 0.85` on any required field → set `extraction_status = needs_review`; drive cannot publish until a human confirms.

**Output schema:**
```json
{
  "role": "Software Engineer",
  "branches": ["CSE", "IT"],
  "min_cgpa": 7.5,
  "max_active_backlogs": 0,
  "graduation_years": [2027],
  "required_skills": ["Python", "SQL", "REST API", "OOP"],
  "preferred_skills": ["Docker", "Cloud", "Git"],
  "ctc_range": {"min": 600000, "max": 900000},
  "employment_type": "full_time",
  "ambiguous_fields": [],
  "confidence": 0.94
}
```
**Human checkpoint:** College Placement Cell reviews/edits `extracted_jd_json` before it becomes the confirmed `eligibility_*` fields on `JobDrive` and the drive is published.

---

### 7.2 Eligibility Engine (deterministic — NOT an LLM agent)
**Trigger:** Drive status → `eligibility_running`.
**Logic:** Plain rule evaluation, no LLM:
```
for each student in college:
  eligible = (student.branch in drive.eligibility_branches)
         AND (student.cgpa >= drive.eligibility_min_cgpa)
         AND (student.active_backlogs <= drive.eligibility_max_backlogs)
         AND (student.graduation_year in drive.eligibility_grad_years)
  if any field is missing/null on student -> needs_manual_review
```
**Output:** `Application` row per student with `eligibility_status` + human-readable `eligibility_reason` (e.g. "CGPA 7.2 below cutoff 7.5").
**Human checkpoint:** College can override individual `not_eligible`/`needs_manual_review` rows → logged in `AuditLog` with mandatory reason.

---

### 7.3 Matching Agent
**Trigger:** Drive status → `matching_running` (only runs on students already `eligible`).
**Logic:**
1. Embed student's combined skill/project/resume profile (pgvector).
2. Embed JD's `required_skills` + `preferred_skills`.
3. Compute semantic similarity + rule-based weighting (required skills matched = higher weight than preferred).
4. Generate `match_score` (0–100) and a natural-language `match_explanation`.
5. Generate `skill_gap` — required skills not evidenced anywhere on the student profile.

**Output example:**
```json
{
  "match_score": 78,
  "match_explanation": "Matched: Python, SQL, REST API. Gap: Docker (preferred, not required).",
  "skill_gap": ["Docker"]
}
```
**Human checkpoint:** College/Company reviews ranked list and approves the shortlist (`shortlist_status: pending_approval → approved`).

---

### 7.4 Scheduling Agent (OR-Tools, not LLM)
**Trigger:** `shortlist_approved` → college initiates scheduling.
**Inputs:** Shortlisted applications, panel availability, room availability, round structure (e.g. assessment → tech1 → tech2 → HR), company constraints (max interviews/day).
**Logic:** CP-SAT constraint model:
- No panel double-booked
- No room double-booked (offline mode)
- Room capacity respected
- Candidate not double-booked across rounds
- Respect company-specified interview windows
**Output:** Draft `InterviewSlot` rows (`status = draft`), plus a list of **unresolved conflicts** (e.g. insufficient panel capacity for slot count) surfaced to the dashboard.
**Human checkpoint:** College reviews/edits the draft schedule and confirms (`status: draft → confirmed`). LLM is used only to write a human-readable summary of the proposed schedule and conflicts — not to pick the slots.

### 7.5 Conflict Detection & Dynamic Replanning Agent
**Trigger:** A confirmed slot changes (panelist cancels, room becomes unavailable, candidate requests reschedule).
**Logic:** Re-run the OR-Tools solver on the affected subset only (not the whole drive), propose a minimal-change replan.
**Output:** Proposed replan diff (old slot → new slot) with reason.
**Human checkpoint:** College approves replan → triggers Notification Agent to inform affected parties.

### 7.6 Notification Agent (n8n-orchestrated)
**Trigger:** Any state transition in `Application`, `InterviewSlot`, `Offer`.
**Logic:** Deterministic event → template mapping (no LLM needed for standard cases; LLM only used for optional personalized phrasing).
**Events:** eligibility_result, shortlisted, interview_scheduled, interview_reminder (T-24h, T-1h), rescheduled, result_declared, offer_issued.
**Channels:** email (always), SMS (for time-critical: interview reminders, reschedules), in-app (all).

### 7.7 Analytics Agent
**Trigger:** On-demand or scheduled (nightly).
**Outputs:**
- `readiness_score` per student (weighted: CGPA, skill coverage vs. active JD pool, backlog status, verified coding-profile activity)
- Skill-gap aggregation across the student pool vs. current market JDs (which skills are most commonly required but least evidenced)
- Drive funnel metrics (applied → eligible → matched → shortlisted → interviewed → selected → offer accepted)
- Company hiring-history rollups
**Human checkpoint:** None — read-only reporting. No writes back to core entities.

---

## 8. Workflow State Machines

### 8.1 JobDrive status flow
```
draft → published → eligibility_running → eligibility_complete
     → matching_running → matching_complete → shortlist_pending_approval
     → shortlist_approved → scheduling_running → schedule_draft
     → schedule_pending_approval → schedule_confirmed → interviews_in_progress
     → results_pending → selection_pending_approval → selection_confirmed
     → offers_issued → closed
```
Each transition is triggered by either (a) an explicit human action via API, or (b) an agent job completing. No transition skips a required human-approval step (`*_pending_approval` states always require an explicit approve/reject API call).

### 8.2 Application status flow
```
applied → eligible/not_eligible/needs_manual_review
        → matched (score assigned)
        → shortlisted (pending_approval → approved/rejected)
        → interview_scheduled → interview_completed
        → result_pending → selected/rejected/waitlisted
        → offer_issued → offer_accepted/offer_declined
```

### 8.3 InterviewSlot status flow
```
draft → confirmed → [conflict → rescheduled → confirmed] → completed
                  → cancelled (terminal, any state)
```

---

## 9. API Endpoints (by module)

### Auth
```
POST   /auth/register/student
POST   /auth/register/company        (requires college verification before activation)
POST   /auth/login
POST   /auth/logout
POST   /auth/refresh
GET    /auth/me
```

### Student Profile
```
GET/PUT  /students/{id}
GET/PUT  /students/{id}/academics
GET/PUT  /students/{id}/attendance
CRUD     /students/{id}/skills
CRUD     /students/{id}/projects
CRUD     /students/{id}/internships
CRUD     /students/{id}/certifications
CRUD     /students/{id}/coding-profiles
GET      /students/{id}/readiness-score
```

### College / Student Management
```
GET   /college/{id}/students                (list, filter by branch/batch/eligibility)
GET   /college/{id}/students/{student_id}
POST  /college/{id}/students/bulk-import
```

### Company Management
```
CRUD  /colleges/{id}/companies
CRUD  /colleges/{id}/partnerships
GET   /companies/{id}/profile
PUT   /companies/{id}/profile
GET   /companies/{id}/verification-status
POST  /companies/{id}/verify              (college action)
```

### Job Drive / JD
```
POST  /drives                             (create draft)
POST  /drives/{id}/jd-upload              (file or text → triggers JD Analyst Agent)
GET   /drives/{id}/jd-extraction          (view extraction result + confidence)
PUT   /drives/{id}/jd-extraction          (human edits/confirms)
POST  /drives/{id}/publish
GET   /drives/{id}
GET   /drives?college_id=&company_id=&status=
```

### Eligibility
```
POST  /drives/{id}/eligibility/run
GET   /drives/{id}/eligibility/results
PUT   /applications/{id}/eligibility-override    (reason required)
```

### Matching / Shortlisting
```
POST  /drives/{id}/matching/run
GET   /drives/{id}/matching/results        (ranked list + explanations)
POST  /applications/{id}/shortlist          (approve/reject, actor role checked)
GET   /drives/{id}/shortlist
```

### Scheduling
```
POST  /drives/{id}/schedule/generate        (triggers Scheduling Agent)
GET   /drives/{id}/schedule/draft
PUT   /interview-slots/{id}                 (manual edit)
POST  /drives/{id}/schedule/confirm
POST  /interview-slots/{id}/reschedule      (triggers Replanning Agent)
GET   /drives/{id}/conflicts
```

### Panels & Rooms
```
CRUD  /drives/{id}/panels
CRUD  /colleges/{id}/rooms
GET   /panels/{id}/availability
GET   /rooms/{id}/availability
```

### Feedback / Results
```
POST  /interview-slots/{id}/feedback
GET   /drives/{id}/results
POST  /applications/{id}/decision           (select/reject/waitlist)
```

### Offers
```
POST  /applications/{id}/offer
PUT   /offers/{id}/status                   (student accept/decline)
GET   /drives/{id}/offers
```

### Notifications
```
GET   /notifications?user_id=
POST  /notifications/send                   (internal/system use, also n8n webhook target)
POST  /notifications/{id}/mark-read
```

### Dashboard / Exceptions
```
GET   /college/{id}/dashboard/pending-actions
GET   /college/{id}/dashboard/exceptions     (conflicts, low-eligible drives, unconfirmed slots)
GET   /company/{id}/dashboard/pending-actions
GET   /student/{id}/dashboard/pending-actions
```

### Analytics
```
GET   /college/{id}/analytics/placement-funnel
GET   /college/{id}/analytics/skill-gap
GET   /college/{id}/analytics/readiness-distribution
GET   /company/{id}/analytics/hiring-summary
GET   /students/{id}/analytics/readiness-report
POST  /reports/export                        (PDF/Excel)
```

### Audit
```
GET   /audit-log?entity_type=&entity_id=&actor=
```

---

## 10. Validations & Error Handling

| Case | Handling |
|---|---|
| JD extraction confidence < 0.85 on a required field | `extraction_status = needs_review`; block `POST /drives/{id}/publish` with `422` until confirmed |
| Duplicate application (same student + drive) | `409 Conflict` — unique constraint on `Application(student_id, drive_id)` |
| Eligibility override without reason | `400 Bad Request` — `reason` field mandatory, logged to `AuditLog` |
| Scheduling conflict (panel/room double-book) | Not silently resolved — surfaced as an unresolved item in `/drives/{id}/conflicts`, blocks `schedule/confirm` until resolved |
| Company tries to view student outside their pipeline | `403 Forbidden` — RBAC check at query layer, not just UI |
| College tries to access another college's data | `403 Forbidden` — org_id scoping enforced in every query |
| File upload (resume/JD) wrong type or > size limit | `413`/`415` with explicit allowed types (PDF, DOCX for JD; PDF for resume) |
| Coding-profile sync fails or platform unavailable | Do not fail silently — mark `data_source = manual_entry`, surface a "last synced" warning, never fabricate stats |
| Notification send failure (email/SMS bounce) | Retry via n8n (max 3 attempts), then `status = failed`, surfaced in college dashboard exceptions |
| Selection decision by company without required fields | `422` — must include `decision`, `submitted_by`, at least one `feedback` record per round completed |
| Offer status change by unauthorized actor (e.g. student tries to issue offer) | `403 Forbidden` |
| Drive published with zero eligible students after eligibility run | Surfaced as dashboard exception, not an error — drive can proceed to matching with an empty pool, flagged for review |

---

## 11. What to Mock vs. Build for the Hackathon

| Component | Hackathon approach |
|---|---|
| LeetCode/GFG/Codeforces/GitHub live sync | Mock with `data_source = demo_synthetic`, clearly labeled in API responses — do not claim verified |
| SMS gateway | Mock via n8n's built-in logging node or a stub webhook; real Twilio/MSG91 only if time permits |
| Email | Real (SMTP is trivial to wire up — use it for demo credibility) |
| OR-Tools scheduling | Real — this is a core differentiator, worth the build time even at small scale (e.g. 20–30 candidates, 3–4 panels) |
| JD extraction (LLM) | Real — core AI agent, use Claude/OpenAI function-calling with the schema in §7.1 |
| Matching agent embeddings | Real but small-scale (pgvector on a seeded dataset of ~50–100 students is enough to demo convincingly) |
| Company/college verification workflow | Simplify to a single admin-approval toggle, skip document-based KYC |
| Multi-round interview chaining | Support in schema (`round` enum) but demo with 1–2 rounds only |
| Offer letter generation | Template-based PDF (not AI-generated) is sufficient |

---

## 12. Build Order

1. **Foundations:** Auth (3 roles, RBAC, org scoping), full DB schema (§6), seed data (sample college, ~50 students, 5 companies, skill taxonomy).
2. **JD Analyst Agent + Eligibility Engine:** end-to-end for one drive — JD upload → extraction → human confirm → publish → eligibility run.
3. **Matching Agent:** embeddings + scoring + explanation, shortlist approval flow.
4. **Scheduling Agent (OR-Tools):** draft generation, conflict surfacing, manual edit, confirm.
5. **Conflict/Replanning Agent:** minimal-diff reschedule on a simulated panel cancellation.
6. **Notification Agent (n8n):** wire real events (eligibility result, shortlisted, interview scheduled, reminder) to email.
7. **Dashboards (pending-actions + exceptions endpoints) + Analytics (readiness score, skill-gap, funnel).**
8. **Audit log + human-override flows across all approval points.**
9. **Polish:** edge cases from §10, seed a realistic demo narrative (1 company drive walked end-to-end for the live demo).

---

## 13. Open Decisions Still Needed

- [ ] Final LLM provider for JD extraction/matching (cost vs. accuracy)
- [ ] Multi-round interview chaining — required for MVP demo, or single-round sufficient?
- [ ] Online interviews: auto-generate meeting links (e.g. via a calendar/meet API) or manual link entry for hackathon?
- [ ] Resume parsing: build a dedicated parser, or rely on the skill/project/cert forms as the source of truth (simpler, recommended for hackathon)?
- [ ] Real vs. mocked company verification workflow
