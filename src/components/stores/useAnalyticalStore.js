import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useAnalyticalStore = create((set, get) => ({
  // ===========================================
  // STATE MANAGEMENT
  // ===========================================
  loading: false,
  error: null,
  
  // Student Analytics State
  studentsByClass: [],
  studentsBySection: [],
  admissionTrends: [],
  attendancePatterns: [],
  attendanceSummary: [],
  
  // Financial Analytics State
  feeCollectionRates: [],
  outstandingPayments: [],
  paymentMethodsAnalysis: [],
  feeStructureByClass: [],
  lateFeeAnalytics: [],
  
  // Academic Performance State
  assignmentCompletionRates: [],
  teacherWorkload: [],
  
  // Real-time KPIs State
  activeStudentsCount: { totalStudents: 0, activeStudents: 0, inactiveStudents: 0 },
  pendingAdmissionsCount: { totalPending: 0, totalProcessed: 0, totalApplications: 0, statusBreakdown: [] },
  upcomingEvents: [],
  dashboardSummary: {},
  
  // Filter States
  filters: {
    year: new Date().getFullYear(),
    class: "",
    section: "",
    startDate: "",
    endDate: "",
    category: "",
    limit: 50
  },

  // ===========================================
  // STUDENT ANALYTICS METHODS
  // ===========================================

  // Fetch students by class
  fetchStudentsByClass: async () => {
    set({ loading: true, error: null });
    try {
      console.log("Making request to /analytics/students-by-class");
      const { data } = await axios.get("/analytics/students-by-class");
      console.log("Students by class API response:", data);
      console.log("Data success:", data.success);
      console.log("Data data:", data.data);
      
      const studentsData = data.success ? data.data : [];
      console.log("Setting studentsByClass to:", studentsData);
      
      set({ 
        studentsByClass: studentsData, 
        loading: false 
      });
    } catch (error) {
      console.error("Fetch students by class error:", error);
      console.error("Error details:", error.response?.data);
      set({ error: error.message, loading: false });
      toast.error("Failed to fetch students by class data");
    }
  },

  // Fetch students by section
  fetchStudentsBySection: async (className = "") => {
    set({ loading: true, error: null });
    try {
      const query = className ? `?class=${className}` : "";
      const { data } = await axios.get(`/analytics/students-by-section${query}`);
      set({ studentsBySection: data, loading: false });
    } catch (error) {
      console.error("Fetch students by section error:", error);
      set({ error: error.message, loading: false });
      toast.error("Failed to fetch students by section data");
    }
  },

  // Fetch admission trends
  fetchAdmissionTrends: async (year = null, status = "") => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (year) params.append("year", year);
      if (status) params.append("status", status);
      
      const query = params.toString();
      const { data } = await axios.get(`/analytics/admission-trends${query ? `?${query}` : ""}`);
      set({ admissionTrends: data, loading: false });
    } catch (error) {
      console.error("Fetch admission trends error:", error);
      set({ error: error.message, loading: false });
      toast.error("Failed to fetch admission trends data");
    }
  },

  // Fetch attendance patterns
  fetchAttendancePatterns: async (startDate = "", endDate = "", className = "") => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (className) params.append("class", className);
      
      const query = params.toString();
      const { data } = await axios.get(`/analytics/attendance-patterns${query ? `?${query}` : ""}`);
      set({ attendancePatterns: data, loading: false });
    } catch (error) {
      console.error("Fetch attendance patterns error:", error);
      set({ error: error.message, loading: false });
      toast.error("Failed to fetch attendance patterns data");
    }
  },

  // Fetch attendance summary
  fetchAttendanceSummary: async (startDate = "", endDate = "") => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      
      const query = params.toString();
      const { data } = await axios.get(`/analytics/attendance-summary${query ? `?${query}` : ""}`);
      set({ attendanceSummary: data, loading: false });
    } catch (error) {
      console.error("Fetch attendance summary error:", error);
      set({ error: error.message, loading: false });
      toast.error("Failed to fetch attendance summary data");
    }
  },

  // ===========================================
  // FINANCIAL ANALYTICS METHODS
  // ===========================================

  // Fetch fee collection rates
  fetchFeeCollectionRates: async (year = null, className = "") => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (year) params.append("year", year);
      if (className) params.append("class", className);
      
      const query = params.toString();
      const { data } = await axios.get(`/analytics/fee-collection-rates${query ? `?${query}` : ""}`);
      set({ 
        feeCollectionRates: data.success ? data.data : [], 
        loading: false 
      });
    } catch (error) {
      console.error("Fetch fee collection rates error:", error);
      set({ error: error.message, loading: false });
      toast.error("Failed to fetch fee collection data");
    }
  },

  // Fetch outstanding payments
  fetchOutstandingPayments: async (className = "", limit = 50) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (className) params.append("class", className);
      if (limit) params.append("limit", limit);
      
      const query = params.toString();
      const { data } = await axios.get(`/analytics/outstanding-payments${query ? `?${query}` : ""}`);
      set({ 
        outstandingPayments: data.success ? data.data : [], 
        loading: false 
      });
    } catch (error) {
      console.error("Fetch outstanding payments error:", error);
      set({ error: error.message, loading: false });
      toast.error("Failed to fetch outstanding payments data");
    }
  },

  // Fetch payment methods analysis
  fetchPaymentMethodsAnalysis: async (year = null, className = "") => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (year) params.append("year", year);
      if (className) params.append("class", className);
      
      const query = params.toString();
      const { data } = await axios.get(`/analytics/payment-methods-analysis${query ? `?${query}` : ""}`);
      set({ 
        paymentMethodsAnalysis: data.success ? data.data : [], 
        loading: false 
      });
    } catch (error) {
      console.error("Fetch payment methods analysis error:", error);
      set({ error: error.message, loading: false });
      toast.error("Failed to fetch payment methods data");
    }
  },

  // Fetch fee structure by class
  fetchFeeStructureByClass: async (academicYear = null) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (academicYear) params.append("academicYear", academicYear);
      
      const query = params.toString();
      const { data } = await axios.get(`/analytics/fee-structure-by-class${query ? `?${query}` : ""}`);
      set({ feeStructureByClass: data, loading: false });
    } catch (error) {
      console.error("Fetch fee structure by class error:", error);
      set({ error: error.message, loading: false });
      toast.error("Failed to fetch fee structure data");
    }
  },

  // Fetch late fee analytics
  fetchLateFeeAnalytics: async (year = null, className = "") => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (year) params.append("year", year);
      if (className) params.append("class", className);
      
      const query = params.toString();
      const { data } = await axios.get(`/analytics/late-fee-analytics${query ? `?${query}` : ""}`);
      set({ lateFeeAnalytics: data, loading: false });
    } catch (error) {
      console.error("Fetch late fee analytics error:", error);
      set({ error: error.message, loading: false });
      toast.error("Failed to fetch late fee analytics data");
    }
  },

  // ===========================================
  // ACADEMIC PERFORMANCE METHODS
  // ===========================================

  // Fetch assignment completion rates
  fetchAssignmentCompletionRates: async (className = "", section = "") => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (className) params.append("class", className);
      if (section) params.append("section", section);
      
      const query = params.toString();
      const { data } = await axios.get(`/analytics/assignment-completion-rates${query ? `?${query}` : ""}`);
      set({ assignmentCompletionRates: data, loading: false });
    } catch (error) {
      console.error("Fetch assignment completion rates error:", error);
      set({ error: error.message, loading: false });
      toast.error("Failed to fetch assignment completion data");
    }
  },

  // Fetch teacher workload
  fetchTeacherWorkload: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await axios.get("/analytics/teacher-workload");
      set({ teacherWorkload: data, loading: false });
    } catch (error) {
      console.error("Fetch teacher workload error:", error);
      set({ error: error.message, loading: false });
      toast.error("Failed to fetch teacher workload data");
    }
  },

  // ===========================================
  // REAL-TIME KPIs METHODS
  // ===========================================

  // Fetch active students count
  fetchActiveStudentsCount: async (className = "") => {
    set({ loading: true, error: null });
    try {
      const query = className ? `?class=${className}` : "";
      const { data } = await axios.get(`/analytics/active-students-count${query}`);
      set({ activeStudentsCount: data, loading: false });
    } catch (error) {
      console.error("Fetch active students count error:", error);
      set({ error: error.message, loading: false });
      toast.error("Failed to fetch active students data");
    }
  },

  // Fetch pending admissions count
  fetchPendingAdmissionsCount: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await axios.get("/analytics/pending-admissions-count");
      set({ pendingAdmissionsCount: data, loading: false });
    } catch (error) {
      console.error("Fetch pending admissions count error:", error);
      set({ error: error.message, loading: false });
      toast.error("Failed to fetch pending admissions data");
    }
  },

  // Fetch upcoming events
  fetchUpcomingEvents: async (limit = 10, category = "") => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (limit) params.append("limit", limit);
      if (category) params.append("category", category);
      
      const query = params.toString();
      const { data } = await axios.get(`/analytics/upcoming-events${query ? `?${query}` : ""}`);
      set({ upcomingEvents: data, loading: false });
    } catch (error) {
      console.error("Fetch upcoming events error:", error);
      set({ error: error.message, loading: false });
      toast.error("Failed to fetch upcoming events data");
    }
  },

  // Fetch dashboard summary
  fetchDashboardSummary: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await axios.get("/analytics/dashboard-summary");
      set({ 
        dashboardSummary: data.success ? data.data : {}, 
        loading: false 
      });
    } catch (error) {
      console.error("Fetch dashboard summary error:", error);
      set({ error: error.message, loading: false });
      toast.error("Failed to fetch dashboard summary data");
    }
  },

  // ===========================================
  // BULK DATA FETCHING METHODS
  // ===========================================

  // Fetch all student analytics data
  fetchAllStudentAnalytics: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      console.log("Fetching student analytics...");
      await Promise.all([
        get().fetchStudentsByClass(),
        get().fetchStudentsBySection(filters.class),
        get().fetchAdmissionTrends(filters.year, filters.status),
        get().fetchAttendancePatterns(filters.startDate, filters.endDate, filters.class),
        get().fetchAttendanceSummary(filters.startDate, filters.endDate)
      ]);
      console.log("Student analytics fetched successfully");
      set({ loading: false });
    } catch (error) {
      console.error("Fetch all student analytics error:", error);
      set({ error: error.message, loading: false });
      toast.error("Failed to fetch student analytics data");
    }
  },

  // Fetch all financial analytics data
  fetchAllFinancialAnalytics: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      await Promise.all([
        get().fetchFeeCollectionRates(filters.year, filters.class),
        get().fetchOutstandingPayments(filters.class, filters.limit),
        get().fetchPaymentMethodsAnalysis(filters.year, filters.class),
        get().fetchFeeStructureByClass(filters.academicYear),
        get().fetchLateFeeAnalytics(filters.year, filters.class)
      ]);
      set({ loading: false });
    } catch (error) {
      console.error("Fetch all financial analytics error:", error);
      set({ error: error.message, loading: false });
      toast.error("Failed to fetch financial analytics data");
    }
  },

  // Fetch all academic performance data
  fetchAllAcademicPerformance: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      await Promise.all([
        get().fetchAssignmentCompletionRates(filters.class, filters.section),
        get().fetchTeacherWorkload()
      ]);
      set({ loading: false });
    } catch (error) {
      console.error("Fetch all academic performance error:", error);
      set({ error: error.message, loading: false });
      toast.error("Failed to fetch academic performance data");
    }
  },

  // Fetch all real-time KPIs data
  fetchAllRealTimeKPIs: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      await Promise.all([
        get().fetchActiveStudentsCount(filters.class),
        get().fetchPendingAdmissionsCount(),
        get().fetchUpcomingEvents(filters.limit, filters.category),
        get().fetchDashboardSummary()
      ]);
      set({ loading: false });
    } catch (error) {
      console.error("Fetch all real-time KPIs error:", error);
      set({ error: error.message, loading: false });
      toast.error("Failed to fetch real-time KPIs data");
    }
  },

  // Fetch all analytics data
  fetchAllAnalytics: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      console.log("Starting to fetch all analytics...");
      await Promise.all([
        get().fetchAllStudentAnalytics(filters),
        get().fetchAllFinancialAnalytics(filters),
        get().fetchAllAcademicPerformance(filters),
        get().fetchAllRealTimeKPIs(filters)
      ]);
      console.log("All analytics fetched successfully");
      set({ loading: false });
    } catch (error) {
      console.error("Fetch all analytics error:", error);
      set({ error: error.message, loading: false });
      toast.error("Failed to fetch analytics data");
    }
  },

  // ===========================================
  // FILTER MANAGEMENT
  // ===========================================

  // Update filters
  updateFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    }));
  },

  // Reset filters
  resetFilters: () => {
    set({
      filters: {
        year: new Date().getFullYear(),
        class: "",
        section: "",
        startDate: "",
        endDate: "",
        category: "",
        limit: 50
      }
    });
  },

  // ===========================================
  // UTILITY METHODS
  // ===========================================

  // Clear error
  clearError: () => set({ error: null }),

  // Reset store
  resetAnalyticalStore: () => set({
    loading: false,
    error: null,
    studentsByClass: [],
    studentsBySection: [],
    admissionTrends: [],
    attendancePatterns: [],
    attendanceSummary: [],
    feeCollectionRates: [],
    outstandingPayments: [],
    paymentMethodsAnalysis: [],
    feeStructureByClass: [],
    lateFeeAnalytics: [],
    assignmentCompletionRates: [],
    teacherWorkload: [],
    activeStudentsCount: { totalStudents: 0, activeStudents: 0, inactiveStudents: 0 },
    pendingAdmissionsCount: { totalPending: 0, totalProcessed: 0, totalApplications: 0, statusBreakdown: [] },
    upcomingEvents: [],
    dashboardSummary: {},
    filters: {
      year: new Date().getFullYear(),
      class: "",
      section: "",
      startDate: "",
      endDate: "",
      category: "",
      limit: 50
    }
  }),

  // Get computed analytics
  getComputedAnalytics: () => {
    const state = get();
    const dashboardData = state.dashboardSummary || {};
    
    // Calculate total outstanding from outstandingPayments array
    const totalOutstanding = state.outstandingPayments?.reduce((sum, payment) => sum + (payment.totalOutstanding || 0), 0) || 0;
    const totalCollected = dashboardData.totalFeeCollected || 0;
    
    return {
      // Basic metrics
      totalStudents: dashboardData.totalStudents || 0,
      totalTeachers: dashboardData.totalTeachers || 0,
      totalParents: dashboardData.totalParents || 0,
      pendingAdmissions: dashboardData.pendingAdmissions || 0,
      upcomingEvents: dashboardData.upcomingEvents || 0,
      recentPayments: dashboardData.recentPayments || 0,
      attendanceToday: dashboardData.attendanceToday || 0,
      activeStudents: state.activeStudentsCount?.activeStudents || 0,
      inactiveStudents: state.activeStudentsCount?.inactiveStudents || 0,
      totalOutstanding: totalOutstanding,
      totalCollected: totalCollected,
      pendingOfflinePayments: dashboardData.pendingOfflinePayments || 0,
      academicYear: dashboardData.academicYear || new Date().getFullYear(),
      
      // Chart data
      studentsByClass: state.studentsByClass || [],
      studentsBySection: state.studentsBySection || [],
      admissionTrends: state.admissionTrends || [],
      attendanceSummary: state.attendanceSummary || [],
      feeCollectionRates: state.feeCollectionRates || [],
      outstandingPayments: state.outstandingPayments || [],
      paymentMethodsAnalysis: state.paymentMethodsAnalysis || [],
      upcomingEvents: state.upcomingEvents || [],
      admissionStatusBreakdown: dashboardData.admissionStatusBreakdown || [],
      monthlyAttendance: dashboardData.monthlyAttendance || [],
      feeStructureByClass: state.feeStructureByClass || [],
      lateFeeAnalytics: state.lateFeeAnalytics || [],
      
      // Calculated metrics
      collectionRate: totalCollected > 0 ? 
        ((totalCollected / (totalCollected + totalOutstanding)) * 100).toFixed(1) : 0,
      averageAttendance: state.attendanceSummary?.length > 0 ? 
        (state.attendanceSummary.reduce((sum, item) => sum + (item.attendanceRate || 0), 0) / state.attendanceSummary.length).toFixed(1) : 0,
      
      // Additional computed metrics
      totalRevenue: totalCollected + totalOutstanding,
      collectionEfficiency: totalCollected > 0 ? Math.round((totalCollected / (totalCollected + totalOutstanding)) * 100) : 0,
      averageOutstandingPerStudent: state.outstandingPayments?.length > 0 ? 
        Math.round(totalOutstanding / state.outstandingPayments.length) : 0,
      studentGrowthRate: state.admissionTrends?.length > 0 ? 
        state.admissionTrends.reduce((sum, month) => sum + (month.count || 0), 0) : 0
    };
  }
}));
