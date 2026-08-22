"""
PlacementOps AI — Shared Enums & Model Exports
"""

import enum


# ═══════════════════════════════════════════════════════════════════════════════
# Role & Auth Enums
# ═══════════════════════════════════════════════════════════════════════════════

class UserRole(str, enum.Enum):
    STUDENT = "student"
    COLLEGE_ADMIN = "college_admin"
    COMPANY_RECRUITER = "company_recruiter"


# ═══════════════════════════════════════════════════════════════════════════════
# Student-related Enums
# ═══════════════════════════════════════════════════════════════════════════════

class SkillProficiency(str, enum.Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class EvidenceSource(str, enum.Enum):
    SELF_REPORTED = "self_reported"
    PROJECT_LINKED = "project_linked"
    CERTIFICATION_LINKED = "certification_linked"
    CODING_PROFILE_VERIFIED = "coding_profile_verified"


class CodingPlatform(str, enum.Enum):
    LEETCODE = "LeetCode"
    GFG = "GFG"
    CODECHEF = "CodeChef"
    CODEFORCES = "Codeforces"
    HACKERRANK = "HackerRank"
    GITHUB = "GitHub"
    GITLAB = "GitLab"
    KAGGLE = "Kaggle"


class DataSource(str, enum.Enum):
    VERIFIED_API = "verified_api"
    MANUAL_ENTRY = "manual_entry"
    DEMO_SYNTHETIC = "demo_synthetic"


class ConversionStatus(str, enum.Enum):
    NONE = "none"
    PPO_OFFERED = "PPO_offered"
    PPO_ACCEPTED = "PPO_accepted"
    PPO_DECLINED = "PPO_declined"


# ═══════════════════════════════════════════════════════════════════════════════
# Company & Partnership Enums
# ═══════════════════════════════════════════════════════════════════════════════

class VerificationStatus(str, enum.Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"


class PartnershipStatus(str, enum.Enum):
    REQUESTED = "requested"
    ACTIVE = "active"
    INACTIVE = "inactive"


# ═══════════════════════════════════════════════════════════════════════════════
# Drive & Application Enums
# ═══════════════════════════════════════════════════════════════════════════════

class EmploymentType(str, enum.Enum):
    FULL_TIME = "full_time"
    INTERNSHIP = "internship"
    INTERN_PLUS_PPO = "intern_plus_ppo"


class ExtractionStatus(str, enum.Enum):
    PENDING = "pending"
    NEEDS_REVIEW = "needs_review"
    CONFIRMED = "confirmed"


class DriveStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ELIGIBILITY_RUNNING = "eligibility_running"
    ELIGIBILITY_COMPLETE = "eligibility_complete"
    MATCHING_RUNNING = "matching_running"
    MATCHING_COMPLETE = "matching_complete"
    SHORTLIST_PENDING_APPROVAL = "shortlist_pending_approval"
    SHORTLIST_APPROVED = "shortlist_approved"
    SCHEDULING_RUNNING = "scheduling_running"
    SCHEDULE_DRAFT = "schedule_draft"
    SCHEDULE_PENDING_APPROVAL = "schedule_pending_approval"
    SCHEDULE_CONFIRMED = "schedule_confirmed"
    INTERVIEWS_IN_PROGRESS = "interviews_in_progress"
    RESULTS_PENDING = "results_pending"
    SELECTION_PENDING_APPROVAL = "selection_pending_approval"
    SELECTION_CONFIRMED = "selection_confirmed"
    OFFERS_ISSUED = "offers_issued"
    CLOSED = "closed"


class EligibilityStatus(str, enum.Enum):
    PENDING = "pending"
    ELIGIBLE = "eligible"
    NOT_ELIGIBLE = "not_eligible"
    NEEDS_MANUAL_REVIEW = "needs_manual_review"


class ShortlistStatus(str, enum.Enum):
    NOT_SHORTLISTED = "not_shortlisted"
    PENDING_APPROVAL = "pending_approval"
    APPROVED = "approved"
    REJECTED = "rejected"


class ApplicationStatus(str, enum.Enum):
    APPLIED = "applied"
    ELIGIBLE = "eligible"
    MATCHED = "matched"
    SHORTLISTED = "shortlisted"
    INTERVIEW_SCHEDULED = "interview_scheduled"
    INTERVIEW_COMPLETED = "interview_completed"
    RESULT_PENDING = "result_pending"
    SELECTED = "selected"
    REJECTED = "rejected"
    WAITLISTED = "waitlisted"
    OFFER_ISSUED = "offer_issued"
    OFFER_ACCEPTED = "offer_accepted"
    OFFER_DECLINED = "offer_declined"


# ═══════════════════════════════════════════════════════════════════════════════
# Interview Enums
# ═══════════════════════════════════════════════════════════════════════════════

class InterviewMode(str, enum.Enum):
    ONLINE = "online"
    OFFLINE = "offline"


class InterviewRound(str, enum.Enum):
    ASSESSMENT = "assessment"
    TECHNICAL_1 = "technical_1"
    TECHNICAL_2 = "technical_2"
    HR = "hr"
    OTHER = "other"


class SlotStatus(str, enum.Enum):
    DRAFT = "draft"
    CONFIRMED = "confirmed"
    CONFLICT = "conflict"
    RESCHEDULED = "rescheduled"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class SlotGenerator(str, enum.Enum):
    AI_SCHEDULER = "ai_scheduler"
    MANUAL = "manual"


class PanelMemberType(str, enum.Enum):
    COLLEGE_SIDE = "college_side"
    COMPANY_SIDE = "company_side"
    MIXED = "mixed"


# ═══════════════════════════════════════════════════════════════════════════════
# Feedback & Offer Enums
# ═══════════════════════════════════════════════════════════════════════════════

class FeedbackDecision(str, enum.Enum):
    ADVANCE = "advance"
    REJECT = "reject"
    HOLD = "hold"


class OfferStatus(str, enum.Enum):
    ISSUED = "issued"
    ACCEPTED = "accepted"
    DECLINED = "declined"
    EXPIRED = "expired"


# ═══════════════════════════════════════════════════════════════════════════════
# Notification Enums
# ═══════════════════════════════════════════════════════════════════════════════

class NotificationType(str, enum.Enum):
    ELIGIBILITY_RESULT = "eligibility_result"
    SHORTLISTED = "shortlisted"
    INTERVIEW_SCHEDULED = "interview_scheduled"
    INTERVIEW_REMINDER = "interview_reminder"
    RESCHEDULED = "rescheduled"
    RESULT_DECLARED = "result_declared"
    OFFER_ISSUED = "offer_issued"
    GENERIC = "generic"


class NotificationChannel(str, enum.Enum):
    EMAIL = "email"
    SMS = "sms"
    IN_APP = "in_app"


class NotificationStatus(str, enum.Enum):
    QUEUED = "queued"
    SENT = "sent"
    FAILED = "failed"


# ═══════════════════════════════════════════════════════════════════════════════
# Audit Enums
# ═══════════════════════════════════════════════════════════════════════════════

class ActorType(str, enum.Enum):
    HUMAN = "human"
    AI_AGENT = "ai_agent"

# ═══════════════════════════════════════════════════════════════════════════════
# Register All Models
# ═══════════════════════════════════════════════════════════════════════════════
# Importing these ensures SQLAlchemy's declarative base knows about all relationships.

from .user import User
from .student import Student
from .college import College
from .company import Company
from .job_drive import JobDrive
from .application import Application
from .interview_slot import InterviewSlot
from .panel import Panel
from .room import Room
from .feedback import Feedback
from .offer import Offer
from .notification import Notification
from .audit_log import AuditLog
from .certification import Certification
from .coding_profile import CodingProfile
from .internship import Internship
from .project import Project
