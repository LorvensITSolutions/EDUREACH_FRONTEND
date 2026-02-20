import {
  ClipboardList,
  BookOpenCheck,
  UserCircle,
  LibraryBig,
  BookKey,
    History,
  Calendar as CalendarIcon,
  Clock,
  Globe,
  Settings,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

const ParentSidebar = ({ activeTab, setActiveTab }) => {
  const { t, i18n } = useTranslation();
  
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'te', name: 'తెలుగు', flag: '🇮🇳' }
  ];

  const changeLanguage = (languageCode) => {
    i18n.changeLanguage(languageCode);
  };
  const menuItems = [
    { id: "attendance", label: t("menu.parent.studentAttendance"), icon: ClipboardList },
    { id: "assignments", label: t("menu.parent.studentAssignments"), icon: BookOpenCheck },
    { id: "teachers", label: t("menu.parent.classTeachers"), icon: UserCircle },
    { id: "timetable", label: "Class Timetable", icon: Clock },
    { id: "Payment Dashboard", label: t("menu.parent.paymentDashboard"), icon: LibraryBig },
    { id: "leaves", label: t("menu.parent.leaveDashboard"), icon: BookKey },
   // { id: "paymentHistory", label: t("menu.parent.paymentHistory"), icon: History },
    { id: "calendar", label: t("menu.parent.calendar"), icon: CalendarIcon },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex flex-col gap-1 h-full relative z-10">
      {/* Compact Desktop Header */}
      <div className="hidden lg:block mb-4">
        <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-1">
          {t('panels.parent')}
        </h2>
        <p className="text-xs text-gray-600">Dashboard</p>
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
        {/* Language Switcher */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <Globe size={14} className="text-gray-500" />
            <span className="text-xs font-medium text-gray-600">Language</span>
          </div>
          <div className="flex gap-1">
            {languages.map((lang) => (
              <motion.button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-all duration-200 ${
                  i18n.language === lang.code
                    ? "bg-primary text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-xs">{lang.flag}</span>
                <span className="hidden sm:inline">{lang.name}</span>
              </motion.button>
            ))}
          </div>
        </div>
        
        <div className="text-xs text-gray-500 text-center">
          <p className="font-medium text-xs">Parent Portal v2.0</p>
        </div>
      </div>
    </div>
  );
};

export default ParentSidebar;
