import { create } from "zustand";
import axios from "../lib/axios";
import toast from "react-hot-toast";

export const useTeacherAnalyticsStore = create((set, get) => ({
  analyticsData: null,
  loading: false,
  error: null,
  lastUpdated: null,

  fetchTeacherAnalytics: async (params = {}) => {
    set({ loading: true, error: null });
    
    try {
      const response = await axios.get("/analytics/teacher-dashboard", {
        params: {
          academicYear: params.academicYear || null, // Will default to current in backend
          class: params.class || 'all',
          section: params.section || 'all',
          ...params
        }
      });

      const data = response.data.data || response.data;
      
      // Debug logging
      console.log('Frontend received data:', data);
      console.log('Assignment Stats:', data.assignmentStats);
      console.log('Student Progress:', data.studentProgress);
      
      // Transform data for charts
      const transformedData = {
        overview: data.overview,
        attendanceData: data.attendanceData,
        classPerformance: data.classPerformance,
        studentProgress: data.studentProgress,
        assignmentStats: data.assignmentStats,
        attendanceTrends: data.attendanceTrends,
        classComparison: data.classComparison,
        recentActivity: data.recentActivity,
        topStudents: data.topStudents
      };

      set({
        analyticsData: transformedData,
        loading: false,
        lastUpdated: new Date().toISOString()
      });

    } catch (error) {
      console.error("Error fetching teacher analytics:", error);
      const errorMessage = error.response?.data?.message || "Failed to load analytics data";
      
      set({
        error: errorMessage,
        loading: false
      });

      toast.error(errorMessage);
    }
  },

  refreshData: async () => {
    const currentParams = get().lastParams || {};
    await get().fetchTeacherAnalytics(currentParams);
  },

  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    set({
      analyticsData: null,
      loading: false,
      error: null,
      lastUpdated: null
    });
  }
}));
