// src/pages/SavedTimetables.jsx
import React, { useEffect, useState, useMemo } from "react";
import axios from "../lib/axios";
import { useTimetableStore } from "../stores/useTimetableStore";
import { motion, useScroll, useTransform } from "framer-motion";
import { Filter, X, BookOpen, Clock, Users } from "lucide-react";
import EduReach from "../../assets/edu.svg";

export default function SavedTimetables() {
  const [savedTimetables, setSavedTimetables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState("");
  const [periodsFilter, setPeriodsFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("class"); // "class" or "teacher"
  const { deleteTimetable, exportTimetable } = useTimetableStore();

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, 50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -50]);

  useEffect(() => {
    const fetchTimetables = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/timetable/all");
        if (res.data.success) setSavedTimetables(res.data.timetables);
      } finally {
        setLoading(false);
      }
    };
    fetchTimetables();
  }, []);

  // Get unique classes for dropdown
  const uniqueClasses = useMemo(() => {
    const classes = new Set();
    savedTimetables.forEach((tt) => {
      tt.classes.forEach((cls) => classes.add(cls.name));
    });
    return Array.from(classes).sort();
  }, [savedTimetables]);

  // Get unique periods per day for dropdown
  const uniquePeriods = useMemo(() => {
    const periods = new Set();
    savedTimetables.forEach((tt) => {
      if (tt.periodsPerDay) periods.add(tt.periodsPerDay);
    });
    return Array.from(periods).sort((a, b) => a - b);
  }, [savedTimetables]);

  // Filtering logic - MUST be defined before teacherTimetables
  const filteredTimetables = useMemo(() => {
    return savedTimetables.filter((tt) => {
      // Class filter
      if (selectedClass) {
        const hasClass = tt.classes.some((cls) => cls.name === selectedClass);
        if (!hasClass) return false;
      }

      // Periods filter
      if (periodsFilter) {
        if (tt.periodsPerDay !== parseInt(periodsFilter)) return false;
      }

      return true;
    });
  }, [savedTimetables, selectedClass, periodsFilter]);

  // Get unique teachers from all timetables
  const uniqueTeachers = useMemo(() => {
    const teachers = new Set();
    savedTimetables.forEach((tt) => {
      tt.classes.forEach((cls) => {
        if (cls.timetable) {
          Object.values(cls.timetable).forEach((daySlots) => {
            if (Array.isArray(daySlots)) {
              daySlots.forEach((slot) => {
                if (slot && slot.teacher) {
                  teachers.add(slot.teacher);
                }
              });
            }
          });
        }
      });
    });
    return Array.from(teachers).sort();
  }, [savedTimetables]);

  // Generate teacher timetables from class timetables
  const teacherTimetables = useMemo(() => {
    const teacherSchedules = {};
    
    filteredTimetables.forEach((tt) => {
      tt.classes.forEach((cls) => {
        if (cls.timetable) {
          Object.entries(cls.timetable).forEach(([day, daySlots]) => {
            if (Array.isArray(daySlots)) {
              daySlots.forEach((slot, periodIndex) => {
                if (slot && slot.teacher) {
                  const teacherName = slot.teacher;
                  if (!teacherSchedules[teacherName]) {
                    teacherSchedules[teacherName] = {
                      teacher: teacherName,
                      timetable: {},
                      classes: new Set(),
                    };
                  }
                  if (!teacherSchedules[teacherName].timetable[day]) {
                    teacherSchedules[teacherName].timetable[day] = Array(tt.periodsPerDay).fill(null);
                  }
                  teacherSchedules[teacherName].timetable[day][periodIndex] = {
                    subject: slot.subject,
                    className: cls.name,
                  };
                  teacherSchedules[teacherName].classes.add(cls.name);
                }
              });
            }
          });
        }
      });
    });

    return Object.values(teacherSchedules).map((schedule) => ({
      ...schedule,
      classes: Array.from(schedule.classes),
      periodsPerDay: filteredTimetables[0]?.periodsPerDay || 8,
      days: filteredTimetables[0]?.days || [],
    }));
  }, [filteredTimetables]);

  // Clear all filters
  const clearFilters = () => {
    setSelectedClass("");
    setPeriodsFilter("");
  };

  // Check if any filter is active
  const hasActiveFilters = selectedClass || periodsFilter;

  const handleDelete = async (id) => {
    await deleteTimetable(id);
    setSavedTimetables((prev) => prev.filter((tt) => tt._id !== id));
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Parallax Background Elements */}
      <motion.div
        style={{ y: y1 }}
        className="absolute top-0 left-0 w-64 h-64 bg-primary-light rounded-full opacity-20 blur-3xl"
      />
      <motion.div
        style={{ y: y2 }}
        className="absolute bottom-0 right-0 w-72 h-72 bg-accent-light rounded-full opacity-20 blur-3xl"
      />

      <div className="relative p-2 sm:p-4 md:p-6 max-w-6xl mx-auto">
 <motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, ease: "easeOut" }}
  className="flex justify-center mb-4 sm:mb-5 md:mb-6"
>
  <img
    src={EduReach}  // <-- put your logo file in public/ and use correct name
    alt="EduReach Logo"
    className="h-12 sm:h-16 md:h-20 object-contain drop-shadow-lg"
  />
</motion.div>

        {/* Enhanced Filters */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-8 border border-gray-200"
        >
          {/* Filter Toggle Button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm sm:text-base"
            >
              <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="font-medium">Advanced Filters</span>
              {hasActiveFilters && (
                <span className="bg-primary text-white text-xs px-1.5 sm:px-2 py-0.5 rounded-full">
                  {[selectedClass, periodsFilter].filter(Boolean).length}
                </span>
              )}
            </button>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm sm:text-base"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Clear All</span>
              </button>
            )}
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-gray-200"
            >
              {/* Class Filter */}
              <div>
                <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                  Class
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
                >
                  <option value="">All Classes</option>
                  {uniqueClasses.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>

              {/* Periods Filter */}
              <div>
                <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                  Periods/Day
                </label>
                <select
                  value={periodsFilter}
                  onChange={(e) => setPeriodsFilter(e.target.value)}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
                >
                  <option value="">All Periods</option>
                  {uniquePeriods.map((period) => (
                    <option key={period} value={period}>
                      {period} Periods
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
              <span className="text-xs sm:text-sm text-gray-600 font-medium w-full sm:w-auto">Active Filters:</span>
              {selectedClass && (
                <span className="px-2 sm:px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs sm:text-sm flex items-center gap-1">
                  Class: {selectedClass}
                  <button onClick={() => setSelectedClass("")} className="ml-1 hover:text-green-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {periodsFilter && (
                <span className="px-2 sm:px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs sm:text-sm flex items-center gap-1">
                  Periods: {periodsFilter}
                  <button onClick={() => setPeriodsFilter("")} className="ml-1 hover:text-orange-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Results Count */}
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
            <p className="text-xs sm:text-sm text-gray-600">
              Showing <span className="font-semibold text-primary">
                {viewMode === "class" ? filteredTimetables.length : teacherTimetables.length}
              </span> of{" "}
              <span className="font-semibold">
                {viewMode === "class" ? savedTimetables.length : uniqueTeachers.length}
              </span> {viewMode === "class" ? "timetables" : "teachers"}
            </p>
          </div>
        </motion.div>

        {/* View Mode Toggle */}
        <div className="flex justify-center mb-4 sm:mb-5 md:mb-6">
          <div className="bg-white rounded-lg shadow-md p-1 inline-flex border border-gray-200 w-full sm:w-auto">
            <button
              onClick={() => setViewMode("class")}
              className={`flex-1 sm:flex-none px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-md transition-colors flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base ${
                viewMode === "class"
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Class Timetables</span>
              <span className="sm:hidden">Class</span>
            </button>
            <button
              onClick={() => setViewMode("teacher")}
              className={`flex-1 sm:flex-none px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-md transition-colors flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base ${
                viewMode === "teacher"
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Teacher Timetables</span>
              <span className="sm:hidden">Teacher</span>
            </button>
          </div>
        </div>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-primary animate-pulse text-sm sm:text-base"
          >
            Loading timetables...
          </motion.div>
        )}

        {!loading && viewMode === "class" && filteredTimetables.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-500 text-sm sm:text-base"
          >
            No timetables found.
          </motion.div>
        )}

        {!loading && viewMode === "teacher" && teacherTimetables.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-500 text-sm sm:text-base"
          >
            No teacher timetables found.
          </motion.div>
        )}

        {/* Class Timetable Cards */}
        {viewMode === "class" && (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.15 },
              },
            }}
            className="space-y-6 sm:space-y-8 md:space-y-10"
          >
            {filteredTimetables.map((tt, idx) => (
            <motion.div
              key={tt._id || idx}
              variants={{
                hidden: { opacity: 0, y: 30 },
                show: { opacity: 1, y: 0 },
              }}
              whileHover={{ scale: 1.02 }}
              className="p-3 sm:p-4 md:p-6 border rounded-lg sm:rounded-xl bg-white shadow-lg relative overflow-hidden"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-3 sm:mb-4">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-primary-dark">
                  Created: {new Date(tt.createdAt).toLocaleString()}
                </h3>
                <div className="flex flex-wrap gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => exportTimetable(tt._id, "pdf")}
                    className="bg-red-500 text-white px-2 sm:px-3 py-1 rounded-lg shadow hover:bg-red-600 transition-colors text-xs sm:text-sm"
                  >
                    PDF
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => exportTimetable(tt._id, "excel")}
                    className="bg-green-500 text-white px-2 sm:px-3 py-1 rounded-lg shadow hover:bg-green-600 transition-colors text-xs sm:text-sm"
                  >
                    Excel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(tt._id)}
                    className="bg-danger text-white px-3 sm:px-4 py-1 sm:py-2 rounded-lg shadow hover:bg-red-700 transition-colors text-xs sm:text-sm"
                  >
                    Delete
                  </motion.button>
                </div>
              </div>

              {/* Classes - Filter to show only selected class if filter is active */}
              {tt.classes
                .filter((cls) => !selectedClass || cls.name === selectedClass)
                .map((cls, cidx) => (
                <div key={cidx} className="mb-4 sm:mb-5 md:mb-6">
                  <h4 className="font-bold mb-2 text-accent-dark text-sm sm:text-base md:text-lg">
                    Class: {cls.name}
                  </h4>
                  <div className="overflow-x-auto -mx-2 sm:mx-0">
                    <table className="min-w-full border border-gray-300 rounded-lg shadow">
                      <thead>
                        <tr className="bg-primary text-white">
                          <th className="border px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm">Day / Period</th>
                          {Array.from({ length: tt.periodsPerDay }).map(
                            (_, pIdx) => (
                              <th key={pIdx} className="border px-1 sm:px-2 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm">
                                {pIdx + 1}
                              </th>
                            )
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {tt.days.map((day, dIdx) => (
                          <tr
                            key={dIdx}
                            className={
                              dIdx % 2 === 0 ? "bg-gray-50" : "bg-white"
                            }
                          >
                            <td className="border px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 font-medium text-xs sm:text-sm">
                              {day}
                            </td>
                            {Array.from({ length: tt.periodsPerDay }).map(
                              (_, pIdx) => {
                                const slot = cls.timetable?.[day]?.[pIdx] || null;
                                return (
                                  <td
                                    key={pIdx}
                                    className="border px-1 sm:px-2 md:px-4 py-1 sm:py-1.5 md:py-2 text-center"
                                  >
                                    {slot ? (
                                      <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        className="flex flex-col items-center"
                                      >
                                        <div className="font-semibold text-primary text-xs sm:text-sm">
                                          {slot.subject}
                                        </div>
                                        <div className="text-xs text-gray-600">
                                          {slot.teacher}
                                        </div>
                                      </motion.div>
                                    ) : (
                                      <span className="text-gray-400 text-xs">-</span>
                                    )}
                                  </td>
                                );
                              }
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </motion.div>
          ))}
          </motion.div>
        )}

        {/* Teacher Timetable Cards */}
        {viewMode === "teacher" && (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.15 },
              },
            }}
            className="space-y-6 sm:space-y-8 md:space-y-10"
          >
            {teacherTimetables.map((teacherTT, idx) => (
              <motion.div
                key={`teacher-${teacherTT.teacher}-${idx}`}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  show: { opacity: 1, y: 0 },
                }}
                whileHover={{ scale: 1.02 }}
                className="p-3 sm:p-4 md:p-6 border rounded-lg sm:rounded-xl bg-white shadow-lg relative overflow-hidden"
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base md:text-lg font-semibold text-primary-dark flex items-center gap-1.5 sm:gap-2">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      <span className="truncate">Teacher: {teacherTT.teacher}</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1 break-words">
                      Classes: {teacherTT.classes.join(", ")}
                    </p>
                  </div>
                </div>

                {/* Teacher Timetable */}
                <div className="overflow-x-auto -mx-2 sm:mx-0">
                  <table className="min-w-full border border-gray-300 rounded-lg shadow">
                    <thead>
                      <tr className="bg-teal-600 text-white">
                        <th className="border px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm">Day / Period</th>
                        {Array.from({ length: teacherTT.periodsPerDay }).map(
                          (_, pIdx) => (
                            <th key={pIdx} className="border px-1 sm:px-2 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm">
                              {pIdx + 1}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {teacherTT.days.map((day, dIdx) => (
                        <tr
                          key={dIdx}
                          className={
                            dIdx % 2 === 0 ? "bg-gray-50" : "bg-white"
                          }
                        >
                          <td className="border px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 font-medium text-xs sm:text-sm">
                            {day}
                          </td>
                          {Array.from({ length: teacherTT.periodsPerDay }).map(
                            (_, pIdx) => {
                              const slot = teacherTT.timetable[day]?.[pIdx] || null;
                              return (
                                <td
                                  key={pIdx}
                                  className="border px-1 sm:px-2 md:px-4 py-1 sm:py-1.5 md:py-2 text-center"
                                >
                                  {slot ? (
                                    <motion.div
                                      whileHover={{ scale: 1.05 }}
                                      className="flex flex-col items-center"
                                    >
                                      <div className="font-semibold text-teal-600 text-xs sm:text-sm">
                                        {slot.subject}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {slot.className}
                                      </div>
                                    </motion.div>
                                  ) : (
                                    <span className="text-gray-400 text-xs">-</span>
                                  )}
                                </td>
                              );
                            }
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
