"""
The screening state machine — the only code allowed to move a team between
statuses (ARCHITECTURE.md section 6). Every transition here writes an
auditLog entry, so the whole review history is reconstructable later.
"""

from fastapi import HTTPException, status

from app.db import memory
from app.models.team import ALLOWED_TRANSITIONS, ScreeningStatus


def transition(team: dict, to_status: ScreeningStatus, actor_id: str, action: str) -> None:
    from_status: ScreeningStatus = team["status"]
    if to_status not in ALLOWED_TRANSITIONS.get(from_status, []):
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            f"Cannot move a team from '{from_status}' to '{to_status}'",
        )
    team["status"] = to_status
    team["updated_at"] = memory.now_iso()
    memory.audit_log.append(
        {
            "id": memory.new_id("audit"),
            "team_id": team["id"],
            "action": action,
            "from_status": from_status,
            "to_status": to_status,
            "actor_id": actor_id,
            "timestamp": memory.now_iso(),
        }
    )


def submit_level(team: dict, level: int, submission_url: str, actor_id: str) -> None:
    if level == 1:
        team["level1"]["submission_url"] = submission_url
        transition(team, "l1_submitted", actor_id, "submit_level_1")
    else:
        team["level2"]["submission_url"] = submission_url
        transition(team, "l2_submitted", actor_id, "submit_level_2")


def open_for_review(team: dict, level: int, actor_id: str) -> None:
    target: ScreeningStatus = "l1_under_review" if level == 1 else "l2_under_review"
    transition(team, target, actor_id, f"open_level_{level}_review")


def record_decision(team: dict, level: int, score: int, feedback: str, passed: bool, actor_id: str) -> None:
    round_key = "level1" if level == 1 else "level2"
    team[round_key]["score"] = score
    team[round_key]["feedback"] = feedback
    team[round_key]["reviewer_id"] = actor_id
    team[round_key]["reviewed_at"] = memory.now_iso()

    if level == 1:
        target: ScreeningStatus = "l1_cleared" if passed else "l1_rejected"
    else:
        target = "selected" if passed else "l2_rejected"
    transition(team, target, actor_id, f"decide_level_{level}")
