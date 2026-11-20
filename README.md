
# FitPulse: AI-Powered Fitness Tracking Platform

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)

**Live Application:** [https://fitpulse-six-nu.vercel.app](https://fitpulse-six-nu.vercel.app)  
**API Documentation:** [https://fitpulse-xswt.onrender.com/docs](https://fitpulse-xswt.onrender.com/docs)  
**Technical Documentation:** [View Docs Folder](./docs/README.md)

---

## Executive Summary

FitPulse is a production-ready, full-stack fitness tracking web application designed to solve the high churn rate in personal fitness tracking. By prioritizing long-term consistency (via activity heatmaps) and integrating Generative AI for automated coaching, the application provides a premium user experience without the overhead of subscription models.

This project demonstrates a complete Software Development Life Cycle (SDLC), from stakeholder requirements and Agile sprint planning to CI/CD deployment on cloud infrastructure and containerization.

---

## Core Features

*   **Secure Authentication:** JWT-based login and registration with hashed passwords (`bcrypt`).
*   **Dynamic Workout Logging:** Flexible JSON schema supports Strength (sets/reps/weight), Cardio (distance/time), and Flexibility (duration).
*   **AI Coach:** Integrates the **Google Gemini API** to analyze recent workout history and generate personalized training advice.
*   **Data Visualization:** 
    *   365-Day GitHub-style consistency heatmap.
    *   Weekly progress calendar.
    *   Activity breakdown donut chart.
    *   Weekly consistency line chart.
*   **Premium UI/UX:** A fully responsive, high-contrast dark-mode interface built with Tailwind CSS.

---

## Documentation Structure

This repository contains the standard Software Development Life Cycle (SDLC) artifacts required for enterprise-grade applications.

| Document | Description | Stakeholder |
| :--- | :--- | :--- |
| [**01. Software Requirements Specification (SRS)**](./docs/01_requirements.md) | Defines actors, functional requirements, and non-functional requirements. | Product Management / QA |
| [**02. System Architecture**](./docs/02_architecture.md) | Visualizes the 3-tier architecture and justifies technical stack decisions. | Engineering / DevOps |
| [**03. Agile Project Management**](./docs/03_scrum_plan.md) | Details the Scrum methodology, sprint breakdowns, and backlog strategy. | Project Management |
| [**04. API Reference Guide**](./docs/04_api_documentation.md) | Technical specification of RESTful endpoints and data schemas. | Frontend / Third-party Devs |
| [**05. Quality Assurance (QA) Plan**](./docs/05_testing.md) | Outlines the testing strategy, manual test cases, and future automation. | QA Engineering |

---

##  System Architecture

FitPulse utilizes a **decoupled, three-tier architecture**. The frontend, backend, and database are deployed independently to ensure high availability and separation of concerns.

```mermaid
graph TD
    %% Frontend
    Client[React Frontend / Vercel] -->|HTTPS Requests + JWT| API[FastAPI Backend / Render]
    
    %% Backend
    subgraph "Python FastAPI Application"
        API -->|Validates Data| Pydantic[Pydantic Schemas]
        API -->|Auth & Hashing| Auth[pwdlib / JWT]
        API -->|ORM Mapping| SQLA[SQLAlchemy]
        API -->|Prompt Engineering| AI[Gemini AI Client]
    end
    
    %% Data Layer
    subgraph "Cloud Services"
        SQLA -->|SQL Queries| DB[(Neon PostgreSQL)]
        AI -->|API Call| Gemini(Google Gemini API)
    end
    
    %% Environment
    Env[.env Variables] -.->|Secure Secrets| API
```

### Technical Stack Decisions
*   **Backend (FastAPI):** Selected over Flask for native asynchronous support, automatic OpenAPI (Swagger) generation, and built-in Pydantic validation.
*   **Database (Neon PostgreSQL):** Chosen over AWS RDS to ensure the portfolio project remains live indefinitely on a free tier. It supports flexible `JSONB` columns, allowing dynamic workout schemas.
*   **Frontend (React + Vite):** Provides a component-driven UI with fast Hot Module Replacement (HMR) and efficient state management.
*   **Styling (Tailwind CSS):** Utilized for utility-first styling, ensuring consistent design tokens and rapid responsive development.

---

## Local Development Setup

To run this project locally, follow these steps:

### 1. Clone the repository
```bash
git clone https://github.com/thasneemsha/fitpulse.git
cd fitpulse
```

### 2. Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .\.venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend` folder with the following variables:
```env
DATABASE_URL=postgresql://user:password@host/dbname
GEMINI_API_KEY=your_gemini_api_key
```

Start the FastAPI server:
```bash
python -m uvicorn app.main:app --reload
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```

---

## Docker Setup (Local Development)

The entire stack can be run locally in isolated containers using Docker. This ensures environment parity across all machines.

1. Ensure **Docker Desktop** is installed and running.
2. From the root directory of the project (`fitpulse/`), run:
   ```bash
   docker compose up --build
   ```
3. Access the frontend at `http://localhost:5173` and the backend Swagger API at `http://localhost:8000/docs`.

To stop the containers, press `Ctrl + C` or run `docker compose down`.

---

## Testing

*   **Manual API Testing:** All endpoints were rigorously tested using the auto-generated FastAPI Swagger UI (`/docs`), verifying `200`, `201`, `401`, and `422` responses.
*   **Responsiveness:** The UI was tested across various viewports (iPhone 12, iPad, Desktop) using Chrome DevTools to ensure fluid grid transitions.
*   **Future Scope:** Implement `pytest` for backend unit testing and `Playwright` for frontend E2E testing.
