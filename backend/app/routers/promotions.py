from urllib.parse import urlparse

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.core.deps import require_role
from app.core.rate_limit import limiter_write
from app.db import mongo
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


async def _share_count(promo_id: str) -> int:
    return await mongo.promo_shares.count_documents({"promo_post_id": promo_id})


@router.post("", response_model=PromoPostPublic, status_code=status.HTTP_201_CREATED)
async def create_promo_post(body: PromoPostCreate, user: dict = Depends(require_role("coordinator"))):
    pid = mongo.new_id("promo")
    record = {
        "_id": pid,
        "id": pid,
        **body.model_dump(),
        "is_published": True,
        "created_at": mongo.now_iso(),
    }
    await mongo.promo_posts.insert_one(record)
    return {**record, "share_count": 0}


@router.get("", response_model=list[PromoPostPublic])
async def list_promo_posts():
    cursor = mongo.promo_posts.find({"is_published": True})
    posts = await cursor.to_list(length=None)
    result = []
    for p in posts:
        count = await _share_count(p["id"])
        result.append({**p, "share_count": count})
    return result


@router.post("/{promo_id}/shares", response_model=PromoSharePublic, status_code=status.HTTP_201_CREATED)
async def submit_share(promo_id: str, body: PromoShareCreate):
    promo = await mongo.promo_posts.find_one({"_id": promo_id})
    if not promo:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Promo post not found")

    sid = mongo.new_id("share")
    record = {
        "_id": sid,
        "id": sid,
        **body.model_dump(),
        "promo_post_id": promo_id,
        "platform": detect_platform(body.post_url),
        "submitted_at": mongo.now_iso(),
    }
    await mongo.promo_shares.insert_one(record)
    count = await _share_count(promo_id)
    return {**record, "count_for_post": count}


@router.get("/shares", response_model=list[PromoSharePublic])
async def list_all_shares(_coordinator: dict = Depends(require_role("coordinator"))):
    cursor = mongo.promo_shares.find({}).sort("submitted_at", -1)
    shares = await cursor.to_list(length=None)
    result = []
    for s in shares:
        count = await _share_count(s["promo_post_id"])
        result.append({**s, "count_for_post": count})
    return result


@router.get("/{promo_id}/shares", response_model=list[PromoSharePublic])
async def list_shares(promo_id: str, _coordinator: dict = Depends(require_role("coordinator"))):
    cursor = mongo.promo_shares.find({"promo_post_id": promo_id})
    shares = await cursor.to_list(length=None)
    count = await _share_count(promo_id)
    return [{**s, "count_for_post": count} for s in shares]


@router.get("/wall", response_model=list[PromoSharePublic])
async def public_wall():
    cursor = mongo.promo_shares.find({"is_public_on_wall": True}).sort("submitted_at", -1)
    shares = await cursor.to_list(length=None)
    result = []
    for s in shares:
        count = await _share_count(s["promo_post_id"])
        result.append({**s, "count_for_post": count})
    return result
