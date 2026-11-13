
from fastapi import FastAPI
from app.routers import users, workouts, ai # <-- Import workouts

app = FastAPI(title="FitPulse API", version="0.1.0")

app.include_router(users.router)
app.include_router(workouts.router)
app.include_router(ai.router)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "fitpulse-api", "version": "0.1.0"}