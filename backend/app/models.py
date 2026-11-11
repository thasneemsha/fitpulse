#In SQLAlchemy, a "Model" is a Python class that represents a table in your database.

from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    # This tells SQLAlchemy the exact name of the table in PostgreSQL
    __tablename__ = "users"

    # Column creates a column in the table.
    # Integer means whole numbers. primary_key=True means it uniquely identifies the row.
    id = Column(Integer, primary_key=True, index=True)
    
    # String requires a max length. unique=True prevents two users having the same email.
    email = Column(String, unique=True, index=True, nullable=False)
    
    # We NEVER store plain passwords. We will store the cryptographic hash here.
    hashed_password = Column(String, nullable=False)
    
    # Boolean is True/False. default=True means every new user is active by default.
    is_active = Column(Boolean, default=True)
    
    # DateTime stores the exact date and time. server_default=func.now() 
    # tells PostgreSQL to stamp the time automatically when the row is created.
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Workout(Base):
    __tablename__ = "workouts"

    id = Column(Integer, primary_key=True, index=True)
    
    # ForeignKey links this workout to the user's ID. 
    # If the user deletes their account, their workouts are deleted (ondelete="CASCADE")
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    exercise_name = Column(String, index=True, nullable=False) # e.g., "Bench Press"
    sets = Column(Integer, nullable=False)
    reps = Column(Integer, nullable=False)
    weight = Column(Float, nullable=False) # Float allows decimals like 135.5 lbs
    
    # Timestamp for when the workout was logged
    logged_at = Column(DateTime(timezone=True), server_default=func.now())

    # This allows us to easily access the user object from a workout (e.g., workout.user.email)
    user = relationship("User")


class BodyMetric(Base):
    __tablename__ = "body_metrics"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    weight = Column(Float, nullable=False) # e.g., 165.2 lbs
    body_fat_percentage = Column(Float, nullable=True) # Optional (can be null)
    
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")