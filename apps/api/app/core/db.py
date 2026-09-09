from collections.abc import AsyncGenerator

from prisma import Prisma

db = Prisma(auto_register=True)


async def get_db() -> AsyncGenerator[Prisma]:
    """FastAPI dependency providing access to the connected Prisma client."""
    if not db.is_connected():
        await db.connect()
    yield db
