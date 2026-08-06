from urllib.parse import urlparse

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import require_role
from app.db import memory
from app.models.promotion import PromoPostCreate, PromoPostPublic, PromoShareCreate, PromoSharePublic

router = APIRouter(prefix="/api/v1/promotions", tags=["promotions"])

_PLATFORM_HOSTS = {
    "instagram.com": "Instagram",
    "linkedin.com": "LinkedIn",
    "facebook.com": "Facebook",
    "fb.watch": "Facebook",
    "twitter.com": "X",
    "x.com": "X",
    "whatsapp.com": "WhatsApp",
    "youtube.com": "YouTube",
    "youtu.be": "YouTube",
}


def detect_platform(url: str) -> str:
    host = (urlparse(url).hostname or "").lower().removeprefix("www.").removeprefix("m.")
    for domain, name in _PLATFORM_HOSTS.items():
        if host == domain or host.endswith("." + domain):
            return name
    return "Other"


def _share_count(promo_id: str) -> int:
    return sum(1 for s in memory.promo_shares.values() if s["promo_post_id"] == promo_id)


@router.post("", response_model=PromoPostPublic, status_code=status.HTTP_201_CREATED)
def create_promo_post(body: PromoPostCreate, user: dict = Depends(require_role("coordinator"))):
    pid = memory.new_id("promo")
    record = {**body.model_dump(), "id": pid, "is_published": True, "created_at": memory.now_iso()}
    memory.promo_posts[pid] = record
    return {**record, "share_count": 0}


@router.get("", response_model=list[PromoPostPublic])
def list_promo_posts():
    return [{**p, "share_count": _share_count(p["id"])} for p in memory.promo_posts.values() if p["is_published"]]


@router.post("/{promo_id}/shares", response_model=PromoSharePublic, status_code=status.HTTP_201_CREATED)
def submit_share(promo_id: str, body: PromoShareCreate):
    """
    Public and unauthenticated on purpose — a student pastes their own
    name and USN instead of logging in. Platform is detected from the URL
    server-side, not trusted from the client.
    """
    if promo_id not in memory.promo_posts:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Promo post not found")

    sid = memory.new_id("share")
    record = {
        **body.model_dump(),
        "id": sid,
        "promo_post_id": promo_id,
        "platform": detect_platform(body.post_url),
        "submitted_at": memory.now_iso(),
    }
    memory.promo_shares[sid] = record
    return {**record, "count_for_post": _share_count(promo_id)}


@router.get("/shares", response_model=list[PromoSharePublic])
def list_all_shares(_coordinator: dict = Depends(require_role("coordinator"))):
    rows = sorted(memory.promo_shares.values(), key=lambda s: s["submitted_at"], reverse=True)
    return [{**s, "count_for_post": _share_count(s["promo_post_id"])} for s in rows]


@router.get("/{promo_id}/shares", response_model=list[PromoSharePublic])
def list_shares(promo_id: str, _coordinator: dict = Depends(require_role("coordinator"))):
    return [{**s, "count_for_post": _share_count(promo_id)} for s in memory.promo_shares.values() if s["promo_post_id"] == promo_id]


@router.get("/wall", response_model=list[PromoSharePublic])
def public_wall():
    rows = [s for s in memory.promo_shares.values() if s["is_public_on_wall"]]
    rows.sort(key=lambda s: s["submitted_at"], reverse=True)
    return [{**s, "count_for_post": _share_count(s["promo_post_id"])} for s in rows]
