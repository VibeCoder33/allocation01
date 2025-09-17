# backend/main.py

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
from typing import List
from recommender import InternshipRecommender, RecommendationConfig

app = FastAPI(
    title="Internship Recommendation API",
    description="API for the AI-Based Smart Allocation Engine for PM Internship Scheme.",
    version="3.0.0"  # Production version
)

# Production origins - replace with your frontend's deployed URL
origins = [
    "https://allocation01.vercel.app",
    "http://localhost:5173", # Keep for local testing
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

config = RecommendationConfig()
recommender = InternshipRecommender(config)

@app.get("/")
def read_root():
    """A simple health check endpoint."""
    return {"status": "Internship Recommender API is running!"}

@app.post("/upload/")
async def create_allocations(files: List[UploadFile] = File(...)):
    if len(files) != 2:
        raise HTTPException(status_code=400, detail="Please upload exactly two files.")

    candidates_df = None
    internships_df = None

    try:
        for file in files:
            content = await file.read()
            if "candidate" in file.filename.lower():
                candidates_df = pd.read_csv(io.StringIO(content.decode('utf-8')))
            elif "internship" in file.filename.lower():
                internships_df = pd.read_csv(io.StringIO(content.decode('utf-8')))

        if candidates_df is None or internships_df is None:
            raise HTTPException(status_code=400, detail="Ensure filenames contain 'candidate' and 'internship'.")

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error parsing CSV files: {e}")

    try:
        student_profiles = candidates_df.to_dict(orient='records')
        recommendations_df = recommender.generate_batch_recommendations(student_profiles, internships_df)

        if recommendations_df.empty:
            return {"allocations": []}

        allocations = recommendations_df.to_dict(orient='records')
        return {"allocations": allocations}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred during recommendation: {e}")