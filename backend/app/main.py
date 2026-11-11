from fastapi import FastAPI
from app.routers import users # Import the router we just created

app = FastAPI(title="FitPulse API", version="0.1.0")

# Plug the auth routes into the main app
app.include_router(users.router)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "fitpulse-api", "version": "0.1.0"}