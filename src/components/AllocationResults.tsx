// src/components/AllocationResults.tsx

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
import { Badge } from "@/components/ui/badge";

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
              <TableHead>Score</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Category</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredResults.map((result, index) => (
              <TableRow key={index}>
                <TableCell>{result.Candidate}</TableCell>
                <TableCell>{result.Internship}</TableCell>
                <TableCell>{Math.round(result.Score)}</TableCell>
                <TableCell>{result.Reason}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{result.Category}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
