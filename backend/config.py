
import os

IS_VERCEL = os.environ.get("VERCEL") == "1"

DATABASE_URL = os.environ.get("DATABASE_URL")

# Use the installed psycopg driver for PostgreSQL
if DATABASE_URL and DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace(
        "postgresql://", "postgresql+psycopg://", 1
    )

if IS_VERCEL:
    if not DATABASE_URL:
        raise RuntimeError(
            "DATABASE_URL is missing. Configure the PostgreSQL "
            "connection URL in Vercel Environment Variables."
        )
else:
    try:
        os.makedirs("./data", exist_ok=True)
    except OSError:
        pass

    if not DATABASE_URL:
        DATABASE_URL = "sqlite:///./data/skills.db"

ALLOWED_ORIGINS = [
    "http://localhost:8000",
    "http://localhost:3000",
]
