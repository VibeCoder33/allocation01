import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Allocation } from "@/types";
import { runAllocation } from "@/services/allocationApi";
import { Loader2, AlertCircle, UploadCloud, FileText } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion } from "framer-motion";

interface FileUploadProps {
  onAllocationsGenerated: (data: Allocation[]) => void;
  onGenerationError: (message: string) => void;
  error: string | null;
}

function FileDropZone({
  file,
  setFile,
  title,
  inputId,
}: {
  file: File | null;
  setFile: (file: File | null) => void;
  title: string;
  inputId: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleZoneClick = () => {
    inputRef.current?.click();
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      onClick={handleZoneClick}
      className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-500 rounded-lg bg-white/5 hover:bg-white/10 hover:border-purple-400 transition-colors duration-300 cursor-pointer relative"
    >
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept=".csv"
        onChange={onFileChange}
        className="hidden"
      />
      <UploadCloud className="w-12 h-12 text-gray-400 mb-4" />
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-400">Click to select a file</p>
      {file && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-center text-sm text-green-400"
        >
          <FileText className="w-4 h-4 mr-2" />
          <span>{file.name}</span>
        </motion.div>
      )}
    </motion.div>
  );
}

export function FileUpload({
  onAllocationsGenerated,
  onGenerationError,
  error,
}: FileUploadProps) {
  const [candidateFile, setCandidateFile] = useState<File | null>(null);
  const [internshipFile, setInternshipFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!candidateFile || !internshipFile) {
      onGenerationError("Please upload both candidate and internship files.");
      return;
    }

    setIsLoading(true);
    onGenerationError(""); // Clear previous errors
    try {
      const allocations = await runAllocation(candidateFile, internshipFile);
      onAllocationsGenerated(allocations);
    } catch (err: any) {
      const errorMessage = err.message.includes("Failed to fetch")
        ? "Connection failed. Please ensure the backend server is running."
        : err.message || "Failed to generate allocations.";
      onGenerationError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <Card className="w-full max-w-4xl mx-auto bg-slate-800/60 backdrop-blur-xl border-white/20 text-white shadow-2xl shadow-purple-500/10">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 py-2">
            AI-Based Smart Allocation Engine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <FileDropZone
                file={candidateFile}
                setFile={setCandidateFile}
                title="Upload Candidates CSV"
                inputId="candidates-file"
              />
              <FileDropZone
                file={internshipFile}
                setFile={setInternshipFile}
                title="Upload Internships CSV"
                inputId="internships-file"
              />
            </div>
            {error && (
              <Alert
                variant="destructive"
                className="mb-4 bg-red-900/50 border-red-500/50"
              >
                <AlertCircle className="h-5 w-5" />
                <AlertTitle className="font-bold">Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button
              type="submit"
              disabled={!candidateFile || !internshipFile || isLoading}
              className="w-full text-lg font-bold py-7 bg-purple-600 hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 rounded-xl shadow-lg shadow-purple-500/20 disabled:bg-gray-500 disabled:shadow-none disabled:scale-100"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  Generating Allocations...
                </>
              ) : (
                "Generate Allocations"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
