import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Allocation } from "@/types";
import { BarChart2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

interface AllocationResultsProps {
  allocations: Allocation[];
  onViewAnalytics: () => void;
  onReset: () => void;
}

export function AllocationResults({
  allocations,
  onViewAnalytics,
  onReset,
}: AllocationResultsProps) {
  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
      },
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -50 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <Card className="w-full max-w-6xl mx-auto bg-slate-800/60 backdrop-blur-xl border-white/20 text-white shadow-2xl shadow-blue-500/10">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <CardTitle className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              Allocation Results
            </CardTitle>
            <div className="flex gap-4 w-full md:w-auto">
              <Button
                onClick={onViewAnalytics}
                className="flex-1 md:flex-none text-base font-semibold bg-blue-600 hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 rounded-lg"
              >
                <BarChart2 className="w-5 h-5 mr-2" />
                View Analytics
              </Button>
              <Button
                onClick={onReset}
                className="flex-1 md:flex-none text-base font-semibold bg-white/10 hover:bg-white/20 border border-white/30 text-white transition-all duration-300 transform hover:scale-105 rounded-lg"
                variant="outline"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Start Over
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto max-h-[60vh] rounded-lg border border-white/10">
            <Table>
              <TableHeader className="bg-white/10 sticky top-0 backdrop-blur-sm">
                <TableRow>
                  <TableHead className="w-[250px] text-lg text-white font-bold">
                    Candidate
                  </TableHead>
                  <TableHead className="text-lg text-white font-bold">
                    Internship
                  </TableHead>
                  <TableHead className="text-lg text-white font-bold">
                    Score
                  </TableHead>
                  <TableHead className="text-right text-lg text-white font-bold">
                    Reason
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allocations.length > 0 ? (
                  allocations.map((alloc, index) => (
                    <motion.tr
                      key={index}
                      custom={index}
                      initial="hidden"
                      animate="visible"
                      variants={rowVariants}
                      className="hover:bg-white/5 transition-colors border-b border-white/10 last:border-b-0"
                    >
                      <TableCell className="font-medium text-base py-4">
                        {alloc.Candidate}
                      </TableCell>
                      <TableCell className="text-base py-4">
                        {alloc.Internship}
                      </TableCell>
                      <TableCell className="text-base py-4">
                        {alloc.Score.toFixed(4)}
                      </TableCell>
                      <TableCell className="text-right text-base py-4 text-gray-300">
                        {alloc.Reason}
                      </TableCell>
                    </motion.tr>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-gray-400 py-16 text-lg"
                    >
                      No allocations were generated. Please check your CSV
                      files.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
