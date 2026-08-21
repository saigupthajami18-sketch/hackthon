"""
PlacementOps AI — Application Configuration
Loads all settings from environment variables via Pydantic Settings.
"""

from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List
import json


class Settings(BaseSettings):
    """Central configuration — every secret and tunable lives here."""

    # ── App ───────────────────────────────────────────────────────────────
    APP_ENV: str = "development"
    APP_DEBUG: bool = True
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000
    CORS_ORIGINS: str = '["http://localhost:3000","http://localhost:5173"]'

    @property
    def cors_origins_list(self) -> List[str]:
        return json.loads(self.CORS_ORIGINS)

    # ── Database ──────────────────────────────────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://placementops:placementops@localhost:5432/placementops_db"

    @property
    def database_url_sync(self) -> str:
        """Sync URL for Alembic migrations."""
        return self.DATABASE_URL.replace("+asyncpg", "")

    # ── JWT Auth ──────────────────────────────────────────────────────────
    JWT_SECRET_KEY: str = "your-super-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── Google Gemini ─────────────────────────────────────────────────────
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash"
    GEMINI_EMBEDDING_MODEL: str = "text-embedding-004"

    # ── Google Calendar / Meet ────────────────────────────────────────────
    GOOGLE_CALENDAR_CREDENTIALS_PATH: str = "credentials.json"
    GOOGLE_CALENDAR_TOKEN_PATH: str = "token.json"

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
    }


# Singleton instance
settings = Settings()
