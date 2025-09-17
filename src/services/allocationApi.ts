import Papa from "papaparse";
import {
  Candidate,
  Internship,
  AllocationRequest,
  AllocationResponse,
} from "@/types";

export const parseCSV = <T>(file: File): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error("CSV parsing failed: " + results.errors[0].message));
          return;
        }
        resolve(results.data as T[]);
      },
      error: (error) => reject(error),
      header: true,
      skipEmptyLines: true,
    });
  });
};

export const generateMockAllocation = async (
  candidatesFile: File,
  internshipsFile: File
): Promise<AllocationResponse> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  try {
    const candidates = await parseCSV<Candidate>(candidatesFile);
    const internships = await parseCSV<Internship>(internshipsFile);

    // Generate mock allocation results
    const allocations = candidates
      .slice(0, Math.min(candidates.length, 20))
      .map((candidate, index) => {
        const internship = internships[index % internships.length];
        const score = Math.floor(Math.random() * 40) + 60; // 60-100 range

        const reasons = [
          "Strong skill match and location preference",
          "Previous experience aligns well with requirements",
          "Geographic proximity and skill compatibility",
          "High aptitude score and relevant background",
          "Optimal fit based on capacity and skills",
        ];

        return {
          Candidate: candidate.name,
          Internship: internship?.title || "Software Development Intern",
          Score: score,
          Reason: reasons[Math.floor(Math.random() * reasons.length)],
          Category: candidate.category,
        };
      });

    return { allocations };
  } catch (error) {
    throw new Error("Failed to process files: " + (error as Error).message);
  }
};

// src/services/allocationApi.ts

export const callAllocationAPI = async (
  candidatesFile: File,
  internshipsFile: File
): Promise<AllocationResponse> => {
  const formData = new FormData();
  formData.append("files", candidatesFile);
  formData.append("files", internshipsFile);

  try {
    const response = await fetch("http://localhost:8000/upload/", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Allocation API call failed");
    }

    return await response.json();
  } catch (error) {
    throw new Error("API call failed: " + (error as Error).message);
  }
};
