from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend import crud, schemas
from backend.database import get_db

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)

@router.get("/summary", response_model=schemas.AnalyticsSummary)
def read_analytics_summary(db: Session = Depends(get_db)):
    """Retrieve high-level KPI metrics, and group counts of skills and certifications for dashboard charts."""
    return crud.get_analytics_summary(db)
