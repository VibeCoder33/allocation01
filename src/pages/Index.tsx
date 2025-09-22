import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { AllocationResults } from "@/components/AllocationResults";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { Toaster } from "@/components/ui/toaster";
import { Allocation, Candidate, Internship } from "@/types";
import { motion } from "framer-motion";

type View = "upload" | "results" | "analytics";

export default function Index() {
  const [view, setView] = useState<View>("upload");
  const [error, setError] = useState<string | null>(null);

  // State to hold all data after generation
  const [allocationData, setAllocationData] = useState<{
    allocations: Allocation[];
    candidates: Candidate[];
    internships: Internship[];
  } | null>(null);

  const handleAllocationsGenerated = (data: {
    allocations: Allocation[];
    candidates: Candidate[];
    internships: Internship[];
  }) => {
    setAllocationData(data);
    setView("results");
    setError(null); // Clear any previous errors
  };

  const handleGenerationError = (message: string) => {
    setError(message);
  };

  const handleReset = () => {
    setAllocationData(null);
    setError(null);
    setView("upload");
  };

  const renderContent = () => {
    switch (view) {
      case "analytics":
        if (allocationData) {
          return (
            <AnalyticsDashboard
              {...allocationData}
              onBack={() => setView("results")}
            />
          );
        }
        // Fallback to upload if data is missing
        handleReset();
        return null;

      case "results":
        if (allocationData) {
          return (
            <AllocationResults
              allocations={allocationData.allocations}
              onViewAnalytics={() => setView("analytics")}
              onReset={handleReset}
            />
          );
        }
        // Fallback to upload if data is missing
        handleReset();
        return null;

      case "upload":
      default:
        return (
          <FileUpload
            onAllocationsGenerated={handleAllocationsGenerated}
            onGenerationError={handleGenerationError}
            error={error}
          />
        );
    }
  };

  return (
    <>
      <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center">
        <header className="text-center mb-10">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl md:text-7xl font-bold tracking-tighter"
          >
            <span className="text-slate-200">Skill</span>
            <span className="text-purple-400">Sync</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-3 text-lg text-slate-400"
          >
            AI-Based Smart Allocation Engine for PM Internship Scheme
          </motion.p>
        </header>

        <main className="w-full">{renderContent()}</main>
      </div>
      <Toaster />
    </>
  );
}
