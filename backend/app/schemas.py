from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class SkillBase(BaseModel):
    title: str
    category: str
    description: str
    duration_hours: int
    level: str
    icon: str = "code"

class SkillCreate(SkillBase):
    pass

class SkillOut(SkillBase):
    id: int

    class Config:
        from_attributes = True

class EnrollmentOut(BaseModel):
    id: int
    skill_id: int
    progress_percentage: int
    status: str
    enrolled_at: datetime
    skill: SkillOut

    class Config:
        from_attributes = True

class CertificationOut(BaseModel):
    id: int
    skill_id: int
    enrollment_id: int
    certificate_code: str
    issue_date: datetime
    skill: SkillOut

    class Config:
        from_attributes = True

class ProgressUpdate(BaseModel):
    progress_percentage: int
