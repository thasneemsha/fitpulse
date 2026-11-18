# 4. API Reference Guide

### Overview
The FitPulse API is a RESTful service built with FastAPI. All endpoints return JSON. Protected routes require a valid JWT passed in the `Authorization` header as a Bearer token.
`Authorization: Bearer <token>`

## Authentication Routes

### `POST /auth/register`
Creates a new user account.
*   **Request Body:** `application/json`
    *   `email` (string, required)
    *   `password` (string, required)
*   **Responses:**
    *   `201 Created`: Returns user object (excluding password).
    *   `400 Bad Request`: Email already exists.

### `POST /auth/login`
Authenticates a user and returns a JWT.
*   **Request Body:** `application/x-www-form-urlencoded`
    *   `username` (string, required) - *Note: Must be the user's email address.*
    *   `password` (string, required)
*   **Responses:**
    *   `200 OK`: `{ "access_token": "...", "token_type": "bearer" }`
    *   `401 Unauthorized`: Incorrect credentials.

## Workout Routes (Protected)

### `GET /workouts/`
Retrieves all workouts for the authenticated user.
*   **Responses:** `200 OK` (Array of Workout Objects)

### `POST /workouts/`
Creates a new workout entry.
*   **Request Body:** `application/json`
    *   `workout_type` (string: "Strength", "Cardio", "Flexibility")
    *   `exercise_name` (string)
    *   `details` (JSON object containing dynamic metrics)
*   **Responses:** `201 Created`

### `DELETE /workouts/{id}`
Deletes a specific workout by ID.
*   **Responses:** `204 No Content` | `404 Not Found`

## AI Integration Routes (Protected)

### `GET /ai/insights`
Queries the Google Gemini API using the user's last 10 workouts.
*   **Responses:** 
    *   `200 OK`: `{ "insight": "Generated coaching text..." }`
    *   `400 Bad Request`: Not enough workout data.
