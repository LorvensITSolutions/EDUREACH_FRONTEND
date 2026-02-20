import { Users, ClipboardCheck, FilePlus2, BookOpen, Library, Download, LeafIcon, Calendar as CalendarIcon, BarChart3, Clock, Globe, Settings } from "lucide-react";
import { motion } from "framer-motion";

const TeacherSidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    // { id: "students", label: "My Students", icon: Users },
    { id: "analytics", label: "Analytics Dashboard", icon: BarChart3 },
    { id: "teacherAttendance", label: "My Attendance", icon: Clock },
    {id: "TeacherTimetable", label: "Timetable", icon: Download },
    { id: "attendance", label: "Attendance", icon: ClipboardCheck },
    { id: "download", label: "Download Summary", icon: Download },
    { id: "uploadAssignment", label: "Add Assignment", icon: FilePlus2 },
    { id: "assignmentSubmissions", label: "Review Submissions", icon: BookOpen },
    { id: "LibraryDashboard", label: "LMS Status", icon: Library },
    { id: "LeaveReviewTable", label: "Leave Review", icon: LeafIcon },
    { id: "calendar", label: "School Calendar", icon: CalendarIcon },
    { id: "settings", label: "Settings", icon: Settings }
  ];

  return (
    <div className="flex flex-col gap-1 h-full relative z-10">
      {/* Compact Desktop Header */}
      <div className="hidden lg:block mb-3 sm:mb-4">
        <h2 className="text-base sm:text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-1">
          Teacher Panel
        </h2>
        <p className="text-xs text-gray-600">Dashboard</p>
      </div>

      {/* Compact Navigation */}
      <nav className="flex flex-col gap-1 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-1">
        {menuItems.map(({ id, label, icon: Icon }, index) => (
          <motion.button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`group flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg text-left transition-all duration-300 relative overflow-hidden ${
              activeTab === id
                ? "bg-gradient-to-r from-primary to-accent text-white shadow-md shadow-primary/20 scale-[1.01]"
                : "text-gray-700 hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 hover:text-primary hover:shadow-sm active:scale-[0.99]"
            }`}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: activeTab === id ? 1.01 : 1.03 }}
            whileTap={{ scale: 0.99 }}
          >
            {/* Icon container */}
            <div className={`relative z-10 p-1 sm:p-1.5 rounded-md transition-all duration-300 flex-shrink-0 ${
              activeTab === id 
                ? "bg-white/20 shadow-sm" 
                : "bg-gray-100 group-hover:bg-primary/10 group-hover:shadow-sm"
            }`}>
              <Icon 
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors duration-300 ${
                  activeTab === id 
                    ? "text-white" 
                    : "text-gray-600 group-hover:text-primary"
                }`} 
              />
            </div>
            
            {/* Label */}
            <div className="relative z-10 flex-1 min-w-0">
              <span className={`text-xs sm:text-sm font-medium transition-colors duration-300 truncate ${
                activeTab === id 
                  ? "text-white" 
                  : "text-gray-700 group-hover:text-primary"
              }`}>
                {label}
              </span>
            </div>

            {/* Active indicator */}
            {activeTab === id && (
              <motion.div
                className="absolute right-1.5 sm:right-2 w-1.5 h-1.5 bg-white rounded-full shadow-sm flex-shrink-0"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </nav>

      {/* Compact Footer */}
      <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-gray-200/50">
        <div className="text-xs text-gray-500 text-center">
          <p className="font-medium text-xs">Teacher Portal v2.0</p>
        </div>
      </div>
    </div>
  );
};

export default TeacherSidebar;
