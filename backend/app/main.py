from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # <-- NEW IMPORT
from app.routers import users, workouts, ai

app = FastAPI(title="FitPulse API", version="0.1.0")

# --- NEW: CORS MIDDLEWARE ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Allows your React app to talk to FastAPI
    allow_credentials=True,
    allow_methods=["*"], # Allows GET, POST, OPTIONS, etc.
    allow_headers=["*"],
)
# ----------------------------

app.include_router(users.router)
app.include_router(workouts.router)
app.include_router(ai.router)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "fitpulse-api", "version": "0.1.0"}