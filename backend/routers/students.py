from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend import crud, schemas
from backend.database import get_db

router = APIRouter(
    prefix="/students",
    tags=["Students"]
)

@router.get("/", response_model=List[schemas.StudentResponse])
def read_students(
    search: Optional[str] = None,
    department: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Retrieve students directory with optional search query and department filter."""
    return crud.get_students(db, skip=skip, limit=limit, search=search, department=department)

@router.post("/", response_model=schemas.StudentResponse, status_code=status.HTTP_201_CREATED)
def create_new_student(student: schemas.StudentCreate, db: Session = Depends(get_db)):
    """Register a new student."""
    # Check duplicate Roll Number
    db_student_roll = crud.get_student_by_roll_no(db, roll_no=student.roll_no)
    if db_student_roll:
        raise HTTPException(
            status_code=400,
            detail=f"Student with Roll Number {student.roll_no} already exists."
        )
    # Check duplicate Email
    db_student_email = crud.get_student_by_email(db, email=student.email)
    if db_student_email:
        raise HTTPException(
            status_code=400,
            detail=f"Student with Email {student.email} already exists."
        )
    return crud.create_student(db=db, student=student)

@router.get("/{student_id}", response_model=schemas.StudentProfileResponse)
def read_student_profile(student_id: int, db: Session = Depends(get_db)):
    """Retrieve full student profile details, including their skill catalog and certifications."""
    db_student = crud.get_student(db, student_id=student_id)
    if not db_student:
        raise HTTPException(
            status_code=404,
            detail=f"Student with ID {student_id} not found."
        )
    return db_student

@router.put("/{student_id}", response_model=schemas.StudentResponse)
def update_student_profile(student_id: int, student: schemas.StudentUpdate, db: Session = Depends(get_db)):
    """Update a student's profile details."""
    # If updating email, check for uniqueness
    if student.email:
        db_student = crud.get_student_by_email(db, email=student.email)
        if db_student and db_student.id != student_id:
            raise HTTPException(
                status_code=400,
                detail=f"Email {student.email} is already in use by another student."
            )
    # If updating roll number, check for uniqueness
    if student.roll_no:
        db_student = crud.get_student_by_roll_no(db, roll_no=student.roll_no)
        if db_student and db_student.id != student_id:
            raise HTTPException(
                status_code=400,
                detail=f"Roll Number {student.roll_no} is already in use by another student."
            )
            
    updated_student = crud.update_student(db, student_id=student_id, student_data=student)
    if not updated_student:
        raise HTTPException(
            status_code=404,
            detail=f"Student with ID {student_id} not found."
        )
    return updated_student

@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student_record(student_id: int, db: Session = Depends(get_db)):
    """Delete a student record permanently."""
    deleted = crud.delete_student(db, student_id=student_id)
    if not deleted:
        raise HTTPException(
            status_code=404,
            detail=f"Student with ID {student_id} not found."
        )
    return None
