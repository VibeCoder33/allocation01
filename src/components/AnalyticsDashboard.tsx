import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Allocation, Candidate, Internship } from "@/types";
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
  Sector,
} from "recharts";
import { motion } from "framer-motion";

interface AnalyticsDashboardProps {
  allocations: Allocation[];
  candidates: Candidate[];
  internships: Internship[];
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
  "#FF80A2",
];

const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill="#fff"
      >{`${value} (${(percent * 100).toFixed(2)}%)`}</text>
    </g>
  );
};

export function AnalyticsDashboard({
  allocations,
  candidates,
  internships,
  onBack,
}: AnalyticsDashboardProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const onPieEnter = (_: any, index: number) => setActiveIndex(index);

  // --- Chart Data Processing ---

  // 1. Category Distribution
  const categoryDistribution = candidates.reduce((acc, candidate) => {
    const category = candidate.category.trim() || "N/A";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const categoryData = Object.keys(categoryDistribution).map((name) => ({
    name,
    value: categoryDistribution[name],
  }));

  // 2. Area Distribution (Rural/Urban)
  const areaDistribution = candidates.reduce((acc, candidate) => {
    const area = ["rural", "urban"].includes(
      candidate.category.trim().toLowerCase()
    )
      ? candidate.category
      : "Other";
    acc[area] = (acc[area] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const areaData = Object.keys(areaDistribution).map((name) => ({
    name,
    value: areaDistribution[name],
  }));

  // 3. Allocation vs Unallocation
  const allocatedCount = allocations.length;
  const unallocatedCount = candidates.length - allocatedCount;
  const allocationStatusData = [
    { name: "Allocated", value: allocatedCount },
    { name: "Unallocated", value: unallocatedCount },
  ];

  // 4. Score Distribution
  const scoreBins = {
    "0-59": 0,
    "60-69": 0,
    "70-79": 0,
    "80-89": 0,
    "90-100": 0,
  };
  allocations.forEach((alloc) => {
    const score = alloc.Score * 100;
    if (score < 60) scoreBins["0-59"]++;
    else if (score < 70) scoreBins["60-69"]++;
    else if (score < 80) scoreBins["70-79"]++;
    else if (score < 90) scoreBins["80-89"]++;
    else scoreBins["90-100"]++;
  });
  const scoreDistributionData = Object.keys(scoreBins).map((name) => ({
    name,
    count: scoreBins[name as keyof typeof scoreBins],
  }));

  // 5. Internship Capacity Utilization
  const capacityUtilization = internships.map((internship) => {
    const filled = allocations.filter(
      (a) => a.Internship === internship.title
    ).length;
    return {
      name: internship.title,
      Capacity: internship.capacity,
      Filled: filled,
    };
  });

  // 6. Fairness Boost Comparison (MOCK DATA)
  const fairnessBoostData = [
    { name: "SC", "With Boost": 8, "Without Boost": 5 },
    { name: "ST", "With Boost": 6, "Without Boost": 3 },
    { name: "OBC", "With Boost": 12, "Without Boost": 9 },
    { name: "Rural", "With Boost": 15, "Without Boost": 10 },
    { name: "PwD", "With Boost": 3, "Without Boost": 1 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -50 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="w-full max-w-screen-2xl mx-auto"
    >
      <Card className="w-full bg-slate-800/60 backdrop-blur-xl border-white/20 text-white shadow-2xl shadow-purple-500/10">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <CardTitle className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              Allocation Analytics Dashboard
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
        <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6">
          {/* Chart: Allocation vs Unallocation */}
          <ChartCard title="Allocation Status">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={allocationStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {allocationStatusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a202c",
                    border: "1px solid #4a5568",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Chart: Category Distribution */}
          <ChartCard title="Candidate Category Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Chart: Area Distribution */}
          <ChartCard title="Candidate Area Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={areaData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#82ca9d"
                  label
                >
                  {areaData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a202c",
                    border: "1px solid #4a5568",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Chart: Score Distribution */}
          <ChartCard title="Allocation Score Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scoreDistributionData}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="name" tick={{ fill: "#a0aec0" }} />
                <YAxis tick={{ fill: "#a0aec0" }} />
                <Tooltip
                  cursor={{ fill: "rgba(136, 132, 216, 0.2)" }}
                  contentStyle={{
                    backgroundColor: "#1a202c",
                    border: "1px solid #4a5568",
                  }}
                />
                <Bar dataKey="count" name="Candidates" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Chart: Internship Capacity Utilization */}
          <ChartCard title="Internship Capacity Utilization">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={capacityUtilization}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis type="number" tick={{ fill: "#a0aec0" }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={150}
                  tick={{ fill: "#a0aec0" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a202c",
                    border: "1px solid #4a5568",
                  }}
                />
                <Legend />
                <Bar dataKey="Capacity" stackId="a" fill="#8884d8" />
                <Bar dataKey="Filled" stackId="a" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Chart: Fairness Boost Comparison */}
          <ChartCard title="Fairness Boost Comparison (Mock Data)">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={fairnessBoostData}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="name" tick={{ fill: "#a0aec0" }} />
                <YAxis tick={{ fill: "#a0aec0" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a202c",
                    border: "1px solid #4a5568",
                  }}
                />
                <Legend />
                <Bar dataKey="Without Boost" fill="#ffc658" />
                <Bar dataKey="With Boost" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// A helper component to wrap each chart in a consistent card style
const ChartCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Card className="bg-white/5 border-white/10 h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl text-center text-gray-300">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center">
        {children}
      </CardContent>
    </Card>
  </motion.div>
);
