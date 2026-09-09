from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.core.db import db


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
    description="Forge Enterprise Internal File Hub API",
    version="0.0.1",
    lifespan=lifespan,
)


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