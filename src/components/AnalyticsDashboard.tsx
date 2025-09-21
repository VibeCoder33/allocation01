import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Allocation } from "@/types";
import { ArrowLeft } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { motion } from "framer-motion";

interface AnalyticsDashboardProps {
  allocations: Allocation[];
  onBack: () => void;
}

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#0088FE",
  "#00C49F",
  "#FFBB28",
];

export function AnalyticsDashboard({
  allocations,
  onBack,
}: AnalyticsDashboardProps) {
  // Data processing for charts
  const allocationsByInternship = allocations.reduce((acc, alloc) => {
    acc[alloc.Internship] = (acc[alloc.Internship] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const internshipChartData = Object.keys(allocationsByInternship).map(
    (key) => ({
      name: key,
      count: allocationsByInternship[key],
    })
  );

  const allocationsByLocation = allocations.reduce((acc, alloc) => {
    const location = alloc.Location || "N/A";
    acc[location] = (acc[location] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const locationChartData = Object.keys(allocationsByLocation).map((key) => ({
    name: key,
    value: allocationsByLocation[key],
  }));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -50 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="w-full max-w-7xl mx-auto"
    >
      <Card className="w-full bg-slate-800/60 backdrop-blur-xl border-white/20 text-white shadow-2xl shadow-purple-500/10">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <CardTitle className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              Allocation Analytics
            </CardTitle>
            <Button
              onClick={onBack}
              className="flex-shrink-0 text-base font-semibold bg-white/10 hover:bg-white/20 border border-white/30 text-white transition-all duration-300 transform hover:scale-105 rounded-lg"
              variant="outline"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Results
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-8 pt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Card className="bg-white/5 border-white/10 h-full">
              <CardHeader>
                <CardTitle className="text-xl text-center">
                  Allocations by Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={locationChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      fill="#8884d8"
                      label
                    >
                      {locationChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
                      contentStyle={{
                        backgroundColor: "#1a202c",
                        border: "1px solid #4a5568",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Card className="bg-white/5 border-white/10 h-full">
              <CardHeader>
                <CardTitle className="text-xl text-center">
                  Allocations by Internship Role
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={internshipChartData}
                    margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#a0aec0" }}
                      angle={-25}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fill: "#a0aec0" }} />
                    <Tooltip
                      cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
                      contentStyle={{
                        backgroundColor: "#1a202c",
                        border: "1px solid #4a5568",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="count" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
