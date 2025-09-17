from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
from typing import List

# Import your recommender logic
from recommender import InternshipRecommender, RecommendationConfig

# --- API Setup ---
app = FastAPI(
    title="Internship Recommendation API",
    description="API for the AI-Based Smart Allocation Engine for PM Internship Scheme.",
    version="2.1.0" # Version bump for new feature
)

# --- CORS Configuration ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Data Loading (On Startup) ---
# The internship listings are now loaded once when the server starts.
try:
    internships_df = pd.read_csv("internships.csv")
    print("Internship data loaded successfully.")
except FileNotFoundError:
    print("FATAL ERROR: `internships.csv` not found. The API cannot function without it.")
    internships_df = pd.DataFrame()


# --- Recommender Initialization ---
config = RecommendationConfig()
recommender = InternshipRecommender(config)

# --- API Endpoints ---
@app.get("/")
def read_root():
    """A simple health check endpoint."""
    return {"status": "Internship Recommender API is running!"}

@app.post("/recommend-for-student")
async def get_recommendations_for_student(
    student_profile_file: UploadFile = File(...)
):
    """
    Receives a single uploaded CSV file for a student profile,
    and returns recommendations based on the pre-loaded internship data.
    """
    if internships_df.empty:
        raise HTTPException(status_code=500, detail="Internship data is not available on the server.")

    # Read the uploaded student profile CSV
    try:
        student_content = await student_profile_file.read()
        students_df = pd.read_csv(io.StringIO(student_content.decode('utf-8')))
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error parsing student CSV file: {e}")

    # Convert the student DataFrame into a list of profile dictionaries
    # This allows the user to get recommendations for one or more students in a single file
    student_profiles = students_df.to_dict(orient='records')

    try:
        # Generate recommendations for the entire batch of students in the file
        all_recommendations_df = recommender.generate_batch_recommendations(student_profiles, internships_df)
        
        if all_recommendations_df.empty:
            return []

        # Convert the final DataFrame to a list of dictionaries for the JSON response
        return all_recommendations_df.to_dict(orient='records')

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")

