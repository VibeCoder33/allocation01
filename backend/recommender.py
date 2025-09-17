import pandas as pd
from typing import Dict, List, Tuple
from dataclasses import dataclass
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class RecommendationConfig:
    """Configuration class for recommendation parameters"""
    skill_weight: float = 10.0
    location_bonus: float = 5.0
    sector_bonus: float = 5.0
    past_penalty: float = -5.0
    fairness_boost: Dict[str, float] = None
    min_recommendations: int = 5
    max_recommendations: int = 10

    def __post_init__(self):
        if self.fairness_boost is None:
            self.fairness_boost = {
                "rural": 10, "tribal": 15, "sc": 10, "st": 10,
                "obc": 5, "pwd": 20, "urban": 0, "general": 0
            }

class InternshipRecommender:
    def __init__(self, config: RecommendationConfig = None):
        self.config = config or RecommendationConfig()
        self.recommendations_history = {}

    def _prepare_profile_data(self, profile: Dict) -> Dict:
        """Helper to convert string data from CSV into sets for processing."""
        profile['skills'] = set(s.strip().lower() for s in str(profile.get('skills', '')).split(','))
        profile['location_preferences'] = set(s.strip().lower() for s in str(profile.get('location_preferences', '')).split(','))
        profile['sector_interests'] = set(s.strip().lower() for s in str(profile.get('sector_interests', '')).split(','))
        return profile

    def compute_recommendation_score(self, profile: Dict, internship: pd.Series) -> Tuple[float, List[str]]:
        """Calculate recommendation score for a student-internship pair"""
        score = 0.0
        reasons = []

        student_skills = profile['skills']
        location_prefs = profile['location_preferences']
        sector_interests = profile['sector_interests']
        
        internship_skills_str = internship.get('skills', '')
        internship_skills = set(s.strip().lower() for s in str(internship_skills_str).split(','))

        # 1. Skill matching
        skill_matches = student_skills.intersection(internship_skills)
        skill_score = len(skill_matches) * self.config.skill_weight
        if skill_matches:
            score += skill_score
            reasons.append(f"Skill match: {', '.join(sorted(skill_matches))} (+{skill_score:.0f})")

        # 2. Location preference matching
        internship_location = str(internship.get('location', '')).lower().strip()
        if internship_location in location_prefs:
            score += self.config.location_bonus
            reasons.append(f"Location preference: {internship['location']} (+{self.config.location_bonus:.0f})")

        # 3. Sector interest matching
        internship_sector = str(internship.get('sector', '')).lower().strip()
        if internship_sector in sector_interests:
            score += self.config.sector_bonus
            reasons.append(f"Sector interest: {internship['sector']} (+{self.config.sector_bonus:.0f})")

        # 4. Category-based fairness boost
        category = str(profile.get('category', 'general')).lower().strip()
        category_boost = self.config.fairness_boost.get(category, 0)
        if category_boost > 0:
            score += category_boost
            reasons.append(f"{category.title()} category boost (+{category_boost:.0f})")

        # 5. Past internship penalty
        past_internship = str(profile.get('past_internship', 'false')).lower() in ['true', '1', 't', 'y', 'yes']
        if past_internship:
            score += self.config.past_penalty
            reasons.append(f"Past internship penalty ({self.config.past_penalty:.0f})")

        return score, reasons

    def _get_strength_label(self, score: float) -> str:
        """Convert numeric score to descriptive strength label"""
        if score >= 40: return "Excellent Match"
        elif score >= 25: return "Very Good Match"
        elif score >= 15: return "Good Match"
        elif score >= 5: return "Fair Match"
        else: return "Weak Match"

    def generate_batch_recommendations(self, profiles: List[Dict], internships: pd.DataFrame) -> pd.DataFrame:
        """Generate recommendations for multiple students from a list of profile dicts."""
        all_recommendations = []
        logger.info(f"Generating recommendations for {len(profiles)} students...")

        for i, profile in enumerate(profiles):
            try:
                processed_profile = self._prepare_profile_data(profile)
                
                recommendations = []
                for _, internship in internships.iterrows():
                    score, reasons = self.compute_recommendation_score(processed_profile, internship)
                    if score > 0: # Only consider internships with a positive score
                         recommendations.append({
                            'Student_ID': profile.get('id', 'N/A'),
                            'Student_Name': profile.get('name', 'N/A'),
                            'Internship_ID': internship['id'],
                            'Internship_Title': internship['title'],
                            'Company/Organization': internship.get('organization', 'N/A'),
                            'Location': internship['location'],
                            'Sector': internship['sector'],
                            'Score': round(score, 2),
                            'Recommendation_Strength': self._get_strength_label(score),
                            'Reasons': "; ".join(reasons)
                        })
                
                recommendations.sort(key=lambda x: x['Score'], reverse=True)
                top_recommendations = recommendations[:self.config.max_recommendations]
                all_recommendations.extend(top_recommendations)

            except Exception as e:
                logger.error(f"Failed to generate recommendations for {profile.get('name', 'Unknown')}: {e}")
                continue
        
        if all_recommendations:
            return pd.DataFrame(all_recommendations)
        return pd.DataFrame()