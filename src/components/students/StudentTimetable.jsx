// src/components/students/StudentTimetable.jsx
import { useState, useEffect } from "react";
import axios from "../lib/axios";
import { Calendar, Clock, BookOpen, User, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const StudentTimetable = () => {
  const [timetableData, setTimetableData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTimetable = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get("/timetable/students-timetable");
        if (res.data.success) {
          setTimetableData(res.data);
        } else {
          setError(res.data.message || "Failed to fetch timetable");
        }
      } catch (err) {
        console.error("Timetable fetch error:", err);
        if (err.response?.status === 404) {
          setError("Timetable is not created yet for your class");
        } else {
          setError(err.response?.data?.message || "Failed to load timetable");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-gray-600">Loading timetable...</p>
        </div>
      </div>
    );
  }

  if (error || !timetableData) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-8 text-center">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Timetable Not Available
          </h3>
          <p className="text-gray-600">
            {error || "Timetable is not created yet for your class"}
          </p>
        </div>
      </div>
    );
  }

  const { class: className, timetable, days, periodsPerDay } = timetableData;

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Class Timetable
            </h2>
            <p className="text-gray-600 mt-1 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Class: {className}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{periodsPerDay} periods per day</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead>
              <tr className="bg-gradient-to-r from-primary to-primary-dark text-white">
                <th className="border px-4 py-3 text-left font-semibold">Day / Period</th>
                {Array.from({ length: periodsPerDay }).map((_, pIdx) => (
                  <th key={pIdx} className="border px-4 py-3 text-center font-semibold">
                    Period {pIdx + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((day, dIdx) => (
                <motion.tr
                  key={dIdx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: dIdx * 0.05 }}
                  className={dIdx % 2 === 0 ? "bg-gray-50" : "bg-white"}
                >
                  <td className="border px-4 py-3 font-semibold text-gray-800">
                    {day}
                  </td>
                  {Array.from({ length: periodsPerDay }).map((_, pIdx) => {
                    const slot = timetable?.[day]?.[pIdx] || null;
                    return (
                      <td
                        key={pIdx}
                        className="border px-4 py-3 text-center"
                      >
                        {slot ? (
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="flex flex-col items-center gap-1 p-2 bg-primary/5 rounded-lg border border-primary/20"
                          >
                            <div className="font-semibold text-primary text-sm">
                              {slot.subject}
                            </div>
                            <div className="text-xs text-gray-600 flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {slot.teacher}
                            </div>
                          </motion.div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    );
                  })}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentTimetable;

