import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { AllocationResults } from "@/components/AllocationResults";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { Allocation, Candidate, Internship } from "@/types";
import { AnimatePresence } from "framer-motion";

type View = "upload" | "results" | "analytics";

function App() {
  const [view, setView] = useState<View>("upload");
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleAllocationsGenerated = (data: {
    allocations: Allocation[];
    candidates: Candidate[];
    internships: Internship[];
  }) => {
    setAllocations(data.allocations);
    setCandidates(data.candidates);
    setInternships(data.internships);
    setError(null);
    setView("results");
  };

  const handleReset = () => {
    setAllocations([]);
    setCandidates([]);
    setInternships([]);
    setError(null);
    setView("upload");
  };

  const renderView = () => {
    switch (view) {
      case "results":
        return (
          <AllocationResults
            key="results"
            allocations={allocations}
            onViewAnalytics={() => setView("analytics")}
            onReset={handleReset}
          />
        );
      case "analytics":
        return (
          <AnalyticsDashboard
            key="analytics"
            allocations={allocations}
            candidates={candidates}
            internships={internships}
            onBack={() => setView("results")}
          />
        );
      case "upload":
      default:
        return (
          <FileUpload
            key="upload"
            onAllocationsGenerated={handleAllocationsGenerated}
            onGenerationError={setError}
            error={error}
          />
        );
    }
  };

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-hidden">
      <div className="background-area" aria-hidden="true">
        <ul className="floating-shapes">
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
        </ul>
      </div>
      <div className="z-10 w-full">
        <AnimatePresence mode="wait">{renderView()}</AnimatePresence>
      </div>
    </main>
  );
}

export default App;
