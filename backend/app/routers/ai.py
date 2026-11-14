from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from google import genai
from app import models, auth
from app.database import get_db
from app.config import settings

router = APIRouter(
    prefix="/ai",
    tags=["AI Insights"]
)

client = genai.Client(api_key=settings.gemini_api_key)

@router.get("/insights")
def get_ai_insights(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    workouts = db.query(models.Workout).filter(
        models.Workout.user_id == current_user.id
    ).order_by(models.Workout.logged_at.desc()).limit(10).all()

    if not workouts:
        raise HTTPException(status_code=400, detail="Not enough workout data to analyze. Log some workouts first!")

    # NEW: Format the flexible JSON details into a readable string for the AI
    workout_text = ""
    for w in workouts:
        details_str = ", ".join([f"{key}: {val}" for key, val in w.details.items()])
        workout_text += f"- {w.exercise_name} ({w.workout_type}): {details_str}\n"

    prompt = f"""
    You are an expert personal trainer. Here is the last workout history for a user:
    {workout_text}
    
    Provide a short, 3-sentence motivational insight and one specific piece of advice 
    to help them improve based on this data. Be encouraging and professional.
    """

    try:
        response = client.models.generate_content(
            model='gemini-3.6-flash', 
            contents=prompt,
        )
        ai_message = response.text
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")

    return {"insight": ai_message}