# Career Skill & Certification Management System

A lightweight full-stack mini-project designed to track student skill acquisition, update module progress, automatically generate digital verifiable certificates, and map local deployment architectures to production cloud equivalents.

---

## 🚀 How to Run the Application

### 1. Run the Backend (FastAPI)

First, make sure you have Python 3.8+ installed on your system.

1. **Open a terminal** and navigate to the project directory:
   ```bash
   cd p1cloud_based
   ```

2. **Install dependencies**:
   ```bash
   python -m pip install -r backend/requirements.txt
   ```
   *(This installs `fastapi`, `uvicorn`, `sqlalchemy`, and `pydantic`)*

3. **Start the FastAPI server**:
   ```bash
   python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
   ```

4. **Verify it is running**:
   - Open your browser to [http://127.0.0.1:8000](http://127.0.0.1:8000). You should see `{"message": "Career Skill & Certification System API is active", "docs": "/docs"}`.
   - You can access the interactive Swagger documentation at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

---

### 2. Run the Frontend (HTML/CSS/JS)

No complex build process or packaging tool is required for the frontend.

1. **Direct Execution**:
   - Double-click or open [public/index.html](public/index.html) directly in any modern web browser (Chrome, Edge, Firefox, etc.).

2. **Alternative (Using Python HTTP Server)**:
   If you want to run the frontend over a local web server:
   - Start a simple python HTTP server:
     ```bash
     python -m http.server 3000
     ```
   - Open [http://localhost:3000/public/](http://localhost:3000/public/) in your web browser.

---

## 🛠️ Project Structure

- **`backend/`**
  - `app/main.py`: Main FastAPI entry point containing routes, CORS middleware, and automatic SQLite database seeding on startup.
  - `app/database.py`: SQLite in-memory configuration (`sqlite:///:memory:`).
  - `app/models.py`: SQLAlchemy database models (`Skill`, `Enrollment`, `Certification`).
  - `app/schemas.py`: Pydantic validation schemas.
- **`public/` (Static Assets Folder)**
  - `index.html`: Responsive UI dashboard layout with customizable tabs and certificate viewing modal.
  - `styles.css`: Custom glassmorphism styles, progress bars, and print stylesheet rules.
  - `app.js`: Main frontend script managing REST API requests, DOM updates, tab-switching, and offline/standalone mode.

---

## ☁️ Viva & Cloud Architecture Mapping
The **Cloud Architecture** tab in the application maps local services to production cloud equivalents:
- **FastAPI / Uvicorn** ➡️ AWS EC2 / GCP Cloud Run
- **SQLite In-Memory** ➡️ AWS RDS PostgreSQL
- **Static Assets** ➡️ AWS S3 + CloudFront CDN
- **Certificate Verification Code** ➡️ AWS Lambda / Cryptographic Signatures

---

## ⚡ Deployment to Vercel

This project is pre-configured to be deployed as a single, unified Vercel application. The backend runs as a Python serverless function, and the frontend is served as static files.

### Deploying the App
1. Install the Vercel CLI if you haven't already:
   ```bash
   npm install -g vercel
   ```
2. Log in and deploy from the root directory:
   ```bash
   vercel
   ```
   *Follow the prompts to link and deploy the project.*

### Local Development simulating Vercel Environment
You can simulate the production serverless environment locally by running:
```bash
vercel dev
```
Open **[http://localhost:3000](http://localhost:3000)** to interact with your local frontend and serverless API proxy.
