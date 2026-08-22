"""
PlacementOps AI — Application Configuration
Loads all settings from environment variables via Pydantic Settings.
"""

from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List


class Settings(BaseSettings):
    """Central configuration — every secret and tunable lives here."""

    # ── App ───────────────────────────────────────────────────────────────
    APP_ENV: str = "development"
    APP_DEBUG: bool = True
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000

    @property
    def cors_origins_list(self) -> List[str]:
        return [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:5174",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:5174",
        ]

    # ── Database ──────────────────────────────────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://placementops:placementops@localhost:5432/placementops_db"

    # ── JWT Auth ──────────────────────────────────────────────────────────
    JWT_SECRET_KEY: str = "your-super-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours for hackathon convenience
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── Google Gemini ─────────────────────────────────────────────────────
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash"
    GEMINI_EMBEDDING_MODEL: str = "text-embedding-004"

    # ── S3 File Storage ───────────────────────────────────────────────────
    S3_ENDPOINT_URL: str = "http://localhost:9000"
    S3_ACCESS_KEY: str = "minioadmin"
    S3_SECRET_KEY: str = "minioadmin"
    S3_BUCKET_NAME: str = "placementops"
    S3_REGION: str = "us-east-1"

    # ── Email (SMTP) ──────────────────────────────────────────────────────
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = "noreply@placementops.ai"
    SMTP_FROM_NAME: str = "PlacementOps AI"

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
        "extra": "ignore",
    }


# Singleton instance
settings = Settings()
