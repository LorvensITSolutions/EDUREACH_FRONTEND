// src/components/Parents/ParentTimetable.jsx
import { useState, useEffect } from "react";
import axios from "../lib/axios";
import { Calendar, Clock, BookOpen, User, Loader2, Users } from "lucide-react";
import { motion } from "framer-motion";

const ParentTimetable = () => {
  const [timetableData, setTimetableData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedChild, setSelectedChild] = useState(null);

  useEffect(() => {
    const fetchTimetables = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get("/timetable/parents-timetable");
        if (res.data.success) {
          setTimetableData(res.data);
          // Auto-select first child if available
          if (res.data.children && res.data.children.length > 0) {
            setSelectedChild(res.data.children[0]);
          }
        } else {
          setError(res.data.message || "Failed to fetch timetables");
        }
      } catch (err) {
        console.error("Timetable fetch error:", err);
        if (err.response?.status === 404) {
          setError(err.response?.data?.message || "No timetables found");
        } else {
          setError(err.response?.data?.error || "Failed to load timetables");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTimetables();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-gray-600">Loading timetables...</p>
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
            Timetables Not Available
          </h3>
          <p className="text-gray-600">
            {error || "Timetables are not available at the moment"}
          </p>
        </div>
      </div>
    );
  }

  const { children, days, periodsPerDay } = timetableData;

  if (!children || children.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-8 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-blue-500" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No Children Found
          </h3>
          <p className="text-gray-600">
            No children are associated with your account.
          </p>
        </div>
      </div>
    );
  }

  // If only one child, auto-select it
  const displayChild = selectedChild || children[0];
  const hasMultipleChildren = children.length > 1;

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Children's Class Timetables
            </h2>
            <p className="text-gray-600 mt-1 flex items-center gap-2">
              <Users className="w-4 h-4" />
              {children.length} {children.length === 1 ? "Child" : "Children"}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{periodsPerDay} periods per day</span>
          </div>
        </div>

        {/* Child Selector (if multiple children) */}
        {hasMultipleChildren && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Child:
            </label>
            <select
              value={displayChild?.studentId || ""}
              onChange={(e) => {
                const child = children.find(c => c.studentId === e.target.value);
                setSelectedChild(child);
              }}
              className="w-full sm:w-auto px-4 py-2 border-2 border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-gray-700 font-medium"
            >
              {children.map((child) => (
                <option key={child.studentId || child._id} value={child.studentId || child._id}>
                  {child.studentName} - Class {child.class}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Timetable Display */}
      {displayChild && (
        <div>
          <div className="mb-4 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
            <h3 className="text-lg font-semibold text-primary flex items-center gap-2 mb-1">
              <BookOpen className="w-5 h-5" />
              {displayChild.studentName}
            </h3>
            <p className="text-sm text-gray-600">
              Class: {displayChild.class} | Student ID: {displayChild.studentIdNumber || "N/A"}
            </p>
          </div>

          {displayChild.hasTimetable ? (
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
                          const slot = displayChild.timetable?.[day]?.[pIdx] || null;
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
          ) : (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-8 text-center">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Timetable Not Available
              </h3>
              <p className="text-gray-600">
                {displayChild.message || `Timetable is not created yet for ${displayChild.studentName}'s class (${displayChild.class})`}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Show other children's status if multiple */}
      {hasMultipleChildren && children.length > 1 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Other Children:</h4>
          <div className="space-y-2">
            {children
              .filter(c => (c.studentId || c._id) !== (displayChild?.studentId || displayChild?._id))
              .map((child) => (
                <div
                  key={child.studentId || child._id}
                  className="flex items-center justify-between p-2 bg-white rounded border border-gray-200"
                >
                  <div>
                    <span className="font-medium text-gray-800">{child.studentName}</span>
                    <span className="text-sm text-gray-600 ml-2">- Class {child.class}</span>
                  </div>
                  <button
                    onClick={() => setSelectedChild(child)}
                    className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary-dark transition-colors"
                  >
                    View
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentTimetable;

