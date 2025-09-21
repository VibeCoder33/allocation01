import { useState } from "react";
import { FileUpload } from "./components/FileUpload";
import { AllocationResults } from "./components/AllocationResults";
import { AnalyticsDashboard } from "./components/AnalyticsDashboard";
import { Allocation } from "./types";
import { AnimatePresence } from "framer-motion";

type View = "upload" | "results" | "analytics";

function App() {
  const [view, setView] = useState<View>("upload");
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleAllocationsGenerated = (data: Allocation[]) => {
    setAllocations(data);
    setError(null);
    setView("results");
  };

  const handleReset = () => {
    setAllocations([]);
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
    <main className="relative min-h-screen w-full bg-slate-900 text-white flex items-center justify-center p-4 overflow-hidden">
      <div className="blob-container" aria-hidden="true">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>
      <div className="z-10 w-full">
        <AnimatePresence mode="wait">{renderView()}</AnimatePresence>
      </div>
    </main>
  );
}

export default App;
