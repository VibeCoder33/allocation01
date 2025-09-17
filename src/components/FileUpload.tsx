import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFilesUploaded: (
    candidatesFile: File | null,
    internshipsFile: File | null
  ) => void;
  isLoading?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesUploaded,
  isLoading,
}) => {
  const [candidatesFile, setCandidatesFile] = useState<File | null>(null);
  const [internshipsFile, setInternshipsFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log("Accepted files:", acceptedFiles); // <-- ADD THIS LINE

    acceptedFiles.forEach((file) => {
      const fileName = file.name.toLowerCase();
      if (fileName.includes("candidate")) {
        console.log("Found candidates file:", file.name); // <-- ADD THIS LINE
        setCandidatesFile(file);
      } else if (fileName.includes("internship")) {
        console.log("Found internships file:", file.name); // <-- ADD THIS LINE
        setInternshipsFile(file);
      } else {
        console.log("Unrecognized file:", file.name); // <-- ADD THIS LINE
      }
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
    multiple: true,
  });

  // ... (the rest of your component code remains the same)
  const removeFile = (type: "candidates" | "internships") => {
    if (type === "candidates") {
      setCandidatesFile(null);
    } else {
      setInternshipsFile(null);
    }
  };

  const handleUpload = () => {
    onFilesUploaded(candidatesFile, internshipsFile);
  };

  const canUpload = candidatesFile && internshipsFile && !isLoading;

  return (
    <div className="space-y-6">
      <Card
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-300",
          "hover:shadow-elegant hover:border-primary/30",
          isDragActive && "border-primary bg-accent/50 shadow-glow"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Upload CSV Files</h3>
          <p className="text-muted-foreground">
            Drop your Candidates.csv and Internships.csv files here, or click to
            select
          </p>
        </div>
      </Card>

      {(candidatesFile || internshipsFile) && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-4">
            <h4 className="font-medium mb-3 text-foreground">
              Candidates File
            </h4>
            {candidatesFile ? (
              <div className="flex items-center justify-between bg-accent/30 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <File className="h-4 w-4 text-primary" />
                  <span className="text-sm truncate">
                    {candidatesFile.name}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile("candidates")}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground italic">
                No file selected
              </div>
            )}
          </Card>

          <Card className="p-4">
            <h4 className="font-medium mb-3 text-foreground">
              Internships File
            </h4>
            {internshipsFile ? (
              <div className="flex items-center justify-between bg-accent/30 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <File className="h-4 w-4 text-primary" />
                  <span className="text-sm truncate">
                    {internshipsFile.name}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile("internships")}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground italic">
                No file selected
              </div>
            )}
          </Card>
        </div>
      )}

      <Button
        onClick={handleUpload}
        disabled={!canUpload}
        className="w-full bg-gradient-primary hover:opacity-90 transition-all"
        size="lg"
      >
        {isLoading ? "Processing..." : "Generate Allocation"}
      </Button>
    </div>
  );
};
