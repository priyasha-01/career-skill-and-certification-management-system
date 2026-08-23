from typing import List, Optional
from sqlalchemy import func, or_
from sqlalchemy.orm import Session
from backend import models, schemas

# --- Student CRUD ---

def get_student(db: Session, student_id: int) -> Optional[models.Student]:
    return db.query(models.Student).filter(models.Student.id == student_id).first()

def get_student_by_roll_no(db: Session, roll_no: str) -> Optional[models.Student]:
    return db.query(models.Student).filter(models.Student.roll_no == roll_no).first()

def get_student_by_email(db: Session, email: str) -> Optional[models.Student]:
    return db.query(models.Student).filter(models.Student.email == email).first()

def get_students(db: Session, skip: int = 0, limit: int = 100, search: Optional[str] = None, department: Optional[str] = None) -> List[models.Student]:
    query = db.query(models.Student)
    if department:
        query = query.filter(models.Student.department == department)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                models.Student.name.like(search_filter),
                models.Student.roll_no.like(search_filter),
                models.Student.email.like(search_filter)
            )
        )
    return query.offset(skip).limit(limit).all()

def create_student(db: Session, student: schemas.StudentCreate) -> models.Student:
    db_student = models.Student(
        name=student.name,
        roll_no=student.roll_no,
        email=student.email,
        department=student.department,
        year=student.year,
        bio=student.bio,
        github_url=student.github_url,
        linkedin_url=student.linkedin_url
    )
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

def update_student(db: Session, student_id: int, student_data: schemas.StudentUpdate) -> Optional[models.Student]:
    db_student = get_student(db, student_id)
    if not db_student:
        return None
    
    update_dict = student_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(db_student, key, value)
        
    db.commit()
    db.refresh(db_student)
    return db_student

def delete_student(db: Session, student_id: int) -> bool:
    db_student = get_student(db, student_id)
    if not db_student:
        return False
    db.delete(db_student)
    db.commit()
    return True


# --- Skill Catalog CRUD ---

def get_skill(db: Session, skill_id: int) -> Optional[models.Skill]:
    return db.query(models.Skill).filter(models.Skill.id == skill_id).first()

def get_skill_by_name(db: Session, name: str) -> Optional[models.Skill]:
    return db.query(models.Skill).filter(models.Skill.name == name).first()

def get_skills(db: Session, category: Optional[str] = None) -> List[models.Skill]:
    query = db.query(models.Skill)
    if category:
        query = query.filter(models.Skill.category == category)
    return query.all()

def create_skill(db: Session, skill: schemas.SkillCreate) -> models.Skill:
    db_skill = models.Skill(
        name=skill.name,
        category=skill.category,
        description=skill.description
    )
    db.add(db_skill)
    db.commit()
    db.refresh(db_skill)
    return db_skill


# --- Student Skill Mapping CRUD ---

def get_student_skill(db: Session, student_id: int, skill_id: int) -> Optional[models.StudentSkill]:
    return db.query(models.StudentSkill).filter(
        models.StudentSkill.student_id == student_id,
        models.StudentSkill.skill_id == skill_id
    ).first()

def assign_skill_to_student(db: Session, student_id: int, student_skill: schemas.StudentSkillCreate) -> models.StudentSkill:
    db_student_skill = models.StudentSkill(
        student_id=student_id,
        skill_id=student_skill.skill_id,
        proficiency=student_skill.proficiency,
        learning_hours=student_skill.learning_hours
    )
    db.add(db_student_skill)
    db.commit()
    db.refresh(db_student_skill)
    return db_student_skill

def update_student_skill(db: Session, student_id: int, skill_id: int, skill_data: schemas.StudentSkillUpdate) -> Optional[models.StudentSkill]:
    db_student_skill = get_student_skill(db, student_id, skill_id)
    if not db_student_skill:
        return None
    
    update_dict = skill_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(db_student_skill, key, value)
        
    db.commit()
    db.refresh(db_student_skill)
    return db_student_skill

def remove_skill_from_student(db: Session, student_id: int, skill_id: int) -> bool:
    db_student_skill = get_student_skill(db, student_id, skill_id)
    if not db_student_skill:
        return False
    db.delete(db_student_skill)
    db.commit()
    return True


# --- Certification CRUD ---

def get_certification(db: Session, cert_id: int) -> Optional[models.Certification]:
    return db.query(models.Certification).filter(models.Certification.id == cert_id).first()

def get_certifications(db: Session, skip: int = 0, limit: int = 100, student_id: Optional[int] = None, status: Optional[str] = None) -> List[models.Certification]:
    query = db.query(models.Certification)
    if student_id:
        query = query.filter(models.Certification.student_id == student_id)
    if status:
        query = query.filter(models.Certification.status == status)
    return query.order_by(models.Certification.created_at.desc()).offset(skip).limit(limit).all()

def create_certification(db: Session, student_id: int, cert: schemas.CertificationCreate) -> models.Certification:
    db_cert = models.Certification(
        student_id=student_id,
        title=cert.title,
        issuing_org=cert.issuing_org,
        issue_date=cert.issue_date,
        expiry_date=cert.expiry_date,
        credential_id=cert.credential_id,
        verification_url=cert.verification_url,
        status=cert.status
    )
    db.add(db_cert)
    db.commit()
    db.refresh(db_cert)
    return db_cert

def update_certification(db: Session, cert_id: int, cert_data: schemas.CertificationUpdate) -> Optional[models.Certification]:
    db_cert = get_certification(db, cert_id)
    if not db_cert:
        return None
    
    update_dict = cert_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(db_cert, key, value)
        
    db.commit()
    db.refresh(db_cert)
    return db_cert

def delete_certification(db: Session, cert_id: int) -> bool:
    db_cert = get_certification(db, cert_id)
    if not db_cert:
        return False
    db.delete(db_cert)
    db.commit()
    return True


# --- Analytics Aggregation CRUD ---

def get_analytics_summary(db: Session) -> schemas.AnalyticsSummary:
    # 1. KPIs
    total_students = db.query(models.Student).count()
    total_skills_logged = db.query(models.StudentSkill).count()
    total_certifications = db.query(models.Certification).count()
    verified_certifications = db.query(models.Certification).filter(models.Certification.status == "Verified").count()
    
    kpis = schemas.KPIMetrics(
        total_students=total_students,
        total_skills_logged=total_skills_logged,
        total_certifications_earned=total_certifications,
        verified_certifications=verified_certifications
    )
    
    # 2. Skill Distribution by Category
    # Query student_skills joined with skills to group by category and count
    skills_dist = (
        db.query(models.Skill.category, func.count(models.StudentSkill.id))
        .join(models.StudentSkill, models.Skill.id == models.StudentSkill.skill_id)
        .group_by(models.Skill.category)
        .all()
    )
    skills_category_distribution = [
        schemas.DistributionItem(label=row[0], value=row[1]) for row in skills_dist
    ]
    
    # 3. Certifications by Issuing Organization
    certs_org_dist = (
        db.query(models.Certification.issuing_org, func.count(models.Certification.id))
        .group_by(models.Certification.issuing_org)
        .all()
    )
    certifications_org_distribution = [
        schemas.DistributionItem(label=row[0], value=row[1]) for row in certs_org_dist
    ]
    
    # 4. Certifications by Status
    certs_status_dist = (
        db.query(models.Certification.status, func.count(models.Certification.id))
        .group_by(models.Certification.status)
        .all()
    )
    certifications_status_distribution = [
        schemas.DistributionItem(label=row[0], value=row[1]) for row in certs_status_dist
    ]
    
    return schemas.AnalyticsSummary(
        kpis=kpis,
        skills_category_distribution=skills_category_distribution,
        certifications_org_distribution=certifications_org_distribution,
        certifications_status_distribution=certifications_status_distribution
    )
