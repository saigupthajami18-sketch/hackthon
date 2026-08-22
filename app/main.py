"""
PlacementOps AI — FastAPI Entry Point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.routers import (
    auth, drives, eligibility, matching, scheduling,
    resources, feedback_offers, notifications, analytics,
    audit, admin, students, assistant
)
from app.routers import college as college_router
from app.database import engine, Base

# Import all models so SQLAlchemy registers them before create_all
import app.models  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(
    title="PlacementOps AI",
    description="AI-Powered Campus Placement Operations",
    version="2.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(drives.router)
app.include_router(eligibility.router)
app.include_router(matching.router)
app.include_router(scheduling.router)
app.include_router(resources.router)
app.include_router(feedback_offers.router)
app.include_router(notifications.router)
app.include_router(analytics.router)
app.include_router(audit.router)
app.include_router(admin.router)
app.include_router(students.router)
app.include_router(assistant.router)
app.include_router(college_router.router)


@app.get("/")
async def root():
    return {"message": "PlacementOps AI API is running", "version": "2.0"}
