from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    category = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    duration_hours = Column(Integer, default=10)
    level = Column(String, default="Beginner")
    icon = Column(String, default="code")

    enrollments = relationship("Enrollment", back_populates="skill", cascade="all, delete-orphan")
    certifications = relationship("Certification", back_populates="skill", cascade="all, delete-orphan")


class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    progress_percentage = Column(Integer, default=0)
    status = Column(String, default="Enrolled")  # Enrolled, In Progress, Completed
    enrolled_at = Column(DateTime, default=datetime.utcnow)

    skill = relationship("Skill", back_populates="enrollments")
    certification = relationship("Certification", back_populates="enrollment", uselist=False)


class Certification(Base):
    __tablename__ = "certifications"

    id = Column(Integer, primary_key=True, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    enrollment_id = Column(Integer, ForeignKey("enrollments.id"), nullable=False)
    certificate_code = Column(String, unique=True, index=True, nullable=False)
    issue_date = Column(DateTime, default=datetime.utcnow)

    skill = relationship("Skill", back_populates="certifications")
    enrollment = relationship("Enrollment", back_populates="certification")
