import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge, BadgeProps } from "@/components/ui/badge";

export interface AllocationResult {
  Candidate: string;
  Internship: string;
  Score: number;
  Reason: string;
  Category: string;
}

interface AllocationResultsProps {
  results: AllocationResult[];
  onReset: () => void;
}

export const AllocationResults: React.FC<AllocationResultsProps> = ({
  results,
  onReset,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredResults = useMemo(() => {
    if (!searchTerm) {
      return results;
    }
    return results.filter(
      (result) =>
        (result.Candidate &&
          result.Candidate.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (result.Internship &&
          result.Internship.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (result.Category &&
          result.Category.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [results, searchTerm]);

  // Helper function to determine badge color based on score
  const getScoreBadgeVariant = (score: number): BadgeProps["variant"] => {
    if (score > 75) {
      return "default"; // Green in shadcn/ui
    }
    if (score > 50) {
      return "secondary"; // Yellowish/Gray in shadcn/ui
    }
    return "destructive"; // Red in shadcn/ui
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Allocation Results</CardTitle>
          <Button onClick={onReset} variant="outline">
            Start New Allocation
          </Button>
        </div>
        <Input
          placeholder="Search results..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mt-4"
        />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Internship</TableHead>
              <TableHead className="text-center">Score</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Category</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredResults.map((result, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  {result.Candidate}
                </TableCell>
                <TableCell>{result.Internship}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={getScoreBadgeVariant(result.Score)}>
                    {Math.round(result.Score)}
                  </Badge>
                </TableCell>
                <TableCell>{result.Reason}</TableCell>
                <TableCell>
                  <Badge variant="outline">{result.Category}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
