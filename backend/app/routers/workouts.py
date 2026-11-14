from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app import models, schemas, auth
from app.database import get_db
from fastapi import HTTPException

router = APIRouter(
    prefix="/workouts",
    tags=["Workouts & Metrics"]
)

# --- WORKOUT ENDPOINTS ---

@router.post("/", response_model=schemas.WorkoutResponse, status_code=status.HTTP_201_CREATED)
def create_workout(
    workout: schemas.WorkoutCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Create the workout manually since the schema changed to a flexible JSON model
    new_workout = models.Workout(
        workout_type=workout.workout_type,
        exercise_name=workout.exercise_name,
        details=workout.details,
        user_id=current_user.id
    )
    db.add(new_workout)
    db.commit()
    db.refresh(new_workout)
    return new_workout

@router.get("/", response_model=List[schemas.WorkoutResponse])
def get_my_workouts(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    workouts = db.query(models.Workout).filter(models.Workout.user_id == current_user.id).all()
    return workouts

@router.delete("/{workout_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workout(
    workout_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Find the workout, ensuring it belongs to the current user
    workout = db.query(models.Workout).filter(
        models.Workout.id == workout_id, 
        models.Workout.user_id == current_user.id
    ).first()
    
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")
        
    db.delete(workout)
    db.commit()
    return None

# --- BODY METRIC ENDPOINTS ---

@router.post("/metrics", response_model=schemas.BodyMetricResponse, status_code=status.HTTP_201_CREATED)
def create_body_metric(
    metric: schemas.BodyMetricCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    new_metric = models.BodyMetric(
        **metric.model_dump(),
        user_id=current_user.id
    )
    db.add(new_metric)
    db.commit()
    db.refresh(new_metric)
    return new_metric

@router.get("/metrics", response_model=List[schemas.BodyMetricResponse])
def get_my_metrics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    metrics = db.query(models.BodyMetric).filter(models.BodyMetric.user_id == current_user.id).all()
    return metrics