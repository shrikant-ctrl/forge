from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.common.filters.http_exception_filter import http_exception_filter
from app.core.db import db
from app.core.exceptions import HttpException
from app.modules.auth.auth_controller import router as auth_router
from app.modules.files.files_controller import router as files_router
from app.modules.folders.folders_controller import router as folders_router


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Connect Prisma on application startup
    await db.connect()
    yield
    # Disconnect Prisma on application shutdown
    if db.is_connected():
        await db.disconnect()


app = FastAPI(
    title="Forge",
    description="Forge Enterprise Internal File Hub API (Modular Architecture)",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Filters (NestJS-style)
app.add_exception_handler(HttpException, http_exception_filter)

# Mount Feature Modules under /api
app.include_router(auth_router, prefix="/api")
app.include_router(folders_router, prefix="/api")
app.include_router(files_router, prefix="/api")


@app.get("/")
def read_root() -> dict[str, str]:
    return {"message": "Forge Internal File Hub API"}


@app.get("/health")
async def health() -> dict[str, str]:
    is_connected = db.is_connected()
    return {
        "status": "ok",
        "database": "connected" if is_connected else "disconnected",
    }
