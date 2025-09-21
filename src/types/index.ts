export interface AllocationRequest {
  candidates: Candidate[];
  internships: Internship[];
}

export interface AllocationResponse {
  allocations: Array<{
    Candidate: string;
    Internship: string;
    Score: number;
    Reason: string;
    Category?: string;
    Location?: string;
  }>;
}

export interface Allocation {
  Candidate: string;
  Internship: string;
  Score: number;
  Reason: string;
  Category?: string;
  Location?: string;
}

// Represents a row from your candidates.csv
export interface Candidate {
  id: string;
  name: string;
  skills: string;
  qualifications: string;
  location_preferences: string;
  sector_interests: string;
  category: string; // Contains values like 'Rural', 'Urban', 'SC', 'ST', etc.
  past_internship: string; // 'TRUE' or 'FALSE'
  // Add other candidate fields if necessary
}

// Represents a row from your internships.csv
export interface Internship {
  id: string;
  title: string;
  required_skills: string;
  qualifications: string;
  location: string;
  organization: string;
  description: string;
  sector: string;
  capacity: number;
}
