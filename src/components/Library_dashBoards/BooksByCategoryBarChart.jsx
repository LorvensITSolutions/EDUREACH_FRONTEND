import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Label
} from "recharts";
import axios from "../lib/axios";

const BooksByCategoryBarChart = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = {};
    axios.get("/analytics/books-by-category", { params })
      .then(res => {
        const formatted = res.data.map(item => ({
          category: item._id,
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
          console.error("Books chart error:", err);
        }
        setError("Failed to load chart data");
        setLoading(false);
      });
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto bg-white dark:bg-gray-900 shadow-xl rounded-2xl p-6 sm:p-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-3">
        <h2 className="text-2xl font-bold text-primary dark:text-white animate-slide-up">
          📚 Books By Category
        </h2>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          🎯 Total Books: <span className="text-accent font-bold">{total}</span>
        </p>
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
            <BarChart
              data={data}
              margin={{ top: 10, right: 30, left: 10, bottom: 40 }}
              className="animate-scale-in"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <XAxis
                dataKey="category"
                stroke="#212121"
                tick={{ fontSize: 12 }}
              >
                <Label
                  value="Category"
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
                  value="Book Count"
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
              <Bar
                dataKey="count"
                fill="#8E24AA"
                barSize={45}
                radius={[10, 10, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default BooksByCategoryBarChart;
