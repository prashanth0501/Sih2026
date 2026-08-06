"""
MongoDB-backed data store, via Motor. Replaces app/db/memory.py — every router
now calls `await` on the functions/collections here instead of touching a dict
directly. See docs/MONGODB_MIGRATION.md for full architectural details.
"""

import itertools
import os
import uuid
from datetime import datetime, timezone

from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import settings

_id_counter = itertools.count(1)


def new_id(prefix: str) -> str:
    return f"{prefix}_{next(_id_counter)}_{uuid.uuid4().hex[:6]}"


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


DEFAULT_MEMBER_PASSWORD = "tm@123"

# Initialize Motor Client with high-performance connection pooling
uri = settings.mongodb_uri or "mongodb://localhost:27017"
client = AsyncIOMotorClient(
    uri,
    maxPoolSize=50,
    minPoolSize=5,
    maxIdleTimeMS=45000,
    connectTimeoutMS=10000,
    serverSelectionTimeoutMS=10000,
    retryWrites=True,
)
db = client[settings.mongodb_db_name]

users = db["users"]
teams = db["teams"]
problem_statements = db["problem_statements"]
announcements = db["announcements"]
content = db["content"]
audit_log = db["audit_log"]
promo_posts = db["promo_posts"]
promo_shares = db["promo_shares"]
system_settings = db["system_settings"]


import re


async def find_user_by_email(email: str) -> dict | None:
    escaped_email = re.escape(email.strip())
    return await users.find_one({"email": {"$regex": f"^{escaped_email}$", "$options": "i"}})


async def ensure_member_login(name: str, email: str, department: str, year: int) -> dict:
    existing = await find_user_by_email(email)
    if existing:
        return existing

    from app.core.security import hash_password  # local import avoids circular import

    uid = new_id("user")
    user = {
        "_id": uid,
        "id": uid,
        "name": name,
        "email": email,
        "password_hash": hash_password(DEFAULT_MEMBER_PASSWORD),
        "role": "participant",
        "department": department,
        "year": year,
        "photo_url": None,
        "created_at": now_iso(),
    }
    await users.insert_one(user)
    return user


async def ensure_indexes() -> None:
    await users.create_index("email", unique=True)
    await teams.create_index("leader_id")
    await teams.create_index("members.email")
    await teams.create_index("status")
    await promo_shares.create_index("promo_post_id")
    await promo_posts.create_index("is_published")


async def seed() -> None:
    if await users.count_documents({}) > 0:
        return  # Already seeded

    from app.core.security import hash_password

    # Staff & Demo accounts
    partha_pass = os.getenv("STAFF_PARTHA_PASSWORD", "Spark#Partha2026")
    nirmith_pass = os.getenv("STAFF_NIRMITH_PASSWORD", "Spark#Nirmith2026")
    bhargav_pass = os.getenv("STAFF_BHARGAV_PASSWORD", "Spark#Bhargav2026")

    demo_accounts = [
        ("Demo Participant", "participant@nagarjuna.edu", "participant123", "participant", None, None),
        ("Partha Shankar", "parthashankar21@gmail.com", partha_pass, "coordinator", None, None),
        ("Nirmith M Jain", "nirmithmjain@gmail.com", nirmith_pass, "coordinator", None, None),
        ("Bhargav R", "dr.bhargava@ncetmail.com", bhargav_pass, "spoc", None, None),
    ]

    for name, email, password, role, dept, year in demo_accounts:
        uid = new_id("user")
        await users.insert_one(
            {
                "_id": uid,
                "id": uid,
                "name": name,
                "email": email,
                "password_hash": hash_password(password),
                "role": role,
                "department": dept,
                "year": year,
                "photo_url": None,
                "created_at": now_iso(),
            }
        )

    # Problem Statement Themes
    themes = [
        ("Smart Automation", "Make repetitive, manual work run itself."),
        ("Fitness & Sports", "Help people train, recover, and play better."),
        ("Space Technology", "Tools for satellites, orbits, and exploration."),
        ("Heritage & Culture", "Protect and share what makes a place unique."),
        ("MedTech / BioTech / HealthTech", "Better care, earlier diagnosis, easier access."),
        ("Agriculture & Rural Development", "More yield, less waste, fairer prices for farmers."),
        ("Smart Vehicles", "Safer, cleaner, smarter ways to move."),
        ("Transportation & Logistics", "Get people and goods where they need to be, faster."),
        ("Robotics & Drones", "Machines that can see, move, and act on their own."),
        ("Clean & Green Technology", "Less waste, less carbon, more circular systems."),
        ("Tourism", "Make travel easier to plan, book, and enjoy."),
        ("Renewable Energy", "Generate, store, and share clean power better."),
        ("Blockchain & Cybersecurity", "Keep data, identity, and money safe."),
        ("Smart Education", "Learning that adapts to the student, not the other way round."),
        ("Disaster Management", "Predict, warn, and respond before it is too late."),
        ("Games & Toys", "Play that teaches, includes, or just delights."),
        ("FinTech", "Simpler, fairer access to money and credit."),
        ("Miscellaneous", "A real problem that does not fit a neat box — bring it anyway."),
    ]

    for theme, blurb in themes:
        pid = new_id("ps")
        await problem_statements.insert_one(
            {
                "_id": pid,
                "id": pid,
                "sih_id": None,
                "title": theme,
                "organization": None,
                "theme": theme,
                "category": None,
                "description": blurb,
                "difficulty": None,
            }
        )

    # Initial Content Blocks
    blocks = [
        {
            "_id": "principal-message",
            "slug": "principal-message",
            "type": "message",
            "payload": {
                "name": "Principal",
                "quote": "Innovation isn't a subject you pass. It's a habit you build — and this is where our students build it first.",
                "message": [
                    "Every year, Smart India Hackathon gives our students a rare kind of exam — one with no textbook answer.",
                    "This portal exists so that process is fair, visible, and worth remembering.",
                ],
            },
        },
        {
            "_id": "profile-bhargav",
            "slug": "profile-bhargav",
            "type": "profile",
            "payload": {"name": "Bhargav R", "role": "College SPOC", "bio": "Owns final selection and publishes results."},
        },
        {
            "_id": "profile-partha",
            "slug": "profile-partha",
            "type": "profile",
            "payload": {"name": "Partha Shankar", "role": "Coordinator", "bio": "Runs the day-to-day of the internal hackathon."},
        },
        {
            "_id": "profile-nirmith",
            "slug": "profile-nirmith",
            "type": "profile",
            "payload": {"name": "Nirmith M Jain", "role": "Coordinator", "bio": "Works alongside Partha on logistics and communication."},
        },
    ]

    for b in blocks:
        await content.insert_one(b)

    # Promo Seed Posts
    promos = [
        {
            "_id": "promo_seed_1",
            "id": "promo_seed_1",
            "title": "Registration is open",
            "caption": "Got an idea that could fix something broken around you? SIH 2026 registrations are open at our college — form a team and find out how far it can go.",
            "hashtags": ["#SIH2026", "#SmartIndiaHackathon", "#Nagarjuna"],
            "media_url": None,
            "is_published": True,
            "created_at": now_iso(),
        },
        {
            "_id": "promo_seed_2",
            "id": "promo_seed_2",
            "title": "Meet the coordinators",
            "caption": "Two rounds. Real feedback. One shot at the national stage. Here is how SIH 2026 works at our college.",
            "hashtags": ["#SIH2026", "#Innovation", "#StudentLed"],
            "media_url": None,
            "is_published": True,
            "created_at": now_iso(),
        },
    ]

    for p in promos:
        await promo_posts.insert_one(p)


async def get_system_settings() -> dict:
    settings_doc = await system_settings.find_one({"_id": "global_settings"})
    if not settings_doc:
        settings_doc = {
            "_id": "global_settings",
            "id": "global_settings",
            "registration_open": True,
            "level1_open": True,
            "level2_open": True,
            "updated_at": now_iso(),
        }
        await system_settings.insert_one(settings_doc)
    return settings_doc


async def update_system_settings(updates: dict) -> dict:
    from pymongo import ReturnDocument
    updates["updated_at"] = now_iso()
    doc = await system_settings.find_one_and_update(
        {"_id": "global_settings"},
        {"$set": updates},
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )
    return doc or await get_system_settings()
