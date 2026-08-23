# Student Skill Development & Certification Management System

A cloud-ready mini project designed to track, manage, and audit student skill proficiencies and certifications. 

This project integrates a high-performance **FastAPI** backend, database modeling with **SQLAlchemy (SQLite)**, and a responsive single-page frontend crafted with modern **HTML, Tailwind CSS, and Vanilla JavaScript (modular ES)**. It is structured to run locally or be deployed on **Vercel** as a single unified serverless application.

---

## Key Features

1. **KPI Dashboard & Visual Analytics**: Displays live summary statistics (Total Students, Active Skills, Certifications) and visual charts (skills category distribution, certificate status, platform counts) using **Chart.js**.
2. **Student Directory & Profiles**: Fully supports CRUD actions on student records, alongside detailed profile slide-over drawers displaying skill progress and credential lists.
3. **Skill Matrix & Development Tracker**: Supports defining a custom catalog of global skills and mapping them to individual students with proficiencies (`Beginner`, `Intermediate`, `Advanced`, `Expert`), logged training hours, and faculty verification statuses.
4. **Certification Hub & Credential Verification**: Registers external certificates (AWS, Coursera, HackerRank, Google Cloud) with issuing platforms, date validation, and verification URL verification checks.
5. **Interactive Swagger Documentation**: Standard API exploration is available at `/docs` (Swagger UI) and `/redoc` (ReDoc) directly inside the app navigation.
6. **Data Export & Reporting**: Supports instant exporting of student skill matrices and certifications records to a local CSV file.

---

## Technical Stack & Architecture

- **Backend**: FastAPI, Python 3.10+, Uvicorn (ASGI Server).
- **ORM / Database**: SQLAlchemy, SQLite.
  - *Vercel Serverless Auto-Fallback*: In development, SQLite creates files in `./data/skills.db`. When deployed on Vercel's read-only filesystem, database configuration seamlessly defaults to `/tmp/skills.db` and triggers schema generation and sample data seeding on cold start.
- **Frontend**: Single Page Application (SPA) utilizing HTML5, Tailwind CSS, FontAwesome Icons, and Vanilla JS.
- **Deployment**: Vercel Serverless Functions (`api/index.py` & `vercel.json`).

---

## Directory Structure

```
├── api/
│   └── index.py               # Vercel entrypoint hosting the FastAPI app
├── backend/
│   ├── config.py              # Environment configuration & DB path resolver
│   ├── database.py            # SQLite connections & initialization routines
│   ├── models.py              # SQLAlchemy database tables mapping
│   ├── schemas.py             # Pydantic request/response schemas
│   ├── crud.py                # Database transactions logic
│   ├── seed.py                # Rich realistic data seeder
│   └── routers/               # API endpoint modules
│       ├── students.py        # Student profiles CRUD
│       ├── skills.py          # Skill catalog & student assignments
│       ├── certifications.py  # Certification registry
│       └── analytics.py       # Metrics and dashboard charts aggregation
├── public/                    # Static UI folder
│   ├── index.html             # Main SPA entrypoint
│   ├── css/
│   │   └── style.css          # Custom animations and badges styling
│   └── js/
│       ├── api.js             # Central fetch client
│       ├── app.js             # General app controller & navigation
│       ├── dashboard.js       # Chart.js graphs handler
│       ├── students.js        # Student drawer & profile CRUD
│       ├── skills.js          # Catalog & assignment rules
│       ├── certifications.js  # Certificate grid & status toggler
│       └── reports.js         # CSV exporter utility
├── vercel.json                # Single-app Vercel deployment routes
├── requirements.txt           # Python application dependencies
└── run.py                     # Local development launcher script
```

---

## Local Setup & Quick Start

1. **Clone the project & Navigate to directory**:
   ```bash
   cd skill-management-system
   ```

2. **Create and Activate a Virtual Environment** (Optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Launch the Local Development Server**:
   ```bash
   python run.py
   ```

5. **Access the Application**:
   - Open your web browser and navigate to: **`http://localhost:8000`**
   - Explore and test the API endpoints interactively at: **`http://localhost:8000/docs`**

---

## Single-App Vercel Deployment

Deploying both the static frontend and the FastAPI serverless functions as one single app on Vercel is streamlined using the `vercel.json` routing configuration:

```json
{
  "version": 2,
  "builds": [
    { "src": "api/index.py", "use": "@vercel/python" }
  ],
  "routes": [
    { "src": "/docs", "dest": "api/index.py" },
    { "src": "/redoc", "dest": "api/index.py" },
    { "src": "/openapi.json", "dest": "api/index.py" },
    { "src": "/api/(.*)", "dest": "api/index.py" },
    { "src": "/(.*)", "dest": "/public/$1" }
  ]
}
```

### Steps to Deploy

#### Option A: Deployment via Vercel CLI (Recommended)
1. Install the Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```
2. Log in to your Vercel account:
   ```bash
   vercel login
   ```
3. Run the deployment command from the project root:
   ```bash
   vercel
   ```
4. Follow the prompt instructions (default choices are recommended).
5. For production release, run:
   ```bash
   vercel --prod
   ```

#### Option B: Deployment via GitHub Integration
1. Push the project repository to GitHub, GitLab, or Bitbucket.
2. Log in to the [Vercel Dashboard](https://vercel.com).
3. Click **Add New Project** and select your imported repository.
4. Keep the Framework Preset as **Other** (Vercel will detect `vercel.json` and configure builds automatically).
5. Click **Deploy**. Vercel will build and serve the FastAPI backend and HTML frontend in under a minute!
