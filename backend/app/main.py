from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.middleware import SecurityHeadersMiddleware
from app.db import mongo
from app.routers import (
    announcements,
    auth,
    content,
    problem_statements,
    promotions,
    results,
    screening,
    stats,
    teams,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await mongo.ensure_indexes()
        await mongo.seed()
    except Exception as e:
        print(f"MongoDB lifespan startup notice: {e}")
    yield
    mongo.client.close()


app = FastAPI(title=settings.app_name, lifespan=lifespan)

# CORS Configuration (Configured first to handle OPTIONS preflight cleanly)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=r"https://.*\.pages\.dev",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Production Security Headers Middleware
app.add_middleware(SecurityHeadersMiddleware)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Production exception handler preventing internal traceback leaks."""
    print(f"Unhandled error handling {request.method} {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal error occurred. Please try again later."},
    )


app.include_router(auth.router)
app.include_router(teams.router)
app.include_router(screening.router)
app.include_router(problem_statements.router)
app.include_router(announcements.router)
app.include_router(content.router)
app.include_router(results.router)
app.include_router(stats.router)
app.include_router(promotions.router)


@app.get("/")
def root():
    return {"name": settings.app_name, "docs": "/docs", "status": "online"}
