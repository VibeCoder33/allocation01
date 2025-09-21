import { Allocation } from "@/types";

// Use an environment variable for the API base URL.
// It will default to the local server if the variable is not set.
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";

export const runAllocation = async (
  candidatesFile: File,
  internshipsFile: File
): Promise<Allocation[]> => {
  const formData = new FormData();
  formData.append("candidates", candidatesFile);
  formData.append("internships", internshipsFile);

  const response = await fetch(`${API_BASE_URL}/allocate`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "An unknown error occurred");
  }

  const result = await response.json();
  return result.allocations;
};
