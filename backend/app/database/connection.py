import os

from asyncpg import create_pool
from dotenv import load_dotenv

pool = None


async def init_pool():
    """Initialize a connection pool."""
    global pool

    # Load dsn environment variable from .env file
    load_dotenv()
    dsn = os.getenv("DATABASE_URL")
    if not dsn:
        raise ValueError("DATABASE_URL environment variable not set")

    pool = await create_pool(dsn)


def get_pool():
    """Get the connection pool."""
    return pool


async def close_pool():
    """Close the connection pool."""
    global pool
    if pool is not None:
        await pool.close()
