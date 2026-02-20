// StudentPerformanceBadge.jsx
import React from "react";
import {
  Star,
  Award,
  Trophy,
  BookOpen,
  Sparkles,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";

const getBadge = (average) => {
  if (average >= 90) {
    return {
      label: "Top Performer",
      Icon: Star,
      color: "text-yellow-500",
      bg: "bg-yellow-100",
    };
  } else if (average >= 75) {
    return {
      label: "Great Progress",
      Icon: Award,
      color: "text-gray-600",
      bg: "bg-gray-100",
    };
  } else if (average >= 50) {
    return {
      label: "Keep Going",
      Icon: Trophy,
      color: "text-orange-600",
      bg: "bg-orange-100",
    };
  } else {
    return {
      label: "Improving",
      Icon: BookOpen,
      color: "text-blue-600",
      bg: "bg-blue-100",
    };
  }
};

const StudentPerformanceBadge = ({ average }) => {
  const badge = getBadge(average);

  return (
    <div className="flex items-center justify-between flex-wrap gap-4 py-3 px-4 bg-white shadow rounded-xl border border-gray-100 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-primary">Your Performance</h3>
        <p className="text-sm text-gray-500">
          Based on your assignment scores, here's your current badge.
        </p>
      </div>

      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-full ${badge.bg}`}
      >
        <badge.Icon className={`w-5 h-5 ${badge.color}`} />
        <span className={`text-sm font-semibold ${badge.color}`}>
          {badge.label}
        </span>
      </div>
    </div>
  );
};

const AssignmentPerformanceChart = ({ data }) => {
  const average =
    data.reduce((sum, item) => sum + item.marks, 0) / data.length || 0;

  const motivation =
    average >= 85
      ? "Outstanding work! 🎉 Keep dominating!"
      : average >= 70
      ? "Great job! You're improving fast 💪"
      : average >= 50
      ? "You're doing well! Let's push a bit harder! 🚀"
      : "Don't worry — every star shines with practice! 🌟";

  return (
    <motion.div
      className="w-full bg-white rounded-2xl shadow-md p-6 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 80 }}
    >
      <StudentPerformanceBadge average={average} />

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-primary flex items-center gap-2">
          <Sparkles className="text-yellow-400" /> Your Assignment Progress
        </h2>
        <p className="text-sm text-gray-500">Average: {average.toFixed(1)}%</p>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="title" fontSize={12} />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Bar
            dataKey="marks"
            fill="#4DB6AC"
            radius={[8, 8, 0, 0]}
            animationDuration={800}
          >
            <LabelList
              dataKey="marks"
              position="top"
              style={{ fill: "#333", fontWeight: "bold", fontSize: 12 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <motion.p
        className="text-center text-lg font-medium text-gray-700"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {motivation}
      </motion.p>
    </motion.div>
  );
};

export default AssignmentPerformanceChart;
