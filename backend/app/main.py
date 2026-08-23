from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import random
import string
from datetime import datetime

from .database import engine, Base, get_db
from . import models, schemas

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Career Skill & Certification System API",
    description="Mini-project REST API for managing skills, student enrollments, progress tracking, and verifiable certificates.",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def generate_cert_code(category: str) -> str:
    prefix = category.replace(" ", "").upper()[:4]
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"CERT-{prefix}-2026-{random_str}"

def seed_initial_data():
    db = next(get_db())
    if db.query(models.Skill).count() == 0:
        skills_data = [
            models.Skill(
                title="AWS Cloud Architecture & Engineering",
                category="Cloud",
                description="Design, deploy, and scale highly available microservices on AWS EC2, Cloud Run, and RDS PostgreSQL.",
                duration_hours=24,
                level="Advanced",
                icon="cloud"
            ),
            models.Skill(
                title="Docker & Kubernetes Masterclass",
                category="DevOps",
                description="Containerize application workloads, manage container orchestration, and write production K8s manifests.",
                duration_hours=18,
                level="Intermediate",
                icon="cpu"
            ),
            models.Skill(
                title="FastAPI & Async Python Development",
                category="Backend",
                description="Build high-performance REST APIs, implement automatic Swagger docs, SQLAlchemy ORM, and async handlers.",
                duration_hours=12,
                level="Intermediate",
                icon="server"
            ),
            models.Skill(
                title="Web Security & Vulnerability Assessment",
                category="Security",
                description="Understand CORS, JWT validation, SQL injection prevention, and secure cloud networking protocols.",
                duration_hours=15,
                level="Beginner",
                icon="shield"
            ),
            models.Skill(
                title="React UI & State Optimization",
                category="Frontend",
                description="Master component lifecycle, responsive layouts, glassmorphism UI design, and async state synchronization.",
                duration_hours=16,
                level="Intermediate",
                icon="layout"
            ),
            models.Skill(
                title="Machine Learning Pipelines & MLOps",
                category="AI & Data",
                description="Build end-to-end ML training pipelines, model monitoring, and automated feature engineering.",
                duration_hours=20,
                level="Beginner",
                icon="database"
            )
        ]
        db.add_all(skills_data)
        db.commit()

        # Seed sample completed enrollment & certificate
        skill_1 = db.query(models.Skill).filter(models.Skill.id == 1).first()
        enrollment_1 = models.Enrollment(
            skill_id=skill_1.id,
            progress_percentage=100,
            status="Completed"
        )
        db.add(enrollment_1)
        db.commit()
        db.refresh(enrollment_1)

        cert_1 = models.Certification(
            skill_id=skill_1.id,
            enrollment_id=enrollment_1.id,
            certificate_code="CERT-CLOU-2026-98412X"
        )
        db.add(cert_1)

        # Seed sample in-progress enrollment
        skill_3 = db.query(models.Skill).filter(models.Skill.id == 3).first()
        enrollment_2 = models.Enrollment(
            skill_id=skill_3.id,
            progress_percentage=50,
            status="In Progress"
        )
        db.add(enrollment_2)
        db.commit()

# Seed database on application startup
@app.on_event("startup")
def startup_event():
    seed_initial_data()

@app.get("/")
def read_root():
    return {"message": "Career Skill & Certification System API is active", "docs": "/docs"}

# --- SKILLS ENDPOINTS ---
@app.get("/api/skills", response_model=List[schemas.SkillOut])
def get_skills(db: Session = Depends(get_db)):
    return db.query(models.Skill).all()

@app.get("/api/skills/{skill_id}", response_model=schemas.SkillOut)
def get_skill(skill_id: int, db: Session = Depends(get_db)):
    skill = db.query(models.Skill).filter(models.Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    return skill

@app.post("/api/skills", response_model=schemas.SkillOut, status_code=status.HTTP_201_CREATED)
def create_skill(skill: schemas.SkillCreate, db: Session = Depends(get_db)):
    new_skill = models.Skill(**skill.dict())
    db.add(new_skill)
    db.commit()
    db.refresh(new_skill)
    return new_skill

# --- ENROLLMENTS ENDPOINTS ---
@app.get("/api/enrollments", response_model=List[schemas.EnrollmentOut])
def get_enrollments(db: Session = Depends(get_db)):
    return db.query(models.Enrollment).all()

@app.post("/api/enroll/{skill_id}", response_model=schemas.EnrollmentOut)
def enroll_skill(skill_id: int, db: Session = Depends(get_db)):
    skill = db.query(models.Skill).filter(models.Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    existing = db.query(models.Enrollment).filter(models.Enrollment.skill_id == skill_id).first()
    if existing:
        return existing

    new_enrollment = models.Enrollment(
        skill_id=skill_id,
        progress_percentage=0,
        status="Enrolled"
    )
    db.add(new_enrollment)
    db.commit()
    db.refresh(new_enrollment)
    return new_enrollment

@app.put("/api/enrollments/{enrollment_id}/progress", response_model=schemas.EnrollmentOut)
def update_progress(enrollment_id: int, progress: schemas.ProgressUpdate, db: Session = Depends(get_db)):
    enrollment = db.query(models.Enrollment).filter(models.Enrollment.id == enrollment_id).first()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")

    new_pct = max(0, min(100, progress.progress_percentage))
    enrollment.progress_percentage = new_pct

    if new_pct == 100:
        enrollment.status = "Completed"
        # Check if certification already exists
        cert = db.query(models.Certification).filter(models.Certification.enrollment_id == enrollment.id).first()
        if not cert:
            cert_code = generate_cert_code(enrollment.skill.category)
            new_cert = models.Certification(
                skill_id=enrollment.skill_id,
                enrollment_id=enrollment.id,
                certificate_code=cert_code
            )
            db.add(new_cert)
    elif new_pct > 0:
        enrollment.status = "In Progress"
    else:
        enrollment.status = "Enrolled"

    db.commit()
    db.refresh(enrollment)
    return enrollment

# --- CERTIFICATIONS ENDPOINTS ---
@app.get("/api/certifications", response_model=List[schemas.CertificationOut])
def get_certifications(db: Session = Depends(get_db)):
    return db.query(models.Certification).all()

@app.get("/api/certifications/{code}", response_model=schemas.CertificationOut)
def get_certification_by_code(code: str, db: Session = Depends(get_db)):
    cert = db.query(models.Certification).filter(models.Certification.certificate_code == code).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")
    return cert

# --- SYSTEM STATS ENDPOINT ---
@app.get("/api/stats")
def get_stats(db: Session = Depends(get_db)):
    total_skills = db.query(models.Skill).count()
    enrollments = db.query(models.Enrollment).all()
    total_enrollments = len(enrollments)
    completed_count = sum(1 for e in enrollments if e.progress_percentage == 100)
    in_progress_count = sum(1 for e in enrollments if 0 < e.progress_percentage < 100)
    total_certs = db.query(models.Certification).count()

    total_hours_earned = sum(e.skill.duration_hours for e in enrollments if e.progress_percentage == 100)

    return {
        "total_skills": total_skills,
        "total_enrollments": total_enrollments,
        "in_progress": in_progress_count,
        "completed": completed_count,
        "total_certs": total_certs,
        "hours_earned": total_hours_earned
    }

