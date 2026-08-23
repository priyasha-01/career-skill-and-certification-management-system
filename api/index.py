import os
import sys

# Add project root to sys.path to ensure backend imports work in Vercel Serverless environment
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.database import init_db
from backend.config import ALLOWED_ORIGINS
from backend.routers import students, skills, certifications, analytics

# Initialize SQLite database schema and seed if empty (Runs during Vercel Cold Start)
init_db()

# Create FastAPI instance with explicit Swagger & OpenAPI URLs
app = FastAPI(
    title="Student Skill & Certification Management System API",
    description="Backend services for tracking student skill matrices, certification catalogs, and dashboard analytics.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers under v1 prefix
app.include_router(analytics.router, prefix="/api/v1")
app.include_router(students.router, prefix="/api/v1")
app.include_router(skills.router, prefix="/api/v1")
app.include_router(certifications.router, prefix="/api/v1")

@app.get("/api/v1/health")
def health_check():
    """Service health status check."""
    return {"status": "healthy", "database": "connected"}

# Mount Static Frontend Files (used for local development)
# On Vercel, static routing takes precedence via vercel.json rules.
# This fallback allows 'python run.py' to serve the UI seamlessly.
if os.path.exists("public"):
    app.mount("/", StaticFiles(directory="public", html=True), name="public")
