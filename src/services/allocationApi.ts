import { Allocation, AllocationResponse } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export const allocate = async (
  candidatesFile: File,
  internshipsFile: File
): Promise<Allocation[]> => {
  const formData = new FormData();
  formData.append("candidates", candidatesFile);
  formData.append("internships", internshipsFile);

  try {
    const response = await fetch(`${API_BASE_URL}/allocate`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ detail: "An unknown error occurred." }));
      throw new Error(
        errorData.detail || `Server responded with status: ${response.status}`
      );
    }

    const data: AllocationResponse = await response.json();
    return data.allocations;
  } catch (error) {
    console.error("API call failed:", error);
    if (error instanceof Error && error.message.includes("Failed to fetch")) {
      throw new Error(
        "Connection failed. Please ensure the backend server is running."
      );
    }
    throw error;
  }
};
