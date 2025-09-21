export interface Candidate {
  id: string;
  name: string;
  skills: string;
  location: string;
  category: string;
  past: string;
}

export interface Internship {
  id: string;
  title: string;
  skills: string;
  location: string;
  capacity: number;
}

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

// A single, reusable type for one allocation entry.
export type Allocation = AllocationResponse["allocations"][0];
