import { Allocation, AllocationResponse } from "../types";

export const runAllocation = async (
  candidateFile: File,
  internshipFile: File
): Promise<Allocation[]> => {
  const formData = new FormData();
  formData.append("candidates", candidateFile);
  formData.append("internships", internshipFile);

  try {
    const response = await fetch("http://127.0.0.1:5000/allocate", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "An unknown error occurred");
    }

    const data: AllocationResponse = await response.json();
    return data.allocations;
  } catch (error) {
    console.error("Error running allocation:", error);
    if (error instanceof Error) {
      throw new Error(
        error.message || "Failed to connect to the allocation service."
      );
    }
    throw new Error(
      "An unknown error occurred while connecting to the service."
    );
  }
};
