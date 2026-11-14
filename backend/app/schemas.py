# Pydantic schemas define what data goes in and out of your API.
# If a user sends an invalid email, Pydantic rejects it before it even hits the database.

from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Dict, Any

# This is what we expect when a user REGISTERS or LOGS IN
class UserCreate(BaseModel):
    email: EmailStr # Pydantic will automatically check if this is a valid email format
    password: str

# This is what we send BACK to the user after they register or log in
class UserResponse(BaseModel):
    id: int
    email: EmailStr
    is_active: bool
    created_at: datetime

    # This tells Pydantic to read data directly from the SQLAlchemy model
    class Config:
        from_attributes = True

# Workout Schemas
class WorkoutCreate(BaseModel):
    workout_type: str
    exercise_name: str
    details: Dict[str, Any] # Accepts any JSON structure

class WorkoutResponse(WorkoutCreate):
    id: int
    user_id: int
    logged_at: datetime
    class Config:
        from_attributes = True

class BodyMetricCreate(BaseModel):
    weight: float
    body_fat_percentage: float | None = None

# Body Metric Schemas
class BodyMetricResponse(BodyMetricCreate):
    id: int
    user_id: int
    recorded_at: datetime
    class Config:
        from_attributes = True