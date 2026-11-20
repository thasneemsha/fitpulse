# Agile Project Management

### Methodology
The project was executed using the **Scrum framework**. As a solo developer, I served as the Product Owner (defining the backlog) and Scrum Master (facilitating sprints). I tracked work via GitHub Projects, using a Kanban board (To Do, In Progress, In Review, Done).

## Sprint Breakdown

### Sprint 1: Infrastructure & Security (Weeks 1-2)
*   **Epic:** User Authentication and Core Backend Setup.
*   **Deliverables:** 
    *   Provisioned Neon PostgreSQL database.
    *   Configured SQLAlchemy and Pydantic.
    *   Implemented `/register` and `/login` endpoints using bcrypt and JWT.
*   **Retrospective:** Encountered issues with outdated `passlib` versions on Python 3.14; resolved by migrating to the modern `pwdlib` library.

### Sprint 2: Core Business Logic & AI (Weeks 3-4)
*   **Epic:** Workout Management and AI Integration.
*   **Deliverables:**
    *   Designed dynamic JSON schemas for workouts.
    *   Implemented CRUD endpoints for Workouts.
    *   Integrated Google Gemini API for automated coaching insights.
*   **Retrospective:** AI API rate limits required implementing robust exception handling to prevent HTTP 500 errors on the frontend.

### Sprint 3: Frontend Development & UI (Weeks 5-6)
*   **Epic:** React Dashboard and Data Visualization.
*   **Deliverables:**
    *   Built JWT-protected React routes.
    *   Implemented data visualization using `recharts` (Heatmap, LineChart, Donut).
    *   Designed a premium, responsive dark-mode UI using Tailwind CSS.

### Sprint 4: Deployment & QA (Week 7)
*   **Epic:** Production Deployment and Documentation.
*   **Deliverables:**
    *   Deployed backend to Render (Python environment).
    *   Deployed frontend to Vercel (Vite environment).
    *   Configured Cross-Origin Resource Sharing (CORS).
    *   Authored technical documentation.
