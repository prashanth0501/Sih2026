"""
The screening state machine — the only code allowed to move a team between
statuses (ARCHITECTURE.md section 6). Every transition here writes an
auditLog entry, so the whole review history is reconstructable later.
"""

from fastapi import HTTPException, status
from pymongo import ReturnDocument

from app.db import mongo
from app.models.team import ALLOWED_TRANSITIONS, ScreeningStatus


async def transition(team: dict, to_status: ScreeningStatus, actor_id: str, action: str) -> dict:
    from_status: ScreeningStatus = team["status"]
    if to_status not in ALLOWED_TRANSITIONS.get(from_status, []):
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            f"Cannot move a team from '{from_status}' to '{to_status}'",
        )

    now = mongo.now_iso()
    updated = await mongo.teams.find_one_and_update(
        {"_id": team["id"]},
        {"$set": {"status": to_status, "updated_at": now}},
        return_document=ReturnDocument.AFTER,
    )

    audit_id = mongo.new_id("audit")
    await mongo.audit_log.insert_one(
        {
            "_id": audit_id,
            "id": audit_id,
            "team_id": team["id"],
            "action": action,
            "from_status": from_status,
            "to_status": to_status,
            "actor_id": actor_id,
            "timestamp": now,
        }
    )
    return updated or team


async def submit_level(team: dict, level: int, submission_url: str, actor_id: str) -> dict:
    now = mongo.now_iso()
    round_key = "level1" if level == 1 else "level2"

    await mongo.teams.update_one(
        {"_id": team["id"]},
        {"$set": {f"{round_key}.submission_url": submission_url, "updated_at": now}},
    )
    team[round_key]["submission_url"] = submission_url

    target_status = "l1_submitted" if level == 1 else "l2_submitted"
    return await transition(team, target_status, actor_id, f"submit_level_{level}")


async def open_for_review(team: dict, level: int, actor_id: str) -> dict:
    target: ScreeningStatus = "l1_under_review" if level == 1 else "l2_under_review"
    return await transition(team, target, actor_id, f"open_level_{level}_review")


async def record_decision(team: dict, level: int, score: int, feedback: str, passed: bool, actor_id: str) -> dict:
    round_key = "level1" if level == 1 else "level2"
    now = mongo.now_iso()

    await mongo.teams.update_one(
        {"_id": team["id"]},
        {
            "$set": {
                f"{round_key}.score": score,
                f"{round_key}.feedback": feedback,
                f"{round_key}.reviewer_id": actor_id,
                f"{round_key}.reviewed_at": now,
                "updated_at": now,
            }
        },
    )
    team[round_key]["score"] = score
    team[round_key]["feedback"] = feedback
    team[round_key]["reviewer_id"] = actor_id
    team[round_key]["reviewed_at"] = now

    if level == 1:
        target: ScreeningStatus = "l1_cleared" if passed else "l1_rejected"
    else:
        target = "selected" if passed else "l2_rejected"
    return await transition(team, target, actor_id, f"decide_level_{level}")
