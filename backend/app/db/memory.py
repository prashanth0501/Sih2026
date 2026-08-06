"""
In-memory data store so the API runs with zero external services during
development. Swap this module for a real `db/mongo.py` (Motor client
against MongoDB Atlas) when you're ready — every router only calls the
functions below, never touches the dict directly, so that's the only file
that needs to change.

Everything resets when the process restarts. That's fine for local dev;
it is obviously not durable storage.
"""

import itertools
import uuid
from datetime import datetime, timezone

from app.core.security import hash_password

_id_counter = itertools.count(1)


def new_id(prefix: str) -> str:
    return f"{prefix}_{next(_id_counter)}_{uuid.uuid4().hex[:6]}"


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


DEFAULT_MEMBER_PASSWORD = "tm@123"

users: dict[str, dict] = {}
teams: dict[str, dict] = {}
problem_statements: dict[str, dict] = {}
announcements: dict[str, dict] = {}
content: dict[str, dict] = {}
audit_log: list[dict] = []
promo_posts: dict[str, dict] = {}
promo_shares: dict[str, dict] = {}


def find_user_by_email(email: str) -> dict | None:
    needle = email.lower()
    return next((u for u in users.values() if u["email"].lower() == needle), None)


def ensure_member_login(name: str, email: str, department: str, year: int) -> dict:
    """
    Team members get a real login too, not just an entry on the roster —
    always with the same default password (tm@123). If this email already
    has an account (e.g. they lead their own team, or were a member
    elsewhere before), leave it alone rather than overwriting it.
    """
    existing = find_user_by_email(email)
    if existing:
        return existing
    uid = new_id("user")
    user = {
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
    users[uid] = user
    return user


def seed() -> None:
    if users:
        return  # already seeded (module-level singleton)

    # The only three admin-panel accounts. /admin is not linked from public
    # nav — reaching it requires typing the URL directly, and only these
    # three logins (seeded here, passwords set by whoever deploys this)
    # can get past the gate. See ADMIN_CREDENTIALS.md (gitignored) for the
    # actual passwords issued to Partha, Nirmith, and Bhargav.
    demo_accounts = [
        ("Demo Participant", "participant@nagarjuna.edu", "participant123", "participant", None, None),
        ("Partha Shankar", "parthashankar21@gmail.com", "Spark#Partha2026", "coordinator", None, None),
        ("Nirmith M Jain", "nirmithmjain@gmail.com", "Spark#Nirmith2026", "coordinator", None, None),
        ("Bhargav R", "dr.bhargava@ncetmail.com", "Spark#Bhargav2026", "spoc", None, None),
    ]
    for name, email, password, role, dept, year in demo_accounts:
        uid = new_id("user")
        users[uid] = {
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
        problem_statements[pid] = {
            "id": pid,
            "sih_id": None,
            "title": theme,
            "organization": None,
            "theme": theme,
            "category": None,
            "description": blurb,
            "difficulty": None,
        }

    content["principal-message"] = {
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
    }
    content["profile-bhargav"] = {
        "slug": "profile-bhargav",
        "type": "profile",
        "payload": {"name": "Bhargav R", "role": "College SPOC", "bio": "Owns final selection and publishes results."},
    }
    content["profile-partha"] = {
        "slug": "profile-partha",
        "type": "profile",
        "payload": {"name": "Partha Shankar", "role": "Coordinator", "bio": "Runs the day-to-day of the internal hackathon."},
    }
    content["profile-nirmith"] = {
        "slug": "profile-nirmith",
        "type": "profile",
        "payload": {"name": "Nirmith M Jain", "role": "Coordinator", "bio": "Works alongside Partha on logistics and communication."},
    }

    promo_posts["promo_seed_1"] = {
        "id": "promo_seed_1",
        "title": "Registration is open",
        "caption": "Got an idea that could fix something broken around you? SIH 2026 registrations are open at our college — form a team and find out how far it can go.",
        "hashtags": ["#SIH2026", "#SmartIndiaHackathon", "#Nagarjuna"],
        "media_url": None,
        "is_published": True,
        "created_at": now_iso(),
    }
    promo_posts["promo_seed_2"] = {
        "id": "promo_seed_2",
        "title": "Meet the coordinators",
        "caption": "Two rounds. Real feedback. One shot at the national stage. Here is how SIH 2026 works at our college.",
        "hashtags": ["#SIH2026", "#Innovation", "#StudentLed"],
        "media_url": None,
        "is_published": True,
        "created_at": now_iso(),
    }


seed()
