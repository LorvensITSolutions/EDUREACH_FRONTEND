import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useEnhancedDashboardStore = create((set, get) => ({
  // ===========================================
  // STATE MANAGEMENT
  // ===========================================
  loading: false,
  error: null,
  lastUpdated: null,
  selectedDate: null, // Store selected date for consistent data fetching
  selectedAcademicYear: null, // Store selected academic year for filtering
  
  // Helper function to get current academic year
  getCurrentAcademicYear: () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11
    // If June or later, academic year is currentYear-nextYear, else previousYear-currentYear
    if (currentMonth >= 5) {
      return `${currentYear}-${currentYear + 1}`;
    } else {
      return `${currentYear - 1}-${currentYear}`;
    }
  },
  
  // Set selected date
  setSelectedDate: (date) => {
    set({ selectedDate: date });
    console.log("Selected date updated:", date);
  },
  
  // Set selected academic year
  setSelectedAcademicYear: (academicYear) => {
    console.log("Store: Setting academic year to:", academicYear);
    set({ selectedAcademicYear: academicYear });
    console.log("Store: Academic year updated successfully");
  },
  
  // Comprehensive Dashboard Data
  dashboardData: null,
  realTimeData: null,
  incomeExpenseData: [],
  annualFeeSummary: null,
  teacherPerformanceData: null,
  realTimeAlerts: null,
  performanceTrends: null,
  
  // Attendance Analytics Data
  studentAttendanceData: null,
  teacherAttendanceData: null,
  attendanceComparativeData: null,
  
  // Fee Collection Status Data
  feeCollectionStatusData: null,
  paymentMethodsData: null,
  
  // Auto-refresh settings
  autoRefresh: true,
  refreshInterval: 30000, // 30 seconds
  refreshTimer: null,

  // ===========================================
  // DATA FETCHING METHODS
  // ===========================================

  // Fetch comprehensive dashboard analytics
  fetchComprehensiveDashboard: async (selectedDate = null, academicYear = null) => {
    set({ loading: true, error: null });
    try {
      console.log("Fetching comprehensive dashboard analytics for date:", selectedDate, "academic year:", academicYear);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (selectedDate) {
        params.append('date', selectedDate);
      }
      if (academicYear) {
        params.append('academicYear', academicYear);
      }
      
      const { data } = await axios.get(`/enhanced-analytics/comprehensive?${params.toString()}`);
      
      if (data.success) {
        console.log("Comprehensive dashboard data:", data.data);
        console.log("KPIs:", data.data.kpis);
        console.log("Charts:", data.data.charts);
        console.log("Fee Collection Rates:", data.data.charts?.feeCollectionRates);
        
        // Process and validate the data
        const processedData = {
          ...data.data,
          kpis: {
            ...data.data.kpis,
            // Ensure all KPIs have fallback values
            totalStudents: data.data.kpis?.totalStudents || 0,
            totalTeachers: data.data.kpis?.totalTeachers || 0,
            totalParents: data.data.kpis?.totalParents || 0,
            attendanceToday: data.data.kpis?.attendanceToday || 0,
            teacherAttendanceToday: data.data.kpis?.teacherAttendanceToday || 0,
            totalFeeCollected: data.data.kpis?.totalFeeCollected || 0,
            collectionEfficiency: data.data.kpis?.collectionEfficiency || 0,
            pendingOfflinePayments: data.data.kpis?.pendingOfflinePayments || 0
          },
          charts: {
            ...data.data.charts,
            // Ensure chart data is properly formatted
            studentsByClass: data.data.charts?.studentsByClass || [],
            feeCollectionRates: data.data.charts?.feeCollectionRates || []
          }
        };
        
        set({ 
          dashboardData: processedData, 
          loading: false,
          lastUpdated: new Date()
        });
        console.log("Comprehensive dashboard data fetched and processed successfully");
      } else {
        throw new Error(data.message || "Failed to fetch dashboard data");
      }
    } catch (error) {
      console.error("Fetch comprehensive dashboard error:", error);
      set({ 
        error: error.response?.data?.message || error.message, 
        loading: false 
      });
      toast.error("Failed to fetch dashboard analytics");
    }
  },

  // Fetch real-time updates
  fetchRealTimeUpdates: async (selectedDate = null, academicYear = null) => {
    try {
      // Build query parameters for real-time updates
      const realTimeParams = new URLSearchParams();
      if (selectedDate) {
        realTimeParams.append('date', selectedDate);
      }
      if (academicYear) {
        realTimeParams.append('academicYear', academicYear);
      }
      
      const [realTimeResponse, alertsResponse] = await Promise.all([
        axios.get(`/enhanced-analytics/real-time?${realTimeParams.toString()}`),
        axios.get("/enhanced-analytics/real-time-alerts")
      ]);
      
      if (realTimeResponse.data.success) {
        set({ 
          realTimeData: realTimeResponse.data.data,
          lastUpdated: new Date()
        });
        console.log("Real-time data updated for date:", selectedDate);
      }
      
      if (alertsResponse.data.success) {
        set({ 
          realTimeAlerts: alertsResponse.data.data,
          lastUpdated: new Date()
        });
        console.log("Real-time alerts updated");
      }
    } catch (error) {
      console.error("Fetch real-time updates error:", error);
      // Don't show toast for real-time updates to avoid spam
    }
  },

  // Fetch income vs expense data
  fetchIncomeExpenseData: async (days = 10, academicYear = null) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      params.append('days', days);
      if (academicYear) {
        params.append('academicYear', academicYear);
      }
      const { data } = await axios.get(`/enhanced-analytics/income-expense?${params.toString()}`);
      
      if (data.success) {
        set({ 
          incomeExpenseData: data.data, 
          loading: false 
        });
      } else {
        throw new Error(data.message || "Failed to fetch income expense data");
      }
    } catch (error) {
      console.error("Fetch income expense data error:", error);
      set({ 
        error: error.response?.data?.message || error.message, 
        loading: false 
      });
      toast.error("Failed to fetch income expense data");
    }
  },

  // Fetch fee collection status data (amount due vs amount paid)
  // options.skipGlobalLoading: when true, refetch does not set global loading (avoids unmounting Fee Collection chart)
  fetchFeeCollectionStatusData: async (days = 10, filters = {}, academicYear = null, options = {}) => {
    const skipGlobalLoading = options.skipGlobalLoading === true;
    if (!skipGlobalLoading) set({ loading: true, error: null });
    try {
      console.log(`Fetching fee collection status data for ${days} days with filters:`, filters, "academic year:", academicYear);
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('days', days);
      if (filters.class) params.append('class', filters.class);
      if (filters.section) params.append('section', filters.section);
      if (academicYear) params.append('academicYear', academicYear);
      
      const { data } = await axios.get(`/enhanced-analytics/fee-collection-status?${params.toString()}`);
      
      if (data.success) {
        console.log("Fee collection status data received:", data.data);
        set({ 
          feeCollectionStatusData: data.data, 
          ...(skipGlobalLoading ? {} : { loading: false })
        });
      } else {
        throw new Error(data.message || "Failed to fetch fee collection status data");
      }
    } catch (error) {
      console.error("Fetch fee collection status data error:", error);
      set({ 
        error: error.response?.data?.message || error.message, 
        ...(skipGlobalLoading ? {} : { loading: false })
      });
      if (!skipGlobalLoading) toast.error("Failed to fetch fee collection status data");
    }
  },

  // Fetch payment methods analysis data
  fetchPaymentMethodsData: async (academicYear = null) => {
    set({ loading: true, error: null });
    try {
      console.log("Fetching payment methods data", "academic year:", academicYear);
      
      const params = new URLSearchParams();
      if (academicYear) params.append('academicYear', academicYear);
      const { data } = await axios.get(`/enhanced-analytics/payment-methods?${params.toString()}`);
      
      if (data.success) {
        console.log("Payment methods data received:", data.data);
        set({ 
          paymentMethodsData: data.data, 
          loading: false 
        });
      } else {
        throw new Error(data.message || "Failed to fetch payment methods data");
      }
    } catch (error) {
      console.error("Fetch payment methods data error:", error);
      set({ 
        error: error.response?.data?.message || error.message, 
        loading: false 
      });
      toast.error("Failed to fetch payment methods data");
    }
  },

  // Refetch fee collection data with filters (skip global loading so Fee Collection chart stays mounted)
  refetchFeeCollectionWithFilters: async (filters = {}) => {
    const { fetchFeeCollectionStatusData, selectedAcademicYear } = get();
    await fetchFeeCollectionStatusData(10, filters, selectedAcademicYear, { skipGlobalLoading: true });
  },

  // ===========================================
  // ATTENDANCE ANALYTICS METHODS
  // ===========================================

  // Fetch student attendance analytics
  fetchStudentAttendanceAnalytics: async (filters = {}, academicYear = null) => {
    set({ loading: true, error: null });
    try {
      const { 
        startDate, 
        endDate, 
        class: studentClass, 
        section, 
        status, 
        days = 30,
        groupBy = 'daily'
      } = filters;
      
      console.log(`Fetching student attendance analytics with filters:`, filters, "academic year:", academicYear);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (studentClass) params.append('class', studentClass);
      if (section) params.append('section', section);
      if (status) params.append('status', status);
      if (academicYear) params.append('academicYear', academicYear);
      params.append('days', days);
      params.append('groupBy', groupBy);
      
      const { data } = await axios.get(`/enhanced-analytics/student-attendance?${params.toString()}`);
      
      if (data.success) {
        console.log("Student attendance data received:", data.data);
        
        set({ 
          studentAttendanceData: data.data, 
          loading: false 
        });
        console.log("Student attendance data processed successfully");
      } else {
        throw new Error(data.message || "Failed to fetch student attendance analytics");
      }
    } catch (error) {
      console.error("Fetch student attendance analytics error:", error);
      set({ 
        error: error.response?.data?.message || error.message, 
        loading: false 
      });
      toast.error("Failed to fetch student attendance analytics");
    }
  },

  // Fetch teacher attendance analytics
  fetchTeacherAttendanceAnalytics: async (filters = {}, academicYear = null) => {
    set({ loading: true, error: null });
    try {
      const { 
        startDate, 
        endDate, 
        subject, 
        status, 
        teacherId,
        days = 30,
        groupBy = 'daily'
      } = filters;
      
      console.log(`Fetching teacher attendance analytics with filters:`, filters, "academic year:", academicYear);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (subject) params.append('subject', subject);
      if (status) params.append('status', status);
      if (teacherId) params.append('teacherId', teacherId);
      if (academicYear) params.append('academicYear', academicYear);
      params.append('days', days);
      params.append('groupBy', groupBy);
      
      const { data } = await axios.get(`/enhanced-analytics/teacher-attendance?${params.toString()}`);
      
      if (data.success) {
        console.log("Teacher attendance data received:", data.data);
        
        set({ 
          teacherAttendanceData: data.data, 
          loading: false 
        });
        console.log("Teacher attendance data processed successfully");
      } else {
        throw new Error(data.message || "Failed to fetch teacher attendance analytics");
      }
    } catch (error) {
      console.error("Fetch teacher attendance analytics error:", error);
      set({ 
        error: error.response?.data?.message || error.message, 
        loading: false 
      });
      toast.error("Failed to fetch teacher attendance analytics");
    }
  },

  // Fetch attendance comparative analytics
  fetchAttendanceComparativeAnalytics: async (filters = {}, academicYear = null) => {
    set({ loading: true, error: null });
    try {
      const { 
        startDate, 
        endDate, 
        days = 30,
        compareWith = 'previous'
      } = filters;
      
      console.log(`Fetching attendance comparative analytics with filters:`, filters, "academic year:", academicYear);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (academicYear) params.append('academicYear', academicYear);
      params.append('days', days);
      params.append('compareWith', compareWith);
      
      const { data } = await axios.get(`/enhanced-analytics/attendance-comparative?${params.toString()}`);
      
      if (data.success) {
        console.log("Attendance comparative data received:", data.data);
        
        set({ 
          attendanceComparativeData: data.data, 
          loading: false 
        });
        console.log("Attendance comparative data processed successfully");
      } else {
        throw new Error(data.message || "Failed to fetch attendance comparative analytics");
      }
    } catch (error) {
      console.error("Fetch attendance comparative analytics error:", error);
      set({ 
        error: error.response?.data?.message || error.message, 
        loading: false 
      });
      toast.error("Failed to fetch attendance comparative analytics");
    }
  },

  // Fetch annual fee summary
  fetchAnnualFeeSummary: async (academicYear = null) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (academicYear) params.append('academicYear', academicYear);
      const { data } = await axios.get(`/enhanced-analytics/annual-fee-summary?${params.toString()}`);
      
      if (data.success) {
        set({ 
          annualFeeSummary: data.data, 
          loading: false 
        });
      } else {
        throw new Error(data.message || "Failed to fetch annual fee summary");
      }
    } catch (error) {
      console.error("Fetch annual fee summary error:", error);
      set({ 
        error: error.response?.data?.message || error.message, 
        loading: false 
      });
      toast.error("Failed to fetch annual fee summary");
    }
  },

  // Fetch teacher performance analytics
  fetchTeacherPerformanceAnalytics: async (days = 30, academicYear = null) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      params.append('days', days);
      if (academicYear) params.append('academicYear', academicYear);
      const { data } = await axios.get(`/enhanced-analytics/teacher-performance?${params.toString()}`);
      
      if (data.success) {
        set({ 
          teacherPerformanceData: data.data, 
          loading: false 
        });
      } else {
        throw new Error(data.message || "Failed to fetch teacher performance data");
      }
    } catch (error) {
      console.error("Fetch teacher performance analytics error:", error);
      set({ 
        error: error.response?.data?.message || error.message, 
        loading: false 
      });
      toast.error("Failed to fetch teacher performance analytics");
    }
  },

  // Fetch real-time alerts
  fetchRealTimeAlerts: async () => {
    try {
      const { data } = await axios.get("/enhanced-analytics/real-time-alerts");
      
      if (data.success) {
        set({ 
          realTimeAlerts: data.data,
          lastUpdated: new Date()
        });
        console.log("Real-time alerts updated");
      }
    } catch (error) {
      console.error("Fetch real-time alerts error:", error);
      // Don't show toast for alerts to avoid spam
    }
  },

  // Fetch performance trends
  fetchPerformanceTrends: async (months = 6) => {
    set({ loading: true, error: null });
    try {
      const { data } = await axios.get(`/enhanced-analytics/performance-trends?months=${months}`);
      
      if (data.success) {
        set({ 
          performanceTrends: data.data, 
          loading: false 
        });
      } else {
        throw new Error(data.message || "Failed to fetch performance trends");
      }
    } catch (error) {
      console.error("Fetch performance trends error:", error);
      set({ 
        error: error.response?.data?.message || error.message, 
        loading: false 
      });
      toast.error("Failed to fetch performance trends");
    }
  },

  // ===========================================
  // BULK DATA FETCHING
  // ===========================================

  // Fetch all dashboard data
  fetchAllDashboardData: async (selectedDate = null, academicYear = null) => {
    set({ loading: true, error: null });
    try {
      // Use store's academic year if not provided
      const yearToUse = academicYear || get().selectedAcademicYear || get().getCurrentAcademicYear();
      console.log("=== FETCHING ALL DASHBOARD DATA ===");
      console.log("Date:", selectedDate);
      console.log("Academic Year (passed):", academicYear);
      console.log("Academic Year (from store):", get().selectedAcademicYear);
      console.log("Academic Year (to use):", yearToUse);
      await Promise.all([
        get().fetchComprehensiveDashboard(selectedDate, yearToUse),
        get().fetchIncomeExpenseData(10, yearToUse),
        get().fetchFeeCollectionStatusData(10, {}, yearToUse),
        get().fetchPaymentMethodsData(yearToUse),
        get().fetchAnnualFeeSummary(yearToUse),
        get().fetchTeacherPerformanceAnalytics(30, yearToUse),
        get().fetchRealTimeAlerts(),
        get().fetchPerformanceTrends(),
        // Fetch attendance analytics with default filters
        get().fetchStudentAttendanceAnalytics({ days: 30, groupBy: 'daily' }, yearToUse),
        get().fetchTeacherAttendanceAnalytics({ days: 30, groupBy: 'daily' }, yearToUse),
        get().fetchAttendanceComparativeAnalytics({ days: 30, compareWith: 'previous' }, yearToUse)
      ]);
      console.log("All dashboard data fetched successfully");
    } catch (error) {
      console.error("Fetch all dashboard data error:", error);
      set({ 
        error: error.message, 
        loading: false 
      });
      toast.error("Failed to fetch dashboard data");
    }
  },

  // ===========================================
  // AUTO-REFRESH MANAGEMENT
  // ===========================================

  // Start auto-refresh
  startAutoRefresh: () => {
    const { autoRefresh, refreshInterval, selectedDate, selectedAcademicYear } = get();
    if (!autoRefresh) return;

    const timer = setInterval(() => {
      get().fetchRealTimeUpdates(selectedDate, selectedAcademicYear);
    }, refreshInterval);

    set({ refreshTimer: timer });
    console.log("Auto-refresh started with date:", selectedDate, "academic year:", selectedAcademicYear);
  },

  // Stop auto-refresh
  stopAutoRefresh: () => {
    const { refreshTimer } = get();
    if (refreshTimer) {
      clearInterval(refreshTimer);
      set({ refreshTimer: null });
      console.log("Auto-refresh stopped");
    }
  },

  // Toggle auto-refresh
  toggleAutoRefresh: () => {
    const { autoRefresh } = get();
    set({ autoRefresh: !autoRefresh });
    
    if (!autoRefresh) {
      get().startAutoRefresh();
    } else {
      get().stopAutoRefresh();
    }
  },

  // Set refresh interval
  setRefreshInterval: (interval) => {
    set({ refreshInterval: interval });
    get().stopAutoRefresh();
    get().startAutoRefresh();
  },

  // ===========================================
  // UTILITY METHODS
  // ===========================================

  // Clear error
  clearError: () => set({ error: null }),

  // Reset store
  resetStore: () => {
    get().stopAutoRefresh();
    set({
      loading: false,
      error: null,
      lastUpdated: null,
      dashboardData: null,
      realTimeData: null,
      incomeExpenseData: [],
      annualFeeSummary: null,
      teacherPerformanceData: null,
      realTimeAlerts: null,
      performanceTrends: null,
      studentAttendanceData: null,
      teacherAttendanceData: null,
      attendanceComparativeData: null,
      autoRefresh: true,
      refreshInterval: 30000,
      refreshTimer: null
    });
  },

  // ===========================================
  // COMPUTED VALUES
  // ===========================================

  // Get computed KPIs
  getComputedKPIs: () => {
    const { dashboardData, realTimeData } = get();
    
    if (!dashboardData?.kpis) {
      return {
        totalStudents: 0,
        totalTeachers: 0,
        totalParents: 0,
        pendingAdmissions: 0,
        upcomingEvents: 0,
        recentPayments: 0,
        attendanceToday: 0,
        teacherAttendanceToday: 0,
        totalFeeCollected: 0,
        monthlyFeeCollected: 0,
        weeklyFeeCollected: 0,
        pendingOfflinePayments: 0,
        averageAttendanceRate: 0,
        collectionEfficiency: 0,
        admissionGrowthRate: 0,
        avgTeacherAttendance: 0,
        studentsAbsent: 0,
        teachersAbsent: 0,
        studentsNotMarked: 0,
        teachersNotMarked: 0,
        totalEnrolledStudents: 0,
        totalEnrolledTeachers: 0,
        totalMarkedToday: 0,
        markedAttendancePercentage: 0,
        attendancePercentage: 0,
        teacherAttendancePercentage: 0
      };
    }

    const kpis = dashboardData.kpis;
    const realTime = realTimeData || {};

    const totalStudents = kpis.totalEnrolledStudents || kpis.totalStudents || 0;
    const totalTeachers = kpis.totalEnrolledTeachers || kpis.totalTeachers || 0;

    const attendanceToday = realTime.attendanceToday || kpis.attendanceToday || 0;
    const studentsAbsent = realTime.studentsAbsent || kpis.studentsAbsent || 0;
    const teacherAttendanceToday = realTime.teacherAttendanceToday || kpis.teacherAttendanceToday || 0;
    const teachersAbsent = realTime.teachersAbsent || kpis.teachersAbsent || 0;

    const attendancePercentage = kpis.attendancePercentage || (totalStudents > 0 
      ? Math.round((attendanceToday / totalStudents) * 100)
      : 0);
    
    const teacherAttendancePercentage = kpis.teacherAttendancePercentage || (totalTeachers > 0 
      ? Math.round((teacherAttendanceToday / totalTeachers) * 100)
      : 0);

    // Recalculate not-marked to avoid impossible values
    const computedStudentNotMarked = Math.max(totalStudents - (attendanceToday + studentsAbsent), 0);
    const normalizedStudentNotMarked = Math.min(
      Math.max(realTime.studentsNotMarked ?? kpis.studentsNotMarked ?? 0, 0),
      totalStudents
    );
    const studentsNotMarked =
      normalizedStudentNotMarked > 0 && normalizedStudentNotMarked <= computedStudentNotMarked
        ? normalizedStudentNotMarked
        : computedStudentNotMarked;

    const computedTeacherNotMarked = Math.max(totalTeachers - (teacherAttendanceToday + teachersAbsent), 0);
    const normalizedTeacherNotMarked = Math.min(
      Math.max(realTime.teachersNotMarked ?? kpis.teachersNotMarked ?? 0, 0),
      totalTeachers
    );
    const teachersNotMarked =
      normalizedTeacherNotMarked > 0 && normalizedTeacherNotMarked <= computedTeacherNotMarked
        ? normalizedTeacherNotMarked
        : computedTeacherNotMarked;

    const totalMarkedToday = realTime.totalMarkedToday || kpis.totalMarkedToday || (attendanceToday + studentsAbsent);
    const markedAttendancePercentage = realTime.markedAttendancePercentage || kpis.markedAttendancePercentage ||
      (totalStudents > 0 ? Math.round((totalMarkedToday / totalStudents) * 100) : 0);

    return {
      // Basic counts
      totalStudents,
      totalTeachers,
      totalParents: kpis.totalParents || 0,
      pendingAdmissions: kpis.pendingAdmissions || 0,
      upcomingEvents: kpis.upcomingEvents || 0,
      
      // Real-time updates with calculated percentages
      recentPayments: realTime.recentPayments || kpis.recentPayments || 0,
      attendanceToday,
      teacherAttendanceToday,
      attendancePercentage,
      teacherAttendancePercentage,

      // Enhanced attendance metrics
      studentsAbsent,
      teachersAbsent,
      studentsNotMarked,
      teachersNotMarked,
      totalEnrolledStudents: totalStudents,
      totalEnrolledTeachers: totalTeachers,
      totalMarkedToday,
      markedAttendancePercentage,
      
      // Financial data
      totalFeeCollected: kpis.totalFeeCollected || 0,
      monthlyFeeCollected: kpis.monthlyFeeCollected || 0,
      weeklyFeeCollected: kpis.weeklyFeeCollected || 0,
      pendingOfflinePayments: realTime.pendingOfflinePayments || kpis.pendingOfflinePayments || 0,
      
      // Performance metrics
      averageAttendanceRate: kpis.averageAttendanceRate || 0,
      collectionEfficiency: kpis.collectionEfficiency || 0,
      admissionGrowthRate: kpis.admissionGrowthRate || 0,
      avgTeacherAttendance: kpis.avgTeacherAttendance || 0
    };
  },

  // Get chart data
  getChartData: () => {
    const { 
      dashboardData, 
      incomeExpenseData, 
      feeCollectionStatusData,
      paymentMethodsData,
      annualFeeSummary, 
      teacherPerformanceData, 
      performanceTrends,
      studentAttendanceData,
      teacherAttendanceData,
      attendanceComparativeData
    } = get();
    
    const chartData = {
      studentsByClass: dashboardData?.charts?.studentsByClass || [],
      studentsBySection: dashboardData?.charts?.studentsBySection || [],
      admissionTrends: dashboardData?.charts?.admissionTrends || [],
      attendanceSummary: dashboardData?.charts?.attendanceSummary || [],
      feeCollectionRates: dashboardData?.charts?.feeCollectionRates || [],
      outstandingPayments: dashboardData?.charts?.outstandingPayments || [],
      paymentMethodsAnalysis: dashboardData?.charts?.paymentMethodsAnalysis || [],
      lateFeeAnalytics: dashboardData?.charts?.lateFeeAnalytics || [],
      teacherWorkload: dashboardData?.charts?.teacherWorkload || [],
      teacherAttendanceSummary: dashboardData?.charts?.teacherAttendanceSummary || [],
      incomeExpenseData: incomeExpenseData || [],
      feeCollectionStatusData: feeCollectionStatusData || null,
      paymentMethodsData: paymentMethodsData || null,
      annualFeeSummary: annualFeeSummary || null,
      teacherPerformanceData: teacherPerformanceData || null,
      performanceTrends: performanceTrends || null,
      // Attendance Analytics Data
      studentAttendanceData: studentAttendanceData || null,
      teacherAttendanceData: teacherAttendanceData || null,
      attendanceComparativeData: attendanceComparativeData || null
    };
    
    console.log("Chart data being returned:", chartData);
    console.log("Students by class data:", chartData.studentsByClass);
    console.log("Income expense data:", chartData.incomeExpenseData);
    console.log("Fee collection rates data:", chartData.feeCollectionRates);
    console.log("Fee collection rates length:", chartData.feeCollectionRates?.length);
    console.log("Fee collection status data:", chartData.feeCollectionStatusData);
    console.log("Student attendance data:", chartData.studentAttendanceData);
    console.log("Teacher attendance data:", chartData.teacherAttendanceData);
    
    return chartData;
  },

  // Get recent activities
  getRecentActivities: () => {
    const { dashboardData } = get();
    
    return {
      events: dashboardData?.recentActivities?.events || [],
      admissions: dashboardData?.recentActivities?.admissions || [],
      attendance: dashboardData?.recentActivities?.attendance || [],
      payments: dashboardData?.recentActivities?.payments || []
    };
  },

  // Get performance metrics
  getPerformanceMetrics: () => {
    const { dashboardData } = get();
    
    return {
      averageAttendanceRate: dashboardData?.performance?.averageAttendanceRate || 0,
      collectionEfficiency: dashboardData?.performance?.collectionEfficiency || 0,
      admissionGrowthRate: dashboardData?.performance?.admissionGrowthRate || 0,
      avgTeacherAttendance: dashboardData?.performance?.avgTeacherAttendance || 0,
      totalRevenue: dashboardData?.performance?.totalRevenue || 0,
      studentGrowthRate: dashboardData?.performance?.studentGrowthRate || 0,
      teacherPerformanceMetrics: dashboardData?.performance?.teacherPerformanceMetrics || []
    };
  },

  // Get alerts data
  getAlertsData: () => {
    const { realTimeAlerts } = get();
    
    return {
      alerts: realTimeAlerts?.alerts || [],
      summary: realTimeAlerts?.summary || {
        totalAlerts: 0,
        highPriority: 0,
        mediumPriority: 0,
        lowPriority: 0
      }
    };
  },

  // ===========================================
  // ATTENDANCE ANALYTICS UTILITY METHODS
  // ===========================================

  // Get student attendance data
  getStudentAttendanceData: () => {
    const { studentAttendanceData } = get();
    
    return {
      attendanceData: studentAttendanceData?.attendanceData || [],
      classSummary: studentAttendanceData?.classSummary || [],
      summary: studentAttendanceData?.summary || {
        totalRecords: 0,
        totalPresent: 0,
        totalAbsent: 0,
        overallAttendanceRate: 0,
        uniqueStudents: 0
      }
    };
  },

  // Get teacher attendance data
  getTeacherAttendanceData: () => {
    const { teacherAttendanceData } = get();
    
    return {
      attendanceData: teacherAttendanceData?.attendanceData || [],
      subjectSummary: teacherAttendanceData?.subjectSummary || [],
      teacherPerformance: teacherAttendanceData?.teacherPerformance || [],
      summary: teacherAttendanceData?.summary || {
        totalRecords: 0,
        totalPresent: 0,
        totalAbsent: 0,
        overallAttendanceRate: 0,
        uniqueTeachers: 0
      }
    };
  },

  // Get attendance comparative data
  getAttendanceComparativeData: () => {
    const { attendanceComparativeData } = get();
    
    return {
      currentPeriod: attendanceComparativeData?.currentPeriod || {
        studentAttendance: { total: 0, present: 0, rate: 0 },
        teacherAttendance: { total: 0, present: 0, rate: 0 }
      },
      comparisonPeriod: attendanceComparativeData?.comparisonPeriod || {
        studentAttendance: { total: 0, present: 0, rate: 0 },
        teacherAttendance: { total: 0, present: 0, rate: 0 }
      },
      comparison: attendanceComparativeData?.comparison || {
        studentAttendanceChange: 0,
        teacherAttendanceChange: 0,
        studentAttendanceTrend: 'stable',
        teacherAttendanceTrend: 'stable'
      }
    };
  },

  // Get attendance analytics summary
  getAttendanceAnalyticsSummary: () => {
    const studentData = get().getStudentAttendanceData();
    const teacherData = get().getTeacherAttendanceData();
    const comparativeData = get().getAttendanceComparativeData();
    
    return {
      student: {
        totalRecords: studentData.summary.totalRecords,
        attendanceRate: studentData.summary.overallAttendanceRate,
        uniqueStudents: studentData.summary.uniqueStudents,
        presentToday: studentData.summary.totalPresent,
        absentToday: studentData.summary.totalAbsent
      },
      teacher: {
        totalRecords: teacherData.summary.totalRecords,
        attendanceRate: teacherData.summary.overallAttendanceRate,
        uniqueTeachers: teacherData.summary.uniqueTeachers,
        presentToday: teacherData.summary.totalPresent,
        absentToday: teacherData.summary.totalAbsent
      },
      trends: {
        studentTrend: comparativeData.comparison.studentAttendanceTrend,
        teacherTrend: comparativeData.comparison.teacherAttendanceTrend,
        studentChange: comparativeData.comparison.studentAttendanceChange,
        teacherChange: comparativeData.comparison.teacherAttendanceChange
      }
    };
  }
}));
