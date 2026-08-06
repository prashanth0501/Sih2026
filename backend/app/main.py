from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
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

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
    return {"name": settings.app_name, "docs": "/docs"}
