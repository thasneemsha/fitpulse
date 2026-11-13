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

# Initialize the Gemini client
client = genai.Client(api_key=settings.gemini_api_key)

@router.get("/insights")
def get_ai_insights(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # 1. Fetch the user's last 10 workouts from the database
    workouts = db.query(models.Workout).filter(
        models.Workout.user_id == current_user.id
    ).order_by(models.Workout.logged_at.desc()).limit(10).all()

    if not workouts:
        raise HTTPException(status_code=400, detail="Not enough workout data to analyze. Log some workouts first!")

    # 2. Format the workout data into a string for the AI to read
    workout_text = ""
    for w in workouts:
        workout_text += f"- {w.exercise_name}: {w.sets} sets x {w.reps} reps at {w.weight} lbs\n"

    # 3. Create the prompt (instructions) for the AI
    prompt = f"""
    You are an expert personal trainer. Here is the last workout history for a user:
    {workout_text}
    
    Provide a short, 3-sentence motivational insight and one specific piece of advice 
    to help them improve based on this data. Be encouraging and professional.
    """

    # 4. Send the prompt to Gemini and get the response
    try:
        response = client.models.generate_content(
            model='gemini-3.6-flash',
            contents=prompt,
        )
        ai_message = response.text
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")

    # 5. Return the AI's response
    return {"insight": ai_message}