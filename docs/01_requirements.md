# Software Requirements Specification (SRS)

### Purpose
This document defines the functional and non-functional requirements for the FitPulse application. It serves as a contract between the development team and the stakeholders to ensure all business needs are met.

## Problem Statement
Existing fitness applications suffer from feature bloat, aggressive monetization, and poor user retention. Users require a streamlined, ad-free platform that emphasizes habit formation over complex analytics.

## System Actors
1.  **Primary Actor (End User):** The individual utilizing the web interface to log workouts, view analytics, and receive AI-generated feedback.
2.  **Secondary Actor (System Admin):** (Future Scope) Internal personnel responsible for monitoring system health, user metrics, and database maintenance.
3.  **System:** The automated processes handling JWT authentication, database CRUD operations, and third-party AI API integrations.

## Functional Requirements (FR)

| ID | Requirement | Priority |
| :--- | :--- | :--- |
| **FR-01** | The system shall allow users to register and authenticate using email and hashed passwords (bcrypt). | High |
| **FR-02** | The system shall issue JSON Web Tokens (JWT) upon successful login to authorize subsequent requests. | High |
| **FR-03** | Users shall be able to log workouts categorized as Strength, Cardio, or Flexibility. | High |
| **FR-04** | The database schema shall utilize JSON columns to support dynamic, category-specific workout metrics (e.g., `sets/reps/weight` vs. `distance/time`). | High |
| **FR-05** | The dashboard shall render a 365-day consistency heatmap and a 4-week trend line chart. | Medium |
| **FR-06** | The system shall integrate with the Google Gemini API to generate personalized coaching insights based on the user's last 10 workouts. | Medium |
| **FR-07** | Users shall have the ability to delete or duplicate historical workout entries. | Medium |

## Non-Functional Requirements (NFR)

| ID | Requirement | Category |
| :--- | :--- | :--- |
| **NFR-01** | All API communication must be encrypted via HTTPS. | Security |
| **NFR-02** | Passwords must be salted and hashed using industry-standard algorithms; plain-text storage is strictly prohibited. | Security |
| **NFR-03** | The frontend must be fully responsive, rendering correctly on viewports from 375px (Mobile) to 1920px (Desktop). | Performance / UI |
| **NFR-04** | The backend must utilize SQLAlchemy connection pooling to prevent database exhaustion. | Performance |
| **NFR-05** | The application must be deployed with zero recurring costs using the free tiers of Vercel, Render, and Neon. | Operational |
