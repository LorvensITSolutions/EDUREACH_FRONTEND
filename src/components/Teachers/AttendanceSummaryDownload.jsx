// src/components/Attendance/AttendanceSummaryDownload.jsx
import React, { useState } from "react";
import { useAttendanceSummaryStore } from "../stores/useAttendanceSummaryStore";

export const AttendanceSummaryDownload = () => {
  const [month, setMonth] = useState("07");
  const [year, setYear] = useState("2025");
  const [filter, setFilter] = useState("month");

  const { downloadSummary, loading } = useAttendanceSummaryStore();

  const handleDownload = async () => {
    await downloadSummary({ month, year, filter });
  };

  return (
    <div className="bg-white p-4 shadow rounded-md space-y-4 dark:bg-gray-900">
      <h2 className="text-xl font-bold text-primary">Download Attendance Summary</h2>

      <div className="flex flex-wrap gap-4 items-center">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="month">Monthly</option>
          <option value="week">First Week</option>
        </select>

        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={String(i + 1).padStart(2, "0")}>
              {new Date(0, i).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>

        <input
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="border px-3 py-2 rounded w-24"
          placeholder="Year"
        />

        <button
          onClick={handleDownload}
          disabled={loading}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-light disabled:opacity-60"
        >
          {loading ? "Downloading..." : "Download"}
        </button>
      </div>
    </div>
  );
};
