// src/pages/TeacherTimetable.jsx
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import useTeacherTimetableStore from "../stores/usePeriodsStore";
import EduReach from "../../assets/edu.svg";

export default function TeacherTimetable() {
  const { teacher, slots, loading, error, fetchTeacherTimetable } =
    useTeacherTimetableStore();

  useEffect(() => {
    fetchTeacherTimetable();
  }, [fetchTeacherTimetable]);

  if (loading)
    return (
      <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6 flex items-center justify-center">
        <p className="text-center text-sm sm:text-base md:text-lg animate-pulse text-primary">
          Loading timetable...
        </p>
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6 flex items-center justify-center">
        <p className="text-center text-sm sm:text-base text-danger font-semibold px-4">Error: {error}</p>
      </div>
    );
  if (!slots || slots.length === 0)
    return (
      <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6 flex items-center justify-center">
        <p className="text-center text-sm sm:text-base text-gray-500 px-4">No timetable found</p>
      </div>
    );

  // Group by day for grid
  const days = [...new Set(slots.map((slot) => slot.day))];
  const periods = Math.max(...slots.map((slot) => slot.period));

  // Framer motion variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };
  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200 } },
  };

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4 md:p-6">
      {/* Header with Logo Only */}
      <div className="flex items-center justify-center mb-3 sm:mb-4 md:mb-6">
        <img
          src={EduReach}
          alt="EduReach Logo"
          className="max-h-16 sm:max-h-20 md:max-h-24 lg:max-h-32 object-contain drop-shadow-md"
        />
      </div>

      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-lg sm:text-xl md:text-2xl font-bold text-center mb-3 sm:mb-4 md:mb-6 text-primary px-2"
      >
        Timetable for <span className="text-accent break-words">{teacher}</span>
      </motion.h2>

      <div className="overflow-x-auto -mx-2 sm:-mx-4 md:mx-0 px-2 sm:px-4 md:px-0">
        <motion.div
          className="grid border rounded-lg shadow-lg bg-white min-w-[600px]"
          style={{
            gridTemplateColumns: `100px repeat(${periods}, minmax(80px, 1fr))`,
          }}
          variants={container}
          initial="hidden"
          animate="show"
        >
          {/* Header Row */}
          <motion.div
            variants={item}
            className="bg-primary-dark text-white font-bold flex items-center justify-center p-2 sm:p-3 text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">Day / Period</span>
            <span className="sm:hidden">Day/P</span>
          </motion.div>
          {Array.from({ length: periods }).map((_, i) => (
            <motion.div
              key={i}
              variants={item}
              className="bg-primary-dark text-white font-bold flex items-center justify-center p-2 sm:p-3 text-xs sm:text-sm"
            >
              {i + 1}
            </motion.div>
          ))}

          {/* Body Rows */}
          {days.map((day) => (
            <React.Fragment key={day}>
              <motion.div
                variants={item}
                className="bg-primary-light font-semibold flex items-center justify-center p-2 sm:p-3 border text-text text-xs sm:text-sm"
              >
                <span className="truncate">{day}</span>
              </motion.div>
              {Array.from({ length: periods }).map((_, i) => {
                const slot = slots.find(
                  (s) => s.day === day && s.period === i + 1
                );

                return (
                  <motion.div
                    key={i}
                    variants={item}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-1.5 sm:p-2 md:p-3 border flex flex-col items-center justify-center rounded-lg transition-colors min-h-[60px] sm:min-h-[70px]
                      ${
                        slot
                          ? "bg-accent-light hover:bg-accent-dark text-primary-dark"
                          : "bg-gray-50 text-gray-400"
                      }
                    `}
                  >
                    {slot ? (
                      <>
                        <p className="font-bold text-xs sm:text-sm text-center break-words leading-tight">{slot.subject}</p>
                        <p className="text-xs text-center break-words mt-0.5">{slot.class}</p>
                      </>
                    ) : (
                      <span className="text-xs sm:text-sm">-</span>
                    )}
                  </motion.div>
                );
              })}
            </React.Fragment>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
