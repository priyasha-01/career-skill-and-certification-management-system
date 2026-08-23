from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend import crud, schemas
from backend.database import get_db

router = APIRouter(
    prefix="/skills",
    tags=["Skills"]
)

@router.get("/", response_model=List[schemas.SkillResponse])
def read_skills_catalog(category: Optional[str] = None, db: Session = Depends(get_db)):
    """Retrieve the global catalog of skills, optionally filtered by category."""
    return crud.get_skills(db, category=category)

@router.post("/", response_model=schemas.SkillResponse, status_code=status.HTTP_201_CREATED)
def create_new_catalog_skill(skill: schemas.SkillCreate, db: Session = Depends(get_db)):
    """Add a new skill option to the global catalog."""
    db_skill = crud.get_skill_by_name(db, name=skill.name)
    if db_skill:
        raise HTTPException(
            status_code=400,
            detail=f"Skill '{skill.name}' already exists in catalog."
        )
    return crud.create_skill(db, skill=skill)

@router.post("/{student_id}/assign", response_model=schemas.StudentSkillResponse, status_code=status.HTTP_201_CREATED)
def assign_skill_to_student(student_id: int, student_skill: schemas.StudentSkillCreate, db: Session = Depends(get_db)):
    """Assign a catalog skill to a specific student with a proficiency level."""
    # 1. Verify student exists
    db_student = crud.get_student(db, student_id=student_id)
    if not db_student:
        raise HTTPException(
            status_code=404,
            detail=f"Student with ID {student_id} not found."
        )
    
    # 2. Verify skill exists in catalog
    db_skill = crud.get_skill(db, skill_id=student_skill.skill_id)
    if not db_skill:
        raise HTTPException(
            status_code=404,
            detail=f"Skill with ID {student_skill.skill_id} not found in the global catalog."
        )
        
    # 3. Verify it is not already assigned
    existing_mapping = crud.get_student_skill(db, student_id=student_id, skill_id=student_skill.skill_id)
    if existing_mapping:
        raise HTTPException(
            status_code=400,
            detail="This skill is already assigned to the student. Use the update endpoint to modify proficiency or hours."
        )
        
    return crud.assign_skill_to_student(db, student_id=student_id, student_skill=student_skill)

@router.put("/{student_id}/skills/{skill_id}", response_model=schemas.StudentSkillResponse)
def update_student_assigned_skill(student_id: int, skill_id: int, skill_data: schemas.StudentSkillUpdate, db: Session = Depends(get_db)):
    """Update details of a student's assigned skill (e.g., learning hours, proficiency, verification)."""
    db_student_skill = crud.update_student_skill(db, student_id=student_id, skill_id=skill_id, skill_data=skill_data)
    if not db_student_skill:
        raise HTTPException(
            status_code=404,
            detail=f"Skill mapping not found for Student ID {student_id} and Skill ID {skill_id}."
        )
    return db_student_skill

@router.delete("/{student_id}/skills/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_skill_from_student(student_id: int, skill_id: int, db: Session = Depends(get_db)):
    """Remove a skill assignment from a student."""
    removed = crud.remove_skill_from_student(db, student_id=student_id, skill_id=skill_id)
    if not removed:
        raise HTTPException(
            status_code=404,
            detail=f"Skill mapping not found for Student ID {student_id} and Skill ID {skill_id}."
        )
    return None
