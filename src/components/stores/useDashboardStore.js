import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useDashboardStore = create((set, get) => ({
  // ===========================================
  // STATE MANAGEMENT
  // ===========================================
  loading: false,
  error: null,
  
  // Dashboard Analytics State
  dashboardData: {
    totalStudents: 0,
    totalTeachers: 0,
    totalParents: 0,
    totalEmployees: 0,
    totalAdmissions: 0,
    totalEvents: 0,
    studentsByClass: [],
    attendanceSummary: {
      totalPresent: 0,
      totalAbsent: 0,
      totalLate: 0,
      notMarked: 0
    },
    financialSummary: {
      totalCollected: 0,
      totalLateFees: 0,
      totalPayments: 0,
      todayIncome: 0,
      todayLateFees: 0,
      monthlyIncome: 0,
      monthlyLateFees: 0
    },
    monthlyFeeData: [],
    todayStudentBirthdays: 0,
    todayStaffBirthdays: 0,
    teacherSummary: {
      teachers: 0,
      admins: 0,
      librarians: 0,
      otherStaff: 0
    },
    academicYear: new Date().getFullYear()
  },
  
  // Income vs Expense Data
  incomeExpenseData: [],
  
  // Attendance Inspection Data
  attendanceInspectionData: [],
  
  // Annual Fee Summary Data
  annualFeeSummary: {
    monthlyData: [],
    totals: {
      totalDues: 0,
      totalCollected: 0,
      totalRemaining: 0
    }
  },

  // ===========================================
  // DASHBOARD ANALYTICS METHODS
  // ===========================================

  // Fetch comprehensive dashboard analytics
  fetchDashboardAnalytics: async (academicYear = null) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (academicYear) params.append("academicYear", academicYear);
      
      const query = params.toString();
      const { data } = await axios.get(`/dashboard/analytics${query ? `?${query}` : ""}`);
      
      if (data.success) {
        set({ 
          dashboardData: data.data, 
          loading: false 
        });
      } else {
        throw new Error(data.message || "Failed to fetch dashboard analytics");
      }
    } catch (error) {
      console.error("Fetch dashboard analytics error:", error);
      set({ error: error.message, loading: false });
      toast.error("Failed to fetch dashboard analytics");
    }
  },

  // Fetch income vs expense data
  fetchIncomeExpenseData: async (days = 10) => {
    set({ loading: true, error: null });
    try {
      const { data } = await axios.get(`/dashboard/income-expense?days=${days}`);
      
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
      set({ error: error.message, loading: false });
      toast.error("Failed to fetch income expense data");
    }
  },

  // Fetch attendance inspection data
  fetchAttendanceInspectionData: async (days = 7) => {
    set({ loading: true, error: null });
    try {
      const { data } = await axios.get(`/dashboard/attendance-inspection?days=${days}`);
      
      if (data.success) {
        set({ 
          attendanceInspectionData: data.data, 
          loading: false 
        });
      } else {
        throw new Error(data.message || "Failed to fetch attendance inspection data");
      }
    } catch (error) {
      console.error("Fetch attendance inspection data error:", error);
      set({ error: error.message, loading: false });
      toast.error("Failed to fetch attendance inspection data");
    }
  },

  // Fetch annual fee summary
  fetchAnnualFeeSummary: async (year = null) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (year) params.append("year", year);
      
      const query = params.toString();
      const { data } = await axios.get(`/dashboard/annual-fee-summary${query ? `?${query}` : ""}`);
      
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
      set({ error: error.message, loading: false });
      toast.error("Failed to fetch annual fee summary");
    }
  },

  // Fetch all dashboard data
  fetchAllDashboardData: async (academicYear = null, days = 10) => {
    set({ loading: true, error: null });
    try {
      await Promise.all([
        get().fetchDashboardAnalytics(academicYear),
        get().fetchIncomeExpenseData(days),
        get().fetchAttendanceInspectionData(7),
        get().fetchAnnualFeeSummary(academicYear)
      ]);
      set({ loading: false });
    } catch (error) {
      console.error("Fetch all dashboard data error:", error);
      set({ error: error.message, loading: false });
      toast.error("Failed to fetch dashboard data");
    }
  },

  // ===========================================
  // UTILITY METHODS
  // ===========================================

  // Clear error
  clearError: () => set({ error: null }),

  // Reset store
  resetDashboardStore: () => set({
    loading: false,
    error: null,
    dashboardData: {
      totalStudents: 0,
      totalTeachers: 0,
      totalParents: 0,
      totalEmployees: 0,
      totalAdmissions: 0,
      totalEvents: 0,
      studentsByClass: [],
      attendanceSummary: {
        totalPresent: 0,
        totalAbsent: 0,
        totalLate: 0,
        notMarked: 0
      },
      financialSummary: {
        totalCollected: 0,
        totalLateFees: 0,
        totalPayments: 0,
        todayIncome: 0,
        todayLateFees: 0,
        monthlyIncome: 0,
        monthlyLateFees: 0
      },
      monthlyFeeData: [],
      todayStudentBirthdays: 0,
      todayStaffBirthdays: 0,
      teacherSummary: {
        teachers: 0,
        admins: 0,
        librarians: 0,
        otherStaff: 0
      },
      academicYear: new Date().getFullYear()
    },
    incomeExpenseData: [],
    attendanceInspectionData: [],
    annualFeeSummary: {
      monthlyData: [],
      totals: {
        totalDues: 0,
        totalCollected: 0,
        totalRemaining: 0
      }
    }
  })
}));
