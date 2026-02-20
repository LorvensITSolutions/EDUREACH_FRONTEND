import { motion } from "framer-motion";
import { 
  BookOpenCheck, 
  ClipboardList, 
  UserCircle, 
  Library, 
  Calendar as CalendarIcon, 
  User,
  GraduationCap,
  Settings,
  Clock
} from "lucide-react";

const StudentSidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: "profile", label: "My Profile", icon: User },
    { id: "attendance", label: "My Attendance", icon: ClipboardList },
    { id: "assignments", label: "Assignments", icon: BookOpenCheck },
    { id: "timetable", label: "Class Timetable", icon: Clock },
    { id: "teacher", label: "Class Teacher", icon: UserCircle },
    { id: "lms", label: "LMS Status", icon: Library },
    { id: "calendar", label: "School Calendar", icon: CalendarIcon },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex flex-col gap-1 h-full relative z-10">
      {/* Compact Desktop Header */}
      <div className="hidden lg:block mb-4">
        <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-1">
          Student Portal
        </h2>
        <p className="text-xs text-gray-600">Learning Dashboard</p>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden mb-4 pb-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center shadow-sm">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Student Portal</h2>
            <p className="text-xs text-gray-500">Dashboard</p>
          </div>
        </div>
      </div>

      {/* Compact Navigation */}
      <nav className="flex flex-col gap-1 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {menuItems.map(({ id, label, icon: Icon }, index) => (
          <motion.button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-300 relative overflow-hidden ${
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
            <div className={`relative z-10 p-1.5 rounded-md transition-all duration-300 ${
              activeTab === id 
                ? "bg-white/20 shadow-sm" 
                : "bg-gray-100 group-hover:bg-primary/10 group-hover:shadow-sm"
            }`}>
              <Icon 
                size={16} 
                className={`transition-colors duration-300 ${
                  activeTab === id 
                    ? "text-white" 
                    : "text-gray-600 group-hover:text-primary"
                }`} 
              />
            </div>
            
            {/* Label */}
            <div className="relative z-10 flex-1 min-w-0">
              <span className={`text-xs sm:text-sm font-medium transition-colors duration-300 ${
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
                className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full shadow-sm"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </nav>

      {/* Compact Footer */}
      <div className="mt-4 pt-3 border-t border-gray-200/50">
        <div className="text-xs text-gray-500 text-center">
          <p className="font-medium text-xs">Student Portal v2.0</p>
        </div>
      </div>
    </div>
  );
};

export default StudentSidebar;
