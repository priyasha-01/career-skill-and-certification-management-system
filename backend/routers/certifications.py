from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend import crud, schemas
from backend.database import get_db

router = APIRouter(
    prefix="/certifications",
    tags=["Certifications"]
)

@router.get("/", response_model=List[schemas.CertificationResponse])
def read_certifications(
    student_id: Optional[int] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Retrieve all student certifications with optional filters by student ID or verification status."""
    return crud.get_certifications(db, skip=skip, limit=limit, student_id=student_id, status=status)

@router.post("/{student_id}", response_model=schemas.CertificationResponse, status_code=status.HTTP_201_CREATED)
def add_certification_for_student(student_id: int, certification: schemas.CertificationCreate, db: Session = Depends(get_db)):
    """Add a new certification record for a specific student."""
    # Verify student exists
    db_student = crud.get_student(db, student_id=student_id)
    if not db_student:
        raise HTTPException(
            status_code=404,
            detail=f"Student with ID {student_id} not found."
        )
    return crud.create_certification(db, student_id=student_id, cert=certification)

@router.put("/{cert_id}", response_model=schemas.CertificationResponse)
def update_certification_details(cert_id: int, cert_data: schemas.CertificationUpdate, db: Session = Depends(get_db)):
    """Update details of a certification record (e.g., verification status, URL, or organization)."""
    db_cert = crud.update_certification(db, cert_id=cert_id, cert_data=cert_data)
    if not db_cert:
        raise HTTPException(
            status_code=404,
            detail=f"Certification with ID {cert_id} not found."
        )
    return db_cert

@router.delete("/{cert_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_certification(cert_id: int, db: Session = Depends(get_db)):
    """Delete a student certification record permanently."""
    deleted = crud.delete_certification(db, cert_id=cert_id)
    if not deleted:
        raise HTTPException(
            status_code=404,
            detail=f"Certification with ID {cert_id} not found."
        )
    return None
