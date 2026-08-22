"""
PlacementOps AI — Database Engine & Session
Supports PostgreSQL (asyncpg) and SQLite (aiosqlite).
"""

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase

from app.config import settings


class Base(DeclarativeBase):
    pass


engine_kwargs = {
    "echo": False,
}

if "sqlite" in settings.DATABASE_URL:
    pass
else:
    engine_kwargs["pool_pre_ping"] = True
    engine_kwargs["pool_size"] = 10
    engine_kwargs["max_overflow"] = 20

engine = create_async_engine(
    settings.DATABASE_URL,
    **engine_kwargs
)

async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db():
    """FastAPI dependency — yields an async database session."""
    async with async_session() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
