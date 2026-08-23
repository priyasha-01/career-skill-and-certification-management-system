from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Date
from sqlalchemy.orm import relationship
from backend.database import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    roll_no = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    department = Column(String, nullable=False)
    year = Column(String, nullable=False)  # e.g., "1st Year", "2nd Year", "3rd Year", "4th Year"
    bio = Column(Text, nullable=True)
    github_url = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    skills = relationship("StudentSkill", back_populates="student", cascade="all, delete-orphan")
    certifications = relationship("Certification", back_populates="student", cascade="all, delete-orphan")


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    category = Column(String, nullable=False)  # e.g., "Programming Languages", "Web Dev", "Cloud & DevOps", "AI/ML", "Cybersecurity", "Soft Skills"
    description = Column(String, nullable=True)

    # Relationships
    student_associations = relationship("StudentSkill", back_populates="skill", cascade="all, delete-orphan")


class StudentSkill(Base):
    __tablename__ = "student_skills"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    proficiency = Column(String, nullable=False)  # "Beginner", "Intermediate", "Advanced", "Expert"
    learning_hours = Column(Integer, default=0)
    verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    student = relationship("Student", back_populates="skills")
    skill = relationship("Skill", back_populates="student_associations")


class Certification(Base):
    __tablename__ = "certifications"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    issuing_org = Column(String, nullable=False)  # e.g., "AWS", "Coursera", "Google Cloud", "HackerRank", "Microsoft", "Udemy"
    issue_date = Column(Date, nullable=False)
    expiry_date = Column(Date, nullable=True)
    credential_id = Column(String, nullable=True)
    verification_url = Column(String, nullable=True)
    status = Column(String, default="Pending")  # "Pending", "Verified", "Expired"
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    student = relationship("Student", back_populates="certifications")
