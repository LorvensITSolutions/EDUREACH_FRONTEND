import { useState, lazy, Suspense, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Sidebar from "../../components/Layout/TeacherSidebar";

// Lazy loaded components
// const AssignedStudents = lazy(() =>
//   import("../Teachers/AssignedStudents").then((m) => ({
//     default: m.AssignedStudents,
//   }))
// );
// const TeacherTimetable = lazy(() =>
//   import("../Teachers/TeacherTimetable").then((m) => ({
//     default: m.TeacherTimetable,
//   }))
// );
const TeacherTimetable = lazy(() => import("../Teachers/TeacherTimetable"));


const MarkAttendance = lazy(() =>
  import("../Teachers/MarkAttendance").then((m) => ({
    default: m.MarkAttendance,
  }))
);
const TeacherAnalyticsDashboard = lazy(() =>
  import("../Teachers/TeacherAnalyticsDashboard").then((m) => ({
    default: m.TeacherAnalyticsDashboard,
  }))
);
const TeacherAttendance = lazy(() =>
  import("../Teachers/TeacherAttendanceView").then((m) => ({
    default: m.default,
  }))
);
const TeacherAttendanceView = lazy(() =>
  import("../Teachers/TeacherAttendanceView").then((m) => ({
    default: m.default,
  }))
);
const AttendanceSummaryDownload = lazy(() =>
  import("../Teachers/AttendanceSummaryDownload").then((m) => ({
    default: m.AttendanceSummaryDownload,
  }))
);
const UploadAssignment = lazy(() =>
  import("../Teachers/Create_view_assignment").then((m) => ({
    default: m.default,
  }))
);
const AssignmentSubmissionsView = lazy(() =>
  import("../Teachers/AssignmentSubmissionsView").then((m) => ({
    default: m.default,
  }))
);

const LibraryDashboard = lazy(() =>
  import("../Library_s_t/Library_dashboard_s_t").then((m) => ({
    default: m.default,
  }))
);

const LeaveReviewTable = lazy(() =>
  import("../Parents/leaves/LeaveReviewTable").then((m) => ({
    default: m.default,
  }))
);
const SchoolCalendar = lazy(() =>
  import("../calendar").then((m) => ({
    default: m.default,
  }))
);
const SecuritySettings = lazy(() =>
  import("../admin/SecuritySettings").then((m) => ({
    default: m.default,
  }))
);

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState("analytics");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        const sidebar = document.getElementById('teacher-sidebar');
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
      // case "students":
      //   return <AssignedStudents />;
      case "analytics":
        return <TeacherAnalyticsDashboard />;
      case "teacherAttendance":
        return <TeacherAttendanceView />;
      case "attendance":
        return <MarkAttendance />;
      case "download":
        return <AttendanceSummaryDownload />;
      case "uploadAssignment":
        return <UploadAssignment />;
      case "assignmentSubmissions":
        return <AssignmentSubmissionsView />;
     
      case "LibraryDashboard":
        return <LibraryDashboard />;

      case "LeaveReviewTable":
        return <LeaveReviewTable />;
      case "TeacherTimetable":
        return <TeacherTimetable teacherName="Asha Mehta"/>;
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
        return <TeacherAnalyticsDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      {/* Enhanced Mobile Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 md:p-5 bg-white/95 backdrop-blur-md shadow-lg lg:hidden sticky top-0 z-40 border-b border-gray-200/50">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xs sm:text-sm">T</span>
          </div>
          <h2 className="text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent truncate">
            Teacher Panel
          </h2>
        </div>
        <button
          id="menu-button"
          className="text-primary hover:text-accent focus:outline-none focus:ring-2 focus:ring-primary/20 p-2 sm:p-2.5 rounded-xl transition-all duration-200 hover:bg-primary/10 active:scale-95 flex-shrink-0"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <X size={20} className="sm:w-5 sm:h-5" /> : <Menu size={20} className="sm:w-5 sm:h-5" />}
        </button>
      </div>

      {/* Fixed Sidebar - Always Fixed Position - Higher z-index when open on mobile */}
      <div
        id="teacher-sidebar"
        className={`fixed top-0 left-0 bottom-0 transform transition-all duration-300 ease-in-out bg-white/95 backdrop-blur-xl shadow-2xl w-64 sm:w-72 p-2 sm:p-3 lg:translate-x-0 lg:w-56 xl:w-64 lg:shadow-xl lg:bg-white/90 ${
          sidebarOpen 
            ? "translate-x-0 z-50" 
            : "-translate-x-full lg:translate-x-0 z-10"
        }`}
      >
        {/* Compact Mobile sidebar header */}
        <div className="flex items-center justify-between mb-3 sm:mb-4 lg:hidden pt-2 sm:pt-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xs sm:text-sm">T</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent truncate">
              Teacher Panel
            </h2>
          </div>
          <button
            className="text-gray-500 hover:text-gray-700 focus:outline-none p-1.5 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        <Sidebar
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Enhanced Main content with Fixed Sidebar Offset */}
      <main className="p-2 sm:p-3 md:p-4 lg:p-6 xl:p-8 overflow-x-hidden relative z-10 lg:ml-56 xl:ml-64">
        <div className="w-full max-w-8xl mx-auto">
          <Suspense fallback={
            <div className="flex items-center justify-center py-12 sm:py-16 md:py-20">
              <div className="text-center">
                <div className="relative inline-block mb-6 sm:mb-8">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  <div className="absolute inset-0 w-16 h-16 sm:w-20 sm:h-20 border-4 border-accent/20 border-t-accent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-primary mb-3 sm:mb-4">Loading...</h3>
                <p className="text-sm sm:text-base md:text-lg text-gray-600">Please wait while we load the content</p>
              </div>
            </div>
          }>
            {renderContent()}
          </Suspense>
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
