import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Label
} from "recharts";
import axios from "./lib/axios";

const MonthlyAdmissionsChart = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const query = year ? `?year=${year}` : '';
    axios.get(`/analytics/admissions-by-month${query}`)
      .then(res => {
        const formatted = res.data.map(item => ({
          month: item._id,
          count: item.count
        }));
        const totalCount = formatted.reduce((acc, curr) => acc + curr.count, 0);
        setData(formatted);
        setTotal(totalCount);
        setLoading(false);
      })
      .catch(err => {
        // Don't log 401/403 errors as they're expected for unauthenticated users
        if (err.response?.status !== 401 && err.response?.status !== 403) {
          console.error("Admissions chart error:", err);
        }
        setError("Failed to load chart data");
        setLoading(false);
      });
  }, [year]);

  return (
    <div className="w-full max-w-5xl mx-auto bg-white dark:bg-gray-900 shadow-xl rounded-2xl p-6 sm:p-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-3">
        <h2 className="text-2xl font-bold text-primary dark:text-white animate-slide-up">
          📈 Monthly Admissions
        </h2>
        <div className="flex items-center gap-3">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            🎯 Total: <span className="text-accent font-bold">{total}</span>
          </p>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-md px-3 py-1.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-white focus:outline-none"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <p className="text-center text-gray-500 dark:text-gray-400">Loading chart...</p>
      )}
      {error && (
        <p className="text-center text-red-500">{error}</p>
      )}

      {!loading && !error && (
        <div className="h-[300px] sm:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 30, left: 10, bottom: 40 }}
              className="animate-scale-in"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <XAxis
                dataKey="month"
                stroke="#212121"
                tick={{ fontSize: 12 }}
              >
                <Label
                  value="Month"
                  position="bottom"
                  offset={10}
                  style={{ fill: "#212121", fontSize: 14 }}
                />
              </XAxis>
              <YAxis
                allowDecimals={false}
                stroke="#212121"
                tick={{ fontSize: 12 }}
              >
                <Label
                  value="Admissions"
                  angle={-90}
                  position="insideLeft"
                  style={{ fill: "#212121", fontSize: 14 }}
                />
              </YAxis>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "10px",
                  border: "1px solid #ccc",
                  fontSize: "14px",
                }}
                cursor={{ fill: "#fbc02d33" }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#00796B"
                strokeWidth={3}
                dot={{ fill: "#00796B", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#00796B", strokeWidth: 2, fill: "#fff" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default MonthlyAdmissionsChart;
