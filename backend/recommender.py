# backend/recommender.py

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RecommendationConfig:
    """Configuration for the recommendation engine."""
    def __init__(self):
        self.weights = {
            'skills': 0.5,
            'qualifications': 0.3,
            'location': 0.2
        }
        self.top_n = 10

class InternshipRecommender:
    """The main class for the recommendation engine."""
    def __init__(self, config):
        self.config = config
        self.vectorizer = TfidfVectorizer(stop_words='english')

    def _calculate_similarity(self, text1, text2):
        """Calculates cosine similarity between two text strings."""
        if not text1 or not text2 or pd.isna(text1) or pd.isna(text2):
            return 0.0
        try:
            tfidf_matrix = self.vectorizer.fit_transform([str(text1), str(text2)])
            return cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        except ValueError:
            return 0.0

    def _generate_reason(self, row):
        """Generates a human-readable reason for the match."""
        reasons = []
        if row.get('skills_similarity', 0) > 0.5:
            reasons.append("strong skill match")
        if row.get('qualifications_similarity', 0) > 0.5:
            reasons.append("strong qualification alignment")
        if row.get('location_similarity', 0) > 0.8:
            reasons.append("ideal location preference")
        
        if not reasons:
            return "Good overall fit based on profile."
        return f"Match based on: {', '.join(reasons)}."

    def generate_batch_recommendations(self, student_profiles, internships_df):
        """
        Generates recommendations for a batch of student profiles.
        """
        logger.info(f"Generating recommendations for {len(student_profiles)} students...")
        all_matches = []

        for student in student_profiles:
            scores = []
            for _, internship in internships_df.iterrows():
                # --- Similarity Calculations ---
                skills_sim = self._calculate_similarity(student.get('skills'), internship.get('required_skills'))
                qual_sim = self._calculate_similarity(student.get('qualifications'), internship.get('qualifications'))
                loc_sim = 1 if str(student.get('location_preferences', '')).lower() in str(internship.get('location', '')).lower() else 0

                # --- Weighted Score ---
                score = (
                    skills_sim * self.config.weights['skills'] +
                    qual_sim * self.config.weights['qualifications'] +
                    loc_sim * self.config.weights['location']
                ) * 100

                scores.append({
                    'student_id': student.get('id'),
                    'internship_id': internship.get('id'),
                    'score': score,
                    'skills_similarity': skills_sim,
                    'qualifications_similarity': qual_sim,
                    'location_similarity': loc_sim
                })
            
            if scores:
                # Find the best match for the current student
                top_match = max(scores, key=lambda x: x['score'])
                
                matched_internship = internships_df[internships_df['id'] == top_match['internship_id']].iloc[0]
                
                # *** THIS IS THE CRITICAL FIX ***
                # Create the final dictionary with keys the frontend expects
                match_details = {
                    'Candidate': student.get('name'),
                    'Internship': matched_internship.get('title'),
                    'Score': top_match['score'],
                    'Reason': self._generate_reason(top_match),
                    'Category': student.get('category')
                }
                all_matches.append(match_details)

        if not all_matches:
            return pd.DataFrame()

        return pd.DataFrame(all_matches)