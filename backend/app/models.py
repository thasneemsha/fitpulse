from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Workout(Base):
    __tablename__ = "workouts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # NEW: The category (e.g., "Strength", "Cardio", "Flexibility")
    workout_type = Column(String, nullable=False) 
    
    # The specific name (e.g., "Bench Press", "Running")
    exercise_name = Column(String, index=True, nullable=False) 
    
    # NEW: A JSON column that stores flexible data. 
    # For Strength: {"sets": 3, "reps": 10, "weight": 135}
    # For Cardio: {"distance": 5, "time": 30}
    details = Column(JSON, nullable=False) 
    
    logged_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User")

class BodyMetric(Base):
    __tablename__ = "body_metrics"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    weight = Column(Float, nullable=False)
    body_fat_percentage = Column(Float, nullable=True)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User")