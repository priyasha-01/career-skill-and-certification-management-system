from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from backend.config import DATABASE_URL

# SQLite requires check_same_thread=False for multi-threaded access in FastAPI
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """FastAPI DB Session Dependency"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initializes the database schema and performs seeding if empty."""
    from backend.models import Student  # Import here to avoid circular dependencies
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    # Check if the database needs to be seeded (e.g., if there are no students)
    db = SessionLocal()
    try:
        student_count = db.query(Student).count()
        if student_count == 0:
            print("Database is empty. Seeding realistic sample data...")
            from backend.seed import seed_database
            seed_database(db)
            print("Database seeding completed successfully!")
    except Exception as e:
        print(f"Error checking or seeding database: {e}")
    finally:
        db.close()
