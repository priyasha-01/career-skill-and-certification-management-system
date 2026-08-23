import os
import uvicorn

if __name__ == "__main__":
    # Ensure local database directory exists
    os.makedirs("./data", exist_ok=True)
    
    print("Starting Student Skill & Certification Management System on http://localhost:8000")
    print("Interactive API documentation available at http://localhost:8000/docs")
    
    uvicorn.run("api.index:app", host="0.0.0.0", port=8000, reload=True)
