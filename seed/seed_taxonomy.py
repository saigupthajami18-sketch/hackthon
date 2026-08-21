"""
PlacementOps AI — Seed Taxonomy (§6.4)
"""
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import engine, async_session
from app.models.student import SkillTaxonomy

async def seed_taxonomy(db: AsyncSession):
    # Sample taxonomy
    skills = [
        {"canonical_name": "Python", "aliases": ["python3", "py"], "category": "Language"},
        {"canonical_name": "JavaScript", "aliases": ["js", "es6", "vanilla js"], "category": "Language"},
        {"canonical_name": "React", "aliases": ["react.js", "reactjs"], "category": "Framework"},
        {"canonical_name": "SQL", "aliases": ["mysql", "postgresql", "postgres"], "category": "Language"},
        {"canonical_name": "Docker", "aliases": ["docker-compose"], "category": "Tool"},
        {"canonical_name": "AWS", "aliases": ["amazon web services", "ec2", "s3"], "category": "Cloud"},
        {"canonical_name": "Git", "aliases": ["github", "gitlab", "version control"], "category": "Tool"},
        {"canonical_name": "REST API", "aliases": ["rest", "restful", "api"], "category": "Concept"},
        {"canonical_name": "OOP", "aliases": ["object oriented programming", "oops"], "category": "Concept"},
        {"canonical_name": "C++", "aliases": ["cpp", "c/c++"], "category": "Language"},
        {"canonical_name": "Java", "aliases": ["core java", "j2ee"], "category": "Language"},
    ]

    for s in skills:
        skill = SkillTaxonomy(**s)
        db.add(skill)
    
    await db.commit()
    print(f"Seeded {len(skills)} skills into SkillTaxonomy.")

async def main():
    async with async_session() as session:
        await seed_taxonomy(session)

if __name__ == "__main__":
    asyncio.run(main())
