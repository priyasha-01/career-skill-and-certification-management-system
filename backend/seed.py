import datetime
from sqlalchemy.orm import Session
from backend import models

def seed_database(db: Session):
    # 1. Seed Skills catalog
    skills_data = [
        # Programming Languages
        {"name": "Python", "category": "Programming Languages", "description": "General-purpose programming language widely used for scripting, backend development, and AI/ML."},
        {"name": "Java", "category": "Programming Languages", "description": "Class-based, object-oriented programming language designed for portability and enterprise applications."},
        {"name": "TypeScript", "category": "Programming Languages", "description": "Typed superset of JavaScript that compiles to plain JavaScript, essential for modern frontend/backend development."},
        {"name": "C++", "category": "Programming Languages", "description": "High-performance systems programming language used in game engines, OS, and competitive programming."},
        
        # Web Development
        {"name": "React", "category": "Web Development", "description": "Popular open-source JavaScript library for building component-based user interfaces."},
        {"name": "FastAPI", "category": "Web Development", "description": "Modern, fast, high-performance web framework for building APIs with Python and Pydantic validation."},
        {"name": "Tailwind CSS", "category": "Web Development", "description": "Utility-first CSS framework for rapid UI styling and clean responsive designs."},
        {"name": "Node.js", "category": "Web Development", "description": "JavaScript runtime built on Chrome's V8 engine for building scalable network backend applications."},

        # Cloud & DevOps
        {"name": "Docker", "category": "Cloud & DevOps", "description": "Containerization platform to build, share, and run applications consistently across environments."},
        {"name": "AWS Services", "category": "Cloud & DevOps", "description": "Amazon Web Services cloud computing suite, including EC2, S3, RDS, Lambda, and IAM."},
        {"name": "GitHub Actions", "category": "Cloud & DevOps", "description": "CI/CD automation platform to build, test, and deploy code directly from GitHub repositories."},
        {"name": "Kubernetes", "category": "Cloud & DevOps", "description": "Container orchestration engine for automating deployment, scaling, and management of containerized apps."},

        # Database Systems
        {"name": "PostgreSQL", "category": "Database Systems", "description": "Powerful, open-source object-relational database system known for reliability and SQL compliance."},
        {"name": "MongoDB", "category": "Database Systems", "description": "Document-based NoSQL database designed for ease of development, high scalability, and flexible schemas."},
        {"name": "SQLite", "category": "Database Systems", "description": "Lightweight, file-based relational database management system integrated directly into applications."},

        # Data Science & AI
        {"name": "TensorFlow / PyTorch", "category": "Data Science & AI", "description": "Leading open-source libraries for deep learning research and production neural networks."},
        {"name": "Pandas / NumPy", "category": "Data Science & AI", "description": "Essential Python data analysis and scientific computing libraries for processing tabular data."},
        {"name": "Data Visualization", "category": "Data Science & AI", "description": "Creating visual representations of data using tools like Matplotlib, Seaborn, or Tableau."},

        # Soft Skills
        {"name": "Technical Writing", "category": "Soft Skills", "description": "Communicating complex technical information clearly through documentation, blogs, and specs."},
        {"name": "Agile Methodologies", "category": "Soft Skills", "description": "Software development workflow based on iterative planning, Scrum boards, and sprint cycles."},
        {"name": "Public Speaking", "category": "Soft Skills", "description": "Delivering presentations and technical pitches clearly, confidently, and persuasively."}
    ]
    
    db_skills = []
    for skill_dict in skills_data:
        skill = models.Skill(**skill_dict)
        db.add(skill)
        db_skills.append(skill)
        
    db.commit()  # Commit to generate IDs
    
    # Create a quick-lookup map of skill name to skill object
    skills_map = {s.name: s for s in db_skills}

    # 2. Seed Students
    students_data = [
        {
            "name": "Aarav Sharma",
            "roll_no": "CS2023001",
            "email": "aarav.sharma@university.edu",
            "department": "Computer Science & Engineering",
            "year": "3rd Year",
            "bio": "Passionate full-stack developer with a keen interest in cloud architecture, open source projects, and automation.",
            "github_url": "https://github.com/aaravsharma",
            "linkedin_url": "https://linkedin.com/in/aaravsharma"
        },
        {
            "name": "Priya Patel",
            "roll_no": "CS2023008",
            "email": "priya.patel@university.edu",
            "department": "Computer Science & Engineering",
            "year": "3rd Year",
            "bio": "Aspiring AI Researcher and ML Engineer. Love solving complex algorithmic problems and working on computer vision models.",
            "github_url": "https://github.com/priyapatel-ai",
            "linkedin_url": "https://linkedin.com/in/priyapatel-ai"
        },
        {
            "name": "Rohan Das",
            "roll_no": "EC2024045",
            "email": "rohan.das@university.edu",
            "department": "Electronics & Communication",
            "year": "2nd Year",
            "bio": "Embedded systems enthusiast learning Python backend development and IoT integrations.",
            "github_url": "https://github.com/rohandas-iot",
            "linkedin_url": "https://linkedin.com/in/rohandas-iot"
        },
        {
            "name": "Ananya Sen",
            "roll_no": "IT2022012",
            "email": "ananya.sen@university.edu",
            "department": "Information Technology",
            "year": "4th Year",
            "bio": "DevOps enthusiast and open-source contributor. Experienced in containerization, CI/CD pipelines, and cloud migration.",
            "github_url": "https://github.com/ananya-devops",
            "linkedin_url": "https://linkedin.com/in/ananya-devops"
        },
        {
            "name": "Vikram Malhotra",
            "roll_no": "ME2023023",
            "email": "vikram.m@university.edu",
            "department": "Mechanical Engineering",
            "year": "3rd Year",
            "bio": "CAD designer exploring data science applications in materials science and robotics.",
            "github_url": "https://github.com/vikram-cad",
            "linkedin_url": "https://linkedin.com/in/vikram-m"
        },
        {
            "name": "Zara Khan",
            "roll_no": "CS2022099",
            "email": "zara.khan@university.edu",
            "department": "Computer Science & Engineering",
            "year": "4th Year",
            "bio": "Frontend designer & developer. Focuses on accessibility, Tailwind CSS, and UX micro-interactions.",
            "github_url": "https://github.com/zarakhan-ux",
            "linkedin_url": "https://linkedin.com/in/zarakhan-ux"
        }
    ]

    db_students = []
    for student_dict in students_data:
        student = models.Student(**student_dict)
        db.add(student)
        db_students.append(student)
        
    db.commit()  # Commit to generate IDs
    
    # Create mappings of students for easy lookup
    aarav = db_students[0]
    priya = db_students[1]
    rohan = db_students[2]
    ananya = db_students[3]
    vikram = db_students[4]
    zara = db_students[5]

    # 3. Seed Student Skills (Many-to-Many Mappings)
    student_skills = [
        # Aarav: Fullstack
        models.StudentSkill(student_id=aarav.id, skill_id=skills_map["Python"].id, proficiency="Advanced", learning_hours=120, verified=True),
        models.StudentSkill(student_id=aarav.id, skill_id=skills_map["FastAPI"].id, proficiency="Advanced", learning_hours=80, verified=True),
        models.StudentSkill(student_id=aarav.id, skill_id=skills_map["React"].id, proficiency="Intermediate", learning_hours=60, verified=False),
        models.StudentSkill(student_id=aarav.id, skill_id=skills_map["Docker"].id, proficiency="Intermediate", learning_hours=35, verified=True),
        models.StudentSkill(student_id=aarav.id, skill_id=skills_map["PostgreSQL"].id, proficiency="Advanced", learning_hours=50, verified=False),

        # Priya: AI & Data Science
        models.StudentSkill(student_id=priya.id, skill_id=skills_map["Python"].id, proficiency="Expert", learning_hours=300, verified=True),
        models.StudentSkill(student_id=priya.id, skill_id=skills_map["TensorFlow / PyTorch"].id, proficiency="Advanced", learning_hours=180, verified=True),
        models.StudentSkill(student_id=priya.id, skill_id=skills_map["Pandas / NumPy"].id, proficiency="Expert", learning_hours=150, verified=True),
        models.StudentSkill(student_id=priya.id, skill_id=skills_map["Data Visualization"].id, proficiency="Intermediate", learning_hours=40, verified=False),

        # Rohan: Electronics & IoT
        models.StudentSkill(student_id=rohan.id, skill_id=skills_map["C++"].id, proficiency="Intermediate", learning_hours=90, verified=True),
        models.StudentSkill(student_id=rohan.id, skill_id=skills_map["Python"].id, proficiency="Beginner", learning_hours=30, verified=False),
        models.StudentSkill(student_id=rohan.id, skill_id=skills_map["Public Speaking"].id, proficiency="Intermediate", learning_hours=15, verified=False),

        # Ananya: DevOps & Cloud
        models.StudentSkill(student_id=ananya.id, skill_id=skills_map["Docker"].id, proficiency="Expert", learning_hours=150, verified=True),
        models.StudentSkill(student_id=ananya.id, skill_id=skills_map["AWS Services"].id, proficiency="Advanced", learning_hours=110, verified=True),
        models.StudentSkill(student_id=ananya.id, skill_id=skills_map["GitHub Actions"].id, proficiency="Advanced", learning_hours=70, verified=True),
        models.StudentSkill(student_id=ananya.id, skill_id=skills_map["Kubernetes"].id, proficiency="Intermediate", learning_hours=45, verified=False),
        models.StudentSkill(student_id=ananya.id, skill_id=skills_map["Agile Methodologies"].id, proficiency="Intermediate", learning_hours=20, verified=True),

        # Vikram: Mechanical & Data Analytics
        models.StudentSkill(student_id=vikram.id, skill_id=skills_map["Python"].id, proficiency="Intermediate", learning_hours=50, verified=False),
        models.StudentSkill(student_id=vikram.id, skill_id=skills_map["Pandas / NumPy"].id, proficiency="Intermediate", learning_hours=40, verified=False),
        models.StudentSkill(student_id=vikram.id, skill_id=skills_map["Technical Writing"].id, proficiency="Advanced", learning_hours=25, verified=True),

        # Zara: Frontend Designer
        models.StudentSkill(student_id=zara.id, skill_id=skills_map["React"].id, proficiency="Advanced", learning_hours=140, verified=True),
        models.StudentSkill(student_id=zara.id, skill_id=skills_map["TypeScript"].id, proficiency="Intermediate", learning_hours=75, verified=False),
        models.StudentSkill(student_id=zara.id, skill_id=skills_map["Tailwind CSS"].id, proficiency="Expert", learning_hours=100, verified=True),
        models.StudentSkill(student_id=zara.id, skill_id=skills_map["Public Speaking"].id, proficiency="Advanced", learning_hours=30, verified=True)
    ]
    
    for ss in student_skills:
        db.add(ss)

    # 4. Seed Certifications
    certifications = [
        # Aarav
        models.Certification(
            student_id=aarav.id,
            title="AWS Certified Cloud Practitioner",
            issuing_org="AWS",
            issue_date=datetime.date(2025, 4, 15),
            expiry_date=datetime.date(2028, 4, 15),
            credential_id="AWS-CCP-9872",
            verification_url="https://aws.amazon.com/verification",
            status="Verified"
        ),
        models.Certification(
            student_id=aarav.id,
            title="FastAPI Web Development Masterclass",
            issuing_org="Udemy",
            issue_date=datetime.date(2026, 1, 20),
            credential_id="UC-89a19cbf",
            verification_url="https://udemy.com/certificate/UC-89a19cbf",
            status="Verified"
        ),
        models.Certification(
            student_id=aarav.id,
            title="React Developer Certificate",
            issuing_org="Coursera",
            issue_date=datetime.date(2026, 7, 5),
            credential_id="COURSERA-REC893",
            verification_url="https://coursera.org/verify/REC893",
            status="Pending"
        ),
        
        # Priya
        models.Certification(
            student_id=priya.id,
            title="Deep Learning Specialization",
            issuing_org="Coursera",
            issue_date=datetime.date(2025, 9, 30),
            credential_id="DL-SPEC-7711",
            verification_url="https://coursera.org/verify/specialization/DL7711",
            status="Verified"
        ),
        models.Certification(
            student_id=priya.id,
            title="Python Advanced Coding Challenge",
            issuing_org="HackerRank",
            issue_date=datetime.date(2025, 11, 10),
            credential_id="HR-PY-ADV-99",
            verification_url="https://hackerrank.com/certificates/PY-ADV-99",
            status="Verified"
        ),

        # Ananya
        models.Certification(
            student_id=ananya.id,
            title="AWS Certified Solutions Architect - Associate",
            issuing_org="AWS",
            issue_date=datetime.date(2025, 12, 5),
            expiry_date=datetime.date(2028, 12, 5),
            credential_id="AWS-SAA-3392",
            verification_url="https://aws.amazon.com/verification",
            status="Verified"
        ),
        models.Certification(
            student_id=ananya.id,
            title="Google Associate Cloud Engineer",
            issuing_org="Google Cloud",
            issue_date=datetime.date(2024, 6, 18),
            expiry_date=datetime.date(2026, 6, 18),  # Expired
            credential_id="GCP-ACE-1102",
            verification_url="https://credential.net/gcp-ace-1102",
            status="Expired"
        ),
        models.Certification(
            student_id=ananya.id,
            title="Certified Kubernetes Administrator (CKA)",
            issuing_org="Linux Foundation",
            issue_date=datetime.date(2026, 8, 1),
            expiry_date=datetime.date(2029, 8, 1),
            credential_id="LF-CKA-7732",
            verification_url="https://credentials.linuxfoundation.org/LF-CKA-7732",
            status="Pending"
        ),

        # Zara
        models.Certification(
            student_id=zara.id,
            title="Front-End Developer Professional Certificate",
            issuing_org="Coursera",
            issue_date=datetime.date(2025, 5, 25),
            credential_id="META-FE-339",
            verification_url="https://coursera.org/verify/META-FE-339",
            status="Verified"
        )
    ]
    
    for cert in certifications:
        db.add(cert)
        
    db.commit()
