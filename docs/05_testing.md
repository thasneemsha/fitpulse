# Testing Strategy

## 1. Manual Testing (Frontend)
*   **Responsiveness:** Verified via Chrome DevTools (iPhone 12, iPad, and Desktop view).
*   **Authentication:** Verified that unauthenticated users are redirected from `/dashboard` to `/`.
*   **Workout CRUD:** Tested that creating a workout updates the UI immediately without refreshing the page.

## 2. API Testing (Backend)
*   **Swagger UI (`/docs`):** Used to test all endpoints, verifying that validation errors return `422` and invalid tokens return `401`.
*   **CORS:** Verified that the production Vercel frontend can successfully communicate with the Render backend.

## 3. Future Automated Testing
*   **Backend:** Implement `pytest` to test the `/register` and `/login` routes.
*   **Frontend:** Implement `Playwright` to automate the login flow.
