import os

# Detect if running in Vercel Serverless environment
IS_VERCEL = os.environ.get("VERCEL") == "1"

# Define SQLite Database URL
# In Vercel, the filesystem is read-only except for /tmp.
# For local dev, store it in the workspace under ./data/skills.db.
if IS_VERCEL:
    DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:////tmp/skills.db")
else:
    # Ensure local directory exists (handled in run.py, but safe fallback here)
    try:
        os.makedirs("./data", exist_ok=True)
    except OSError:
        pass
    DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./data/skills.db")

# CORS configurations
ALLOWED_ORIGINS = [
    "http://localhost:8000",
    "http://localhost:3000",
    "https://*.vercel.app"
]
