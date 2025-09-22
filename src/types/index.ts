/**
 * Represents the structure of a single candidate from the CSV file.
 */
export interface Candidate {
  id: string;
  name: string;
  skills: string;
  qualifications: string;
  location_preferences: string;
  sector_interests: string;
  category: string;
  past_internship: string;
}

/**
 * Represents the structure of a single internship from the CSV file.
 */
export interface Internship {
  id: string;
  title: string;
  required_skills: string;
  qualifications: string;
  location: string;
  sector: string;
  capacity: number;
}

/**
 * Defines the structure for a single allocation record returned by the API.
 */
export interface Allocation {
  Candidate: string;
  Internship: string;
  Score: number;
  Reason: string;
  Category: string;
  Location: string;
}

/**
 * Defines the structure for the API response from the /allocate endpoint.
 */
export interface AllocationResponse {
  allocations: Allocation[];
}

/**
 * Defines the properties (props) for the main FileUpload component wrapper.
 */
export interface FileUploadProps {
  onAllocationsGenerated: (data: {
    allocations: Allocation[];
    candidates: Candidate[];
    internships: Internship[];
  }) => void;
  onGenerationError: (message: string) => void;
  error: string | null;
}

/**
 * Defines the properties (props) for the AllocationResults component.
 */
export interface AllocationResultsProps {
  allocations: Allocation[];
  onViewAnalytics: () => void;
  onReset: () => void;
}

/**
 * Defines the properties (props) for the AnalyticsDashboard component.
 */
export interface AnalyticsDashboardProps {
  allocations: Allocation[];
  candidates: Candidate[];
  internships: Internship[];
  onBack: () => void;
}
