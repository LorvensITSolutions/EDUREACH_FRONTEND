import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import HomePage from './components/Home/HomePage';
import Events from './components/Pages/Events';
import Admissions from './components/Pages/Admissions';
import Announcements from './components/Pages/Announcements';
import AboutPage from './components/Pages/AboutPage';
import HeadmasterMessage from './components/Pages/HeadmasterMessage';
import MissionVision from './components/Pages/MissionVision';
import OriginsHistory from './components/Pages/OriginsHistory';
import WhyDoon from './components/Pages/WhyDoon';
import TeachingStaff from './components/Pages/TeachingStaff';
import Facilities from './components/Pages/Facilities';
import SchoolPolicies from './components/Pages/SchoolPolicies';
import AdministrativeStaff from './components/Pages/AdministrativeStaff';
import Login from "./components/Auth/Login";
import PasswordResetRequest from './components/Auth/PasswordResetRequest';
import PasswordResetForm from './components/Auth/PasswordResetForm';
import ChangePasswordPage from './components/Auth/ChangePasswordPage';
import AdminDashboard from "./components/admin/AdminDashboard";
import AdmissionDetails from './components/admin/AdmissionDetails';
import TeacherDashboard from './components/Teachers/TeacherDashboard';
import StudentDashboard from './components/student_dashboard/StudentDashboard';
import ParentDashboard from './components/Parents/ParentDashboard';
// ParentManagement is now integrated into AdminDashboard
import LibraryDashboard from "./components/admin/Library/LibraryDashboard";
import PaymentSuccessPage from "./components/Pages/Fee_payments/PaymentSuccessPage";
import PaymentFailurePage from "./components/Pages/Fee_payments/PaymentFailurePage";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import { Toaster } from "react-hot-toast";
import { useUserStore } from './components/stores/useUserStore';
// Component to conditionally render header and footer
const AppLayout = ({ children }) => {
  const location = useLocation();
  
  // Dashboard routes that shouldn't show footer
  const dashboardRoutes = [
    '/admin-dashboard',
    '/teacher-dashboard', 
    '/student-dashboard',
    '/parent-dashboard',
    '/library-dashboard'
  ];
  
  const shouldShowFooter = !dashboardRoutes.some(route => 
    location.pathname.startsWith(route)
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      {shouldShowFooter && <Footer />}
    </div>
  );
};

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const checkAuth = useUserStore((s) => s.checkAuth);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user-storage');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser.state && parsedUser.state.user) {
            await checkAuth(); // validate session token
          }
        }
      } catch (error) {
        console.log("Auth check completed");
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Toaster />
      <AppLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<PasswordResetRequest />} />
          <Route path="/reset-password" element={<PasswordResetForm />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
          <Route path="/events" element={<Events />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/about/headmaster" element={<HeadmasterMessage />} />
          <Route path="/about/mission-vision" element={<MissionVision />} />
          <Route path="/about/origins-history" element={<OriginsHistory />} />
          <Route path="/about/why-doon" element={<WhyDoon />} />
          <Route path="/about/teaching-staff" element={<TeachingStaff />} />
          <Route path="/about/facilities" element={<Facilities />} />
          <Route path="/about/school-policies" element={<SchoolPolicies />} />
          <Route path="/about/administrative-staff" element={<AdministrativeStaff />} />
          <Route path="/admissions" element={<Admissions />} />
          <Route path="/announcements" element={<Announcements />} />
          
          {/* ✅ Protected Routes */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          {/* ParentManagement is now integrated into AdminDashboard */}
          <Route
            path="/admin/admissions/:id"
            element={
              <ProtectedRoute role="admin">
                <AdmissionDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher-dashboard"
            element={
              <ProtectedRoute role="teacher">
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student-dashboard"
            element={
              <ProtectedRoute role="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/library-dashboard"
            element={
              <ProtectedRoute role="librarian">
                <LibraryDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent-dashboard"
            element={
              <ProtectedRoute role="parent">
                <ParentDashboard />
              </ProtectedRoute>
            }
          />

          {/* ✅ Payment Result Routes (No auth required) */}
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/payment/failure" element={<PaymentFailurePage />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;
