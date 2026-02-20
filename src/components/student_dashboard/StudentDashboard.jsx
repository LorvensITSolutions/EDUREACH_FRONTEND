import { useState, lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Menu } from "lucide-react";
import StudentSidebar from "../../components/Layout/StudentSidebar";

const MyAttendance = lazy(() => import("../students/StudentAttendance"));
const MyAssignments = lazy(() => import("../students/student_assignments/StudentAssignmentsPage"));
const StudentTimetable = lazy(() => import("../students/StudentTimetable"));
const MyTeacherDetails = lazy(() => import("../students/ClassTeachersPage"));
const LibraryDashboard = lazy(() => import("../Library_s_t/Library_dashboard_s_t"));
const SchoolCalendar = lazy(() => import("../calendar"));
const StudentProfile = lazy(() => import("../students/StudentProfile"));
const StudentProfileHeader = lazy(() => import("../students/StudentProfileHeader"));
const SecuritySettings = lazy(() =>
  import("../admin/SecuritySettings").then((m) => ({
    default: m.default,
  }))
);

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useTranslation();

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <StudentProfile />;
      case "lms":
        return <LibraryDashboard />;
      case "attendance":
        return <MyAttendance />;
      case "assignments":
        return <MyAssignments />;
      case "timetable":
        return <StudentTimetable />;
      case "teacher":
        return <MyTeacherDetails />;
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
        return <StudentProfile />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      {/* Mobile Header */}
      <div className="lg:hidden bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg sticky top-0 z-30">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <h2 className="text-xl font-bold">{t('panels.student')}</h2>
          </div>
          <button
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Fixed Sidebar */}
        <div
          className={`fixed top-0 left-0 bottom-0 z-40 w-72 sm:w-80 lg:w-64 bg-white shadow-2xl lg:translate-x-0 lg:z-10 lg:shadow-xl transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Mobile sidebar header */}
          <div className="lg:hidden flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <h3 className="font-bold text-white">Student Portal</h3>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="h-full overflow-y-auto">
            <StudentSidebar activeTab={activeTab} setActiveTab={(tab) => {
              setActiveTab(tab);
              setSidebarOpen(false); // Close sidebar on mobile
            }} />
          </div>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 min-h-screen">
          {/* Desktop Header - Hidden on mobile */}
          <div className="hidden lg:block bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-20">
            <div className="px-6 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-800">Student Portal</h1>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-3 sm:p-4 lg:p-6">
            {/* Profile Header */}
            <div className="mb-4 sm:mb-6">
              <Suspense fallback={
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 animate-pulse">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-3 sm:h-4 bg-gray-200 rounded w-24 sm:w-32"></div>
                      <div className="h-2 sm:h-3 bg-gray-200 rounded w-20 sm:w-24"></div>
                    </div>
                  </div>
                </div>
              }>
                <StudentProfileHeader />
              </Suspense>
            </div>
            
            {/* Main Content */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 min-h-[400px] sm:min-h-[600px]">
              <Suspense fallback={
                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-center h-48 sm:h-64">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                      <span className="text-gray-600 font-medium text-sm sm:text-base">{t('loading')}</span>
                    </div>
                  </div>
                </div>
              }>
                {renderContent()}
              </Suspense>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
