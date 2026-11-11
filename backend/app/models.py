#In SQLAlchemy, a "Model" is a Python class that represents a table in your database.

from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from sqlalchemy.sql import func
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