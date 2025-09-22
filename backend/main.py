import pandas as pd
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from pydantic import BaseModel
import io
import numpy as np

# --- Configuration ---
class RecommendationConfig:
    SKILLS_WEIGHT = 0.5
    QUALIFICATIONS_WEIGHT = 0.3
    LOCATION_WEIGHT = 0.1
    INTERESTS_WEIGHT = 0.1
    RURAL_BONUS = 0.05
    CATEGORY_BONUS = 0.05
    PAST_INTERNSHIP_PENALTY = 0.1

# --- Recommender Logic ---
class InternshipRecommender:
    def __init__(self, config: RecommendationConfig):
        self.config = config
        self.vectorizer = TfidfVectorizer(stop_words='english')

    def _calculate_similarity(self, text1, text2):
        try:
            tfidf_matrix = self.vectorizer.fit_transform([str(text1), str(text2)])
            return cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        except Exception:
            return 0.0

    def _calculate_score(self, candidate, internship):
        skills_score = self._calculate_similarity(candidate.get('skills', ''), internship.get('required_skills', ''))
        qual_score = self._calculate_similarity(candidate.get('qualifications', ''), internship.get('qualifications', ''))
        loc_score = 1 if candidate.get('location_preferences', '').lower() == internship.get('location', '').lower() else 0
        interests_score = self._calculate_similarity(candidate.get('sector_interests', ''), internship.get('sector', ''))

        base_score = (skills_score * self.config.SKILLS_WEIGHT +
                      qual_score * self.config.QUALIFICATIONS_WEIGHT +
                      loc_score * self.config.LOCATION_WEIGHT +
                      interests_score * self.config.INTERESTS_WEIGHT)

        # Apply bonuses and penalties
        reason = f"Base score ({base_score:.2f}) from skills, qualifications, location, and interests."
        if str(candidate.get('category', '')).strip().lower() == 'rural':
            base_score += self.config.RURAL_BONUS
            reason += f" Rural bonus (+{self.config.RURAL_BONUS}) applied."
        if str(candidate.get('past_internship', '')).strip().lower() == 'true':
            base_score -= self.config.PAST_INTERNSHIP_PENALTY
            reason += f" Past internship penalty (-{self.config.PAST_INTERNSHIP_PENALTY}) applied."
        
        # Ensure score is within [0, 1]
        final_score = np.clip(base_score, 0, 1)
        
        return final_score, reason

    def recommend(self, candidates_df, internships_df):
        allocations = []
        available_internships = internships_df.copy()
        
        for _, candidate in candidates_df.iterrows():
            scores = []
            for _, internship in available_internships.iterrows():
                if int(internship['capacity']) > 0:
                    score, reason = self._calculate_score(candidate, internship)
                    scores.append((score, reason, internship))
            
            if scores:
                scores.sort(key=lambda x: x[0], reverse=True)
                best_score, best_reason, best_internship = scores[0]
                
                allocations.append({
                    "Candidate": candidate['name'],
                    "Internship": best_internship['title'],
                    "Score": best_score,
                    "Reason": best_reason,
                    "Category": candidate.get('category', 'N/A'),
                    "Location": best_internship.get('location', 'N/A')
                })
                
                internship_idx = available_internships.index[available_internships['id'] == best_internship['id']]
                available_internships.loc[internship_idx, 'capacity'] -= 1

        return sorted(allocations, key=lambda x: x['Score'], reverse=True)

# --- FastAPI App ---
app = FastAPI()

# IMPORTANT: Add your deployed frontend URLs here
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://allocation01.vercel.app",
    "https://allocation01-git-main-vibecoder33s-projects.vercel.app", # Specific URL from your error log
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AllocationResponse(BaseModel):
    allocations: list

@app.get("/")
def read_root():
    return {"message": "AI-Based Smart Allocation Engine Backend"}

@app.post("/allocate", response_model=AllocationResponse)
async def create_allocations(candidates: UploadFile = File(...), internships: UploadFile = File(...)):
    try:
        candidates_content = await candidates.read()
        internships_content = await internships.read()
        
        candidates_df = pd.read_csv(io.StringIO(candidates_content.decode('utf-8'))).fillna('')
        internships_df = pd.read_csv(io.StringIO(internships_content.decode('utf-8'))).fillna('')
        
        config = RecommendationConfig()
        recommender = InternshipRecommender(config)
        
        allocations = recommender.recommend(candidates_df, internships_df)
        
        return {"allocations": allocations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

