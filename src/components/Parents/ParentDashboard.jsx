import { useState, useEffect, lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Menu, X } from "lucide-react";
import ParentSidebar from "../ParentSidebar";
import ParentStudentAttendance from "./ParentStudentAttendance";
import{ ParentAssignmentsPage } from "./ParentAssignmentsPage";
import ParentClassTeachersPage from "./ParentClassTeachersPage";
import ParentTimetable from "./ParentTimetable";
import LeaveDashboard from "./leaves/LeaveDashboard";
import Payment from "../Pages/Fee_payments/ParentFeePage";
//import ParentPaymentHistoryPage from "../Pages/Fee_payments/ParentPaymentHistoryPage";
import SchoolCalendar from "../calendar";

const SecuritySettings = lazy(() =>
  import("../admin/SecuritySettings").then((m) => ({
    default: m.default,
  }))
);

const ParentDashboard = () => {
  const [activeTab, setActiveTab] = useState("attendance");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useTranslation();

  // Close sidebar when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarOpen && window.innerWidth < 1024) {
        const sidebar = document.getElementById('parent-sidebar');
        const menuButton = document.getElementById('menu-button');
        if (sidebar && !sidebar.contains(event.target) && !menuButton?.contains(event.target)) {
          setSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

  const renderContent = () => {
    switch (activeTab) {
      case "attendance":
        return <ParentStudentAttendance />;
      case "assignments":
        return <ParentAssignmentsPage />;
      case "teachers":
        return <ParentClassTeachersPage />;
      case "timetable":
        return <ParentTimetable />;
      case "leaves":
        return <LeaveDashboard />;
      case "Payment Dashboard":
        return <Payment />;
    //  case "paymentHistory":
        //return <ParentPaymentHistoryPage />;
      case "calendar":
        return <SchoolCalendar readOnly={true} />;
      case "settings":
        return (
          <div className="space-y-6 max-w-4xl">
            <Suspense fallback={
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="relative inline-block mb-8">
                    <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  </div>
                  <h3 className="text-2xl font-bold text-primary mb-4">Loading Security Settings...</h3>
                </div>
              </div>
            }>
              <SecuritySettings />
            </Suspense>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      {/* Enhanced Mobile Header */}
      <div className="flex items-center justify-between p-4 sm:p-5 bg-white/95 backdrop-blur-md shadow-lg lg:hidden sticky top-0 z-50 border-b border-gray-200/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {t('panels.parent')}
          </h2>
        </div>
        <button
          id="menu-button"
          className="text-primary hover:text-accent focus:outline-none focus:ring-2 focus:ring-primary/20 p-2.5 rounded-xl transition-all duration-200 hover:bg-primary/10 active:scale-95"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Fixed Sidebar - Always Fixed Position */}
      <div
        id="parent-sidebar"
        className={`fixed top-0 left-0 bottom-0 z-40 transform transition-all duration-300 ease-in-out bg-white/95 backdrop-blur-xl shadow-2xl w-64 sm:w-72 p-3 lg:translate-x-0 lg:w-56 xl:w-64 lg:shadow-xl lg:bg-white/90 lg:z-10 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Compact Mobile sidebar header */}
        <div className="flex items-center justify-between mb-4 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t('panels.parent')}
            </h2>
          </div>
          <button
            className="text-gray-500 hover:text-gray-700 focus:outline-none p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <ParentSidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setSidebarOpen(false); // close on mobile
          }}
        />
      </div>

      {/* Enhanced Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Enhanced Main content with Fixed Sidebar Offset */}
      <main className="p-4 sm:p-5 lg:p-6 xl:p-8 overflow-x-hidden relative z-10 lg:ml-56 xl:ml-64">
        <div className="w-full max-w-8xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default ParentDashboard;
