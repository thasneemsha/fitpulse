#  Stakeholder Requirements Document (SRD)

## 1. Project Overview
**Problem:** Students and casual gym-goers often abandon fitness tracking due to complex, paywalled, or ad-heavy applications. 
**Solution:** FitPulse is a free, AI-powered fitness tracker that focuses on long-term consistency (streaks/heatmaps) and provides automated, personalized coaching.

## 2. Actors
*   **Primary Actor (User):** A student or gym member who logs workouts and views their progress.
*   **Secondary Actor (System):** The backend API that processes JWT tokens, calculates analytics, and communicates with the Gemini AI API.

## 3. Functional Requirements (FR)
*   **FR-1 (Authentication):** The system shall allow users to register and log in securely using JWT tokens and bcrypt password hashing.
*   **FR-2 (Workout Logging):** Users shall be able to log workouts in three categories:
    *   *Strength* (Sets, Reps, Weight)
    *   *Cardio* (Distance, Time)
    *   *Flexibility* (Duration)
*   **FR-3 (Data Visualization):** The dashboard shall render a 365-day activity heatmap, a weekly calendar, and a donut chart for activity breakdown.
*   **FR-4 (AI Coaching):** The system shall fetch the last 10 workouts and query the Google Gemini API to generate personalized fitness advice.
*   **FR-5 (Data Management):** Users can delete past workouts or copy a workout to quickly log it again.

## 4. Non-Functional Requirements (NFR)
*   **NFR-1 (Security):** Passwords must never be stored in plain text. Environment variables must be used for API keys and Database URLs.
*   **NFR-2 (Responsiveness):** The UI must be fully mobile-responsive using Tailwind CSS breakpoints.
*   **NFR-3 (Performance):** The backend must use SQLAlchemy connection pooling to handle database queries efficiently.
