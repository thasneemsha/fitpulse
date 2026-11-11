from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import models, schemas, auth
from app.database import get_db

# APIRouter creates a mini-FastAPI app we can plug into the main one
router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

# 1. REGISTRATION ENDPOINT
@router.post("/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if the user already exists in the database
    # db.query(User) means "SELECT * FROM users"
    # .filter(...) means "WHERE email = user.email"
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    
    if existing_user:
        # If they exist, throw a 400 Bad Request error
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash the password using our auth.py utility
    hashed_pw = auth.get_password_hash(user.password)
    
    # Create a new SQLAlchemy User object
    new_user = models.User(
        email=user.email,
        hashed_password=hashed_pw
    )
    
    # Save to the database (INSERT INTO users ...)
    db.add(new_user)
    db.commit()
    db.refresh(new_user) # This refreshes the object to get the generated ID and created_at date from the DB
    
    # FastAPI will automatically use the UserResponse schema to hide the hashed password
    return new_user

# 2. LOGIN ENDPOINT
@router.post("/login")
def login_user(user_credentials: schemas.UserCreate, db: Session = Depends(get_db)):
    # Find the user by email
    user = db.query(models.User).filter(models.User.email == user_credentials.email).first()
    
    # If user doesn't exist, or password is wrong, throw a 401 Unauthorized error
    if not user or not auth.verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # If login is successful, create a JWT token containing their email and ID
    access_token = auth.create_access_token(
        data={"sub": user.email, "id": user.id}
    )
    
    # Return the token to the user
    return {"access_token": access_token, "token_type": "bearer"}