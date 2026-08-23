from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, EmailStr, HttpUrl

# Base Configuration for Pydantic Models to support ORM
class BaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# --- Skill Schemas ---
class SkillBase(BaseSchema):
    name: str
    category: str
    description: Optional[str] = None

class SkillCreate(SkillBase):
    pass

class SkillResponse(SkillBase):
    id: int


# --- StudentSkill Schemas ---
class StudentSkillBase(BaseSchema):
    proficiency: str  # "Beginner", "Intermediate", "Advanced", "Expert"
    learning_hours: int = 0
    verified: bool = False

class StudentSkillCreate(BaseSchema):
    skill_id: int
    proficiency: str
    learning_hours: int = 0

class StudentSkillUpdate(BaseSchema):
    proficiency: Optional[str] = None
    learning_hours: Optional[int] = None
    verified: Optional[bool] = None

class StudentSkillResponse(StudentSkillBase):
    id: int
    student_id: int
    skill_id: int
    created_at: datetime

class StudentSkillDetail(StudentSkillResponse):
    skill: SkillResponse


# --- Certification Schemas ---
class CertificationBase(BaseSchema):
    title: str
    issuing_org: str
    issue_date: date
    expiry_date: Optional[date] = None
    credential_id: Optional[str] = None
    verification_url: Optional[str] = None
    status: str = "Pending"  # "Pending", "Verified", "Expired"

class CertificationCreate(CertificationBase):
    pass

class CertificationUpdate(BaseSchema):
    title: Optional[str] = None
    issuing_org: Optional[str] = None
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None
    credential_id: Optional[str] = None
    verification_url: Optional[str] = None
    status: Optional[str] = None

class CertificationResponse(CertificationBase):
    id: int
    student_id: int
    created_at: datetime


# --- Student Schemas ---
class StudentBase(BaseSchema):
    name: str
    roll_no: str
    email: str
    department: str
    year: str
    bio: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None

class StudentCreate(StudentBase):
    pass

class StudentUpdate(BaseSchema):
    name: Optional[str] = None
    roll_no: Optional[str] = None
    email: Optional[str] = None
    department: Optional[str] = None
    year: Optional[str] = None
    bio: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None

class StudentResponse(StudentBase):
    id: int
    created_at: datetime

class StudentProfileResponse(StudentResponse):
    skills: List[StudentSkillDetail] = []
    certifications: List[CertificationResponse] = []


# --- Analytics Schemas ---
class KPIMetrics(BaseSchema):
    total_students: int
    total_skills_logged: int
    total_certifications_earned: int
    verified_certifications: int

class DistributionItem(BaseSchema):
    label: str
    value: int

class AnalyticsSummary(BaseSchema):
    kpis: KPIMetrics
    skills_category_distribution: List[DistributionItem]
    certifications_org_distribution: List[DistributionItem]
    certifications_status_distribution: List[DistributionItem]
