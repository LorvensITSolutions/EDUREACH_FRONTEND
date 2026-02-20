// Updated AdminDashboard.jsx
// Modular, responsive admin layout with lazy-loaded content sections for scalability

import React, { useEffect, useState, lazy, Suspense } from 'react';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useTranslation } from 'react-i18next';
import {
  Users,
  Calendar,
  BookOpen,
  
  GraduationCap,
  MessageSquare,
  Settings,
  BarChart3,
  FileText,
  UserCheck,
  Menu,
  X,
  Home,
  CalendarCheck,
  Clock,
  ClipboardList,
  ArrowRightLeft
} from 'lucide-react';
import { motion } from 'framer-motion';


const DashboardContent = lazy(() => import('../admin/EnhancedDashboard'));
const StudentManagement = lazy(() => import('../students/StudentManagement'));
const EventManagement = lazy(() => import('../admin/EventManagement'));
const AnnouncementManagement = lazy(() => import('../admin/AnnouncementManagement'));
const TeacherManagement = lazy(() => import('../admin/TeacherManagement'));
const TeacherAttendanceManagement = lazy(() => import('../admin/TeacherAttendanceManagement'));
//const LMSSystem = lazy(() => import('../admin/Library/LMSSystem'));
const ParentManagement = lazy(() => import('../../pages/ParentManagement'));
const AdmissionsManagement = lazy(() => import('../admin/AllAdmissions'));
const Library = lazy(() => import('../admin/CreateLibrarian'));
const AdminFeeManagementPage = lazy(() => import('../Pages/Fee_payments/AdminFeeManagementPage'));
// const SettingsPanel = lazy(() => import('./SettingsPanel'));
import TimetableManagement from "../admin/EnhancedTimetablePage"; 
import CalendarComponent from "../../components/calendar";
import ChatbotWidget from "../../components/admin/AdminChatbotWidget";
const SavedTimetables = lazy(() => import('../admin/SavedTimetables'));
const CredentialsManagement = lazy(() => import('./CredentialsManagement'));
const SubjectManager = lazy(() => import('./SubjectManager'));
const SecuritySettings = lazy(() => import('./SecuritySettings'));
const ExamSeatingPage = lazy(() => import('./ExamSeatingPage'));
const StudentPromotionManagement = lazy(() => import('./StudentPromotionManagement'));
// const HolidayManagement = lazy(() => import('./HolidayManagement'));

const AdminDashboard = () => {
  const [activeRoute, setActiveRoute] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useTranslation();
  const [reminderTime, setReminderTime] = useState("");
  const [reminderDays, setReminderDays] = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsStore = useSettingsStore();

  useEffect(() => {
    settingsStore.fetchAllSettings();
  }, []);

  // Handle responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) { // md breakpoint
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Listen for mobile menu clicks from Header
  useEffect(() => {
    const handleDashboardSidebarToggle = () => {
      setSidebarOpen(prev => !prev);
    };

    // Listen for custom event from Header
    window.addEventListener('toggleDashboardSidebar', handleDashboardSidebarToggle);

    return () => {
      window.removeEventListener('toggleDashboardSidebar', handleDashboardSidebarToggle);
    };
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (window.innerWidth < 768 && sidebarOpen) { // md breakpoint
        const sidebar = document.querySelector('.sidebar-container');
        const hamburger = document.querySelector('.hamburger-button');
        
        if (sidebar && !sidebar.contains(event.target) && 
            hamburger && !hamburger.contains(event.target)) {
          setSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

  useEffect(() => {
    if (settingsStore.settings?.feeReminderTime) {
      setReminderTime(settingsStore.settings.feeReminderTime);
    }
    if (Array.isArray(settingsStore.settings?.feeReminderDays)) {
      setReminderDays(settingsStore.settings.feeReminderDays);
    }
  }, [settingsStore.settings]);

  const menuItems = [
    { id: 'dashboard', label: t('menu.admin.dashboard'), icon: Home },
    { id: 'students', label: t('menu.admin.students'), icon: Users },
    { id: 'student-promotion', label: 'Student Promotion', icon: ArrowRightLeft },
    { id: 'teachers', label: t('menu.admin.teachers'), icon: GraduationCap },
    { id: 'teacher-attendance', label: 'Teacher Attendance', icon: Clock },
    { id: 'parent-management', label: t('menu.admin.parents'), icon: UserCheck },
    { id: 'admissions', label: t('menu.admin.admissions'), icon: FileText },
    { id: 'events', label: t('menu.admin.events'), icon: Calendar },
    { id: 'announcements', label: t('menu.admin.announcements'), icon: MessageSquare },
    { id: 'fee-management', label: t('menu.admin.feeManagement'), icon: BookOpen },
    { id: 'timetable', label: "Timetable", icon: Calendar }, // ✅ NEW
    { id: 'saved-timetables', label: "Saved Timetables", icon: Calendar },
    { id: 'exam-seating', label: "Exam Seating", icon: ClipboardList }, // ✅ NEW
    { id: 'subjects', label: "Subject Management", icon: BookOpen }, // ✅ NEW
    {id:"calendar",label:"Calendar",icon:CalendarCheck},
    // { id: 'holidays', label: "Holiday Management", icon: CalendarCheck }, // ✅ NEW
    { id: 'credentials', label: "Credentials", icon: UserCheck }, // ✅ NEW
    { id: 'reports', label: t('menu.admin.library'), icon: BarChart3 },
    { id: 'settings', label: t('menu.admin.settings'), icon: Settings }
  ];

  const renderContent = () => {
    const Fallback = <div className="text-gray-600">{t('loading')}</div>;
    switch (activeRoute) {
      case 'dashboard': return <Suspense fallback={Fallback}><DashboardContent /></Suspense>;
      case 'students': return <Suspense fallback={Fallback}><StudentManagement /></Suspense>;
      case 'student-promotion': return <Suspense fallback={Fallback}><StudentPromotionManagement /></Suspense>;
      case 'events': return <Suspense fallback={Fallback}><EventManagement /></Suspense>;
      case 'announcements': return <Suspense fallback={Fallback}><AnnouncementManagement /></Suspense>;
      case 'teachers': return <Suspense fallback={Fallback}><TeacherManagement /></Suspense>;
      case 'teacher-attendance': return <Suspense fallback={Fallback}><TeacherAttendanceManagement /></Suspense>;
     // case 'lms': return <Suspense fallback={Fallback}><LMSSystem /></Suspense>;
      case 'timetable': 
        return <Suspense fallback={Fallback}><TimetableManagement /></Suspense>;
      case 'saved-timetables':
        return <Suspense fallback={Fallback}><SavedTimetables /></Suspense>;
      case 'exam-seating':
        return <Suspense fallback={Fallback}><ExamSeatingPage /></Suspense>;
      case 'subjects':
        return <Suspense fallback={Fallback}><SubjectManager /></Suspense>;
      case 'parent-management': return <Suspense fallback={Fallback}><ParentManagement /></Suspense>;
      case 'admissions': return <Suspense fallback={Fallback}><AdmissionsManagement /></Suspense>;
      case 'calendar': return <Suspense fallback={Fallback}><CalendarComponent /></Suspense>;
      // case 'holidays': return <Suspense fallback={Fallback}><HolidayManagement /></Suspense>;
      case 'credentials': return <Suspense fallback={Fallback}><CredentialsManagement /></Suspense>;
      case 'reports': return <Suspense fallback={Fallback}><Library/></Suspense>;
      case 'settings':
        return (
          <div className="space-y-6 max-w-4xl">
            {/* Security Settings */}
            <Suspense fallback={<div className="text-gray-600">Loading security settings...</div>}>
              <SecuritySettings />
            </Suspense>

            {/* System Settings */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">System Settings</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Daily Fee Reminder Time (HH:mm)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={reminderTime || ''}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="border rounded-lg px-3 py-2 w-40 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      onClick={() => settingsStore.updateReminderTime(reminderTime || '16:17')}
                      className="bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                      disabled={settingsStore.loading}
                    >
                      {settingsStore.loading ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                  {settingsStore.error && (
                    <p className="text-red-600 text-sm mt-2">{settingsStore.error}</p>
                  )}
                  {settingsStore.settings?.feeReminderTime && (
                    <p className="text-xs text-gray-500 mt-2">Current: {settingsStore.settings.feeReminderTime}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reminder Days (0=Sun ... 6=Sat)</label>
                  <div className="grid grid-cols-7 gap-2 text-sm">
                    {[0,1,2,3,4,5,6].map((d) => (
                      <label key={d} className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={reminderDays.includes(d)}
                          onChange={(e) => {
                            if (e.target.checked) setReminderDays([...new Set([...reminderDays, d])]);
                            else setReminderDays(reminderDays.filter((x) => x !== d));
                          }}
                          className="cursor-pointer"
                        />
                        <span>{d}</span>
                      </label>
                    ))}
                  </div>
                  <button
                    onClick={() => settingsStore.updateReminderDays(reminderDays)}
                    className="mt-3 bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                    disabled={settingsStore.loading}
                  >
                    {settingsStore.loading ? 'Saving...' : 'Save Days'}
                  </button>
                  {Array.isArray(settingsStore.settings?.feeReminderDays) && (
                    <p className="text-xs text-gray-500 mt-2">Current Days: {settingsStore.settings.feeReminderDays.join(', ') || 'Every day'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      case 'fee-management': return <Suspense fallback={Fallback}><AdminFeeManagementPage /></Suspense>;
      default: return <Suspense fallback={Fallback}><DashboardContent /></Suspense>;
    }
  };

  return (
    <>
      {/* Custom styles for responsive behavior */}
      <style jsx>{`
        @media (max-width: 767px) {
          .sidebar-container {
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          }
        }
        
        @media (min-width: 768px) {
          .sidebar-container {
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
        }
        
        .hamburger-button:active {
          transform: scale(0.95);
        }
        
        .sidebar-container {
          backdrop-filter: blur(10px);
        }
        
        /* Ensure hamburger menu is visible on mobile */
        @media (max-width: 767px) {
          .hamburger-button {
            display: block !important;
          }
        }
        
        /* Dashboard layout adjustments for main header */
        .dashboard-container {
          height: calc(100vh - 4rem); /* Subtract header height */
        }
        
        @media (max-width: 767px) {
          .dashboard-container {
            height: calc(100vh - 4rem); /* Account for mobile header */
          }
        }
      `}</style>
      
      <div className="dashboard-container bg-gray-50 flex overflow-hidden relative">
      {/* Sidebar drawer */}
      <div className={`fixed md:static left-0 top-0 z-40 h-full ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <motion.div 
          initial={{ width: 256 }} 
          animate={{ width: 256 }} 
          className="sidebar-container bg-white shadow-lg h-full w-64 flex flex-col"
        >
          <div className="p-4 border-b flex items-center justify-between flex-shrink-0">
            <h1 className="font-bold text-xl text-primary">{t('panels.admin')}</h1>
            <button 
              onClick={() => setSidebarOpen(false)} 
              className="p-2 rounded-lg hover:bg-gray-100 md:hidden transition-colors"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto mt-2 pb-8 px-2">
            {menuItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveRoute(item.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors border-l-0 ${
                    activeRoute === item.id
                      ? 'bg-primary text-white font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} className="mr-3 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </motion.div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)} 
          className="fixed inset-0 bg-black/30 md:hidden z-30 transition-opacity duration-300" 
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-0 overflow-hidden min-w-0">
        <header className="bg-white shadow-sm px-4 lg:px-6 py-3 lg:py-4 sticky top-0 z-10 hidden md:block flex-shrink-0">
          <h2 className="text-xl lg:text-2xl font-semibold text-gray-800 capitalize">
            {{
              'dashboard': t('menu.admin.dashboard'),
              'students': t('menu.admin.students'),
              'teachers': t('menu.admin.teachers'),
              'teacher-attendance': 'Teacher Attendance',
              'parent-management': t('menu.admin.parents'),
              'admissions': t('menu.admin.admissions'),
              'events': t('menu.admin.events'),
              'announcements': t('menu.admin.announcements'),
              'fee-management': t('menu.admin.feeManagement'),
              'credentials': 'Credentials Management',
              'reports': t('menu.admin.library')
            }[activeRoute] || t('menu.admin.dashboard')}
          </h2>
        </header>
        <main className="flex-1 overflow-y-auto p-2 sm:p-4 lg:p-6 relative">
          {renderContent()}
        </main>
        
        {/* Chatbot Widget - Fixed position overlay */}
        <div className="fixed inset-0 pointer-events-none z-40">
          <div className="pointer-events-auto">
            <ChatbotWidget />
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default AdminDashboard;
