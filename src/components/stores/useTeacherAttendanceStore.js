import { create } from "zustand";
import axios from "../lib/axios";
import { persist } from "zustand/middleware";

export const useTeacherAttendanceStore = create(
  persist(
    (set, get) => ({
      // ===========================================
      // STATE
      // ===========================================
      loading: false,
      error: null,
      
      // Admin data
      allTeachers: [],
      allTeachersAttendance: [],
      teachersWithoutAttendance: [],
      monthlyReport: [],
      attendanceSummary: null,
      attendanceStatistics: null,
      lastSubmissionSummary: null,
      
      // Teacher data
      teacherAttendanceHistory: [],
      teacherAttendanceSummary: null,
      todayAttendanceStatus: null,
      
      // Pagination
      pagination: {
        current: 1,
        pages: 1,
        total: 0,
        limit: 30
      },
      
      // Filters
      filters: {
        startDate: '',
        endDate: '',
        teacherId: '',
        status: '',
        subject: ''
      },

      // ===========================================
      // ADMIN FUNCTIONS
      // ===========================================

      // Get all teachers (admin only)
      getAllTeachers: async () => {
        set({ loading: true, error: null });
        try {
          const res = await axios.get("/teachers");
          const teachers = res.data.teachers || [];
          
          set({
            allTeachers: teachers,
            loading: false
          });
          
          return { success: true, data: teachers };
        } catch (error) {
          console.error("Failed to fetch all teachers:", error);
          set({
            error: error.response?.data?.message || "Unable to fetch teachers",
            loading: false
          });
          return { success: false, error: error.response?.data?.message || "Unable to fetch teachers" };
        }
      },

      // Mark teacher attendance (admin only) - handles both single and bulk like student attendance
      markTeacherAttendance: async (attendanceData) => {
        set({ loading: true, error: null });
        try {
          // Always send as array like student attendance
          const payload = Array.isArray(attendanceData) ? { attendanceData } : { attendanceData: [attendanceData] };
          console.log("payload in storeeeeeeee", payload);
          const res = await axios.post("/teacher-attendance/admin/mark", payload);
          
          // Store the summary data from the response
          if (res.data.summary) {
            set({ lastSubmissionSummary: res.data.summary });
          }
          
          // Refresh the attendance list after successful submission
          const { getAllTeachersAttendance } = get();
          await getAllTeachersAttendance();
          
          return { success: true, data: res.data };
        } catch (error) {
          console.error("Failed to mark teacher attendance:", error);
          set({
            error: error.response?.data?.message || "Unable to mark attendance",
            loading: false
          });
          return { success: false, error: error.response?.data?.message || "Unable to mark attendance" };
        }
      },

      // Get all teachers' attendance (admin only)
      getAllTeachersAttendance: async (params = {}) => {
        set({ loading: true, error: null });
        try {
          const queryParams = new URLSearchParams();
          
          // Add date filter if provided
          if (params.date) {
            queryParams.append('startDate', params.date);
            queryParams.append('endDate', params.date);
          }
          
          // Add other filters
          const { filters } = get();
          if (filters?.startDate) queryParams.append('startDate', filters.startDate);
          if (filters?.endDate) queryParams.append('endDate', filters.endDate);
          if (filters?.teacherId) queryParams.append('teacherId', filters.teacherId);
          if (filters?.status) queryParams.append('status', filters.status);
          if (filters?.subject) queryParams.append('subject', filters.subject);
          
          // Add pagination
          queryParams.append('page', params.page || 1);
          queryParams.append('limit', params.limit || 30);
          
          const res = await axios.get(`/teacher-attendance/admin/all?${queryParams}`);
          const { data = [], pagination = { current: 1, pages: 1, total: 0, limit: 30 } } = res.data;
          
          set({
            allTeachersAttendance: data,
            pagination,
            loading: false
          });
          
          return { success: true, data, pagination };
        } catch (error) {
          console.error("Failed to fetch all teachers attendance:", error);
          set({
            error: error.response?.data?.message || "Unable to fetch attendance data",
            loading: false
          });
          return { success: false, error: error.response?.data?.message || "Unable to fetch attendance data" };
        }
      },

      // Update teacher attendance (admin only)
      updateTeacherAttendance: async (attendanceId, updateData) => {
        set({ loading: true, error: null });
        try {
          const res = await axios.put(`/teacher-attendance/admin/update/${attendanceId}`, updateData);
          const updatedAttendance = res.data.data;
          
          // Update the attendance in the list
          set((state) => ({
            allTeachersAttendance: state.allTeachersAttendance.map(attendance =>
              attendance._id === attendanceId ? updatedAttendance : attendance
            ),
            loading: false
          }));
          
          return { success: true, data: updatedAttendance };
        } catch (error) {
          console.error("Failed to update teacher attendance:", error);
          set({
            error: error.response?.data?.message || "Unable to update attendance",
            loading: false
          });
          return { success: false, error: error.response?.data?.message || "Unable to update attendance" };
        }
      },

      // Delete teacher attendance (admin only)
      deleteTeacherAttendance: async (attendanceId) => {
        set({ loading: true, error: null });
        try {
          await axios.delete(`/teacher-attendance/admin/delete/${attendanceId}`);
          
          // Remove from the list
          set((state) => ({
            allTeachersAttendance: state.allTeachersAttendance.filter(
              attendance => attendance._id !== attendanceId
            ),
            loading: false
          }));
          
          return { success: true };
        } catch (error) {
          console.error("Failed to delete teacher attendance:", error);
          set({
            error: error.response?.data?.message || "Unable to delete attendance",
            loading: false
          });
          return { success: false, error: error.response?.data?.message || "Unable to delete attendance" };
        }
      },

      // Bulk mark attendance for multiple teachers (admin only)
      bulkMarkTeacherAttendance: async (attendanceDataArray) => {
        set({ loading: true, error: null });
        try {
          const res = await axios.post("/teacher-attendance/admin/bulk-mark", {
            attendanceData: attendanceDataArray
          });
          const { successful, errors, summary } = res.data.data;
          
          // Refresh the attendance list
          await get().getAllTeachersAttendance();
          
          set({ loading: false });
          return { success: true, data: { successful, errors, summary } };
        } catch (error) {
          console.error("Failed to bulk mark teacher attendance:", error);
          set({
            error: error.response?.data?.message || "Unable to bulk mark attendance",
            loading: false
          });
          return { success: false, error: error.response?.data?.message || "Unable to bulk mark attendance" };
        }
      },

      // Get teachers without attendance for a specific date (admin only)
      getTeachersWithoutAttendance: async (date) => {
        set({ loading: true, error: null });
        try {
          const res = await axios.get(`/teacher-attendance/admin/without-attendance?date=${date}`);
          const teachers = res.data.data;
          
          set({
            teachersWithoutAttendance: teachers,
            loading: false
          });
          
          return { success: true, data: teachers };
        } catch (error) {
          console.error("Failed to fetch teachers without attendance:", error);
          set({
            error: error.response?.data?.message || "Unable to fetch teachers without attendance",
            loading: false
          });
          return { success: false, error: error.response?.data?.message || "Unable to fetch teachers without attendance" };
        }
      },

      // Get monthly attendance report for all teachers (admin only)
      getMonthlyAttendanceReport: async (year, month) => {
        set({ loading: true, error: null });
        try {
          const res = await axios.get(`/teacher-attendance/admin/monthly-report?year=${year}&month=${month}`);
          const report = res.data.data;
          
          set({
            monthlyReport: report,
            loading: false
          });
          
          return { success: true, data: report };
        } catch (error) {
          console.error("Failed to fetch monthly attendance report:", error);
          set({
            error: error.response?.data?.message || "Unable to fetch monthly report",
            loading: false
          });
          return { success: false, error: error.response?.data?.message || "Unable to fetch monthly report" };
        }
      },

      // Get attendance summary for admin dashboard (admin only)
      getAttendanceSummary: async (startDate, endDate) => {
        set({ loading: true, error: null });
        try {
          const queryParams = new URLSearchParams();
          if (startDate) queryParams.append('startDate', startDate);
          if (endDate) queryParams.append('endDate', endDate);
          
          const res = await axios.get(`/teacher-attendance/admin/summary?${queryParams}`);
          const summary = res.data.data;
          
          set({
            attendanceSummary: summary,
            loading: false
          });
          
          return { success: true, data: summary };
        } catch (error) {
          console.error("Failed to fetch attendance summary:", error);
          set({
            error: error.response?.data?.message || "Unable to fetch attendance summary",
            loading: false
          });
          return { success: false, error: error.response?.data?.message || "Unable to fetch attendance summary" };
        }
      },

      // Get attendance statistics for dashboard (admin only)
      getAttendanceStatistics: async () => {
        set({ loading: true, error: null });
        try {
          const res = await axios.get("/teacher-attendance/admin/statistics");
          const statistics = res.data.data;
          
          set({
            attendanceStatistics: statistics,
            loading: false
          });
          
          return { success: true, data: statistics };
        } catch (error) {
          console.error("Failed to fetch attendance statistics:", error);
          set({
            error: error.response?.data?.message || "Unable to fetch attendance statistics",
            loading: false
          });
          return { success: false, error: error.response?.data?.message || "Unable to fetch attendance statistics" };
        }
      },

      // ===========================================
      // TEACHER FUNCTIONS
      // ===========================================

      // Get teacher's own attendance history
      getTeacherAttendanceHistory: async (params = {}) => {
        set({ loading: true, error: null });
        try {
          const queryParams = new URLSearchParams();
          
          // Add filters
          const { filters } = get();
          if (filters?.startDate) queryParams.append('startDate', filters.startDate);
          if (filters?.endDate) queryParams.append('endDate', filters.endDate);
          
          // Add pagination
          queryParams.append('page', params.page || 1);
          queryParams.append('limit', params.limit || 30);
          
          const res = await axios.get(`/teacher-attendance/teacher/history?${queryParams}`);
          const { data = [], pagination = { current: 1, pages: 1, total: 0, limit: 30 } } = res.data;
          
          set({
            teacherAttendanceHistory: data,
            pagination,
            loading: false
          });
          
          return { success: true, data, pagination };
        } catch (error) {
          console.error("Failed to fetch teacher attendance history:", error);
          set({
            error: error.response?.data?.message || "Unable to fetch attendance history",
            loading: false
          });
          return { success: false, error: error.response?.data?.message || "Unable to fetch attendance history" };
        }
      },

      // Get teacher's own attendance summary
      getTeacherAttendanceSummary: async (month, year, startDate, endDate) => {
        set({ loading: true, error: null });
        try {
          const queryParams = new URLSearchParams();
          if (month) queryParams.append('month', month);
          if (year) queryParams.append('year', year);
          if (startDate) queryParams.append('startDate', startDate);
          if (endDate) queryParams.append('endDate', endDate);
          
          const res = await axios.get(`/teacher-attendance/teacher/summary?${queryParams}`);
          const summary = res.data;
          
          set({
            teacherAttendanceSummary: summary,
            loading: false
          });
          
          return { success: true, data: summary };
        } catch (error) {
          console.error("Failed to fetch teacher attendance summary:", error);
          set({
            error: error.response?.data?.message || "Unable to fetch attendance summary",
            loading: false
          });
          return { success: false, error: error.response?.data?.message || "Unable to fetch attendance summary" };
        }
      },

      // Get today's attendance status for a teacher
      getTodayAttendanceStatus: async () => {
        set({ loading: true, error: null });
        try {
          const res = await axios.get("/teacher-attendance/teacher/today");
          const status = res.data.data;
          
          set({
            todayAttendanceStatus: status,
            loading: false
          });
          
          return { success: true, data: status };
        } catch (error) {
          console.error("Failed to fetch today's attendance status:", error);
          set({
            error: error.response?.data?.message || "Unable to fetch today's attendance status",
            loading: false
          });
          return { success: false, error: error.response?.data?.message || "Unable to fetch today's attendance status" };
        }
      },

      // ===========================================
      // UTILITY FUNCTIONS
      // ===========================================

      // Set filters
      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters }
        }));
      },

      // Clear filters
      clearFilters: () => {
        set({
          filters: {
            startDate: '',
            endDate: '',
            teacherId: '',
            status: '',
            subject: ''
          }
        });
      },

      // Clear all data
      clearAllData: () => {
        set({
          allTeachers: [],
          allTeachersAttendance: [],
          teachersWithoutAttendance: [],
          monthlyReport: [],
          attendanceSummary: null,
          attendanceStatistics: null,
          lastSubmissionSummary: null,
          teacherAttendanceHistory: [],
          teacherAttendanceSummary: null,
          todayAttendanceStatus: null,
          pagination: {
            current: 1,
            pages: 1,
            total: 0,
            limit: 30
          }
        });
      },

      // Clear errors
      clearErrors: () => {
        set({
          error: null
        });
      },

      // ===========================================
      // HELPER FUNCTIONS
      // ===========================================

      // Get attendance status color
      getStatusColor: (status) => {
        const colors = {
          present: 'green',
          absent: 'red',
          late: 'orange',
          'half-day': 'yellow',
          'sick-leave': 'blue',
          'personal-leave': 'purple',
          'emergency-leave': 'pink'
        };
        return colors[status] || 'gray';
      },

      // Get attendance status label
      getStatusLabel: (status) => {
        const labels = {
          present: 'Present',
          absent: 'Absent',
          late: 'Late',
          'half-day': 'Half Day',
          'sick-leave': 'Sick Leave',
          'personal-leave': 'Personal Leave',
          'emergency-leave': 'Emergency Leave'
        };
        return labels[status] || status;
      },

      // Format date for display
      formatDate: (date) => {
        return new Date(date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      },

      // Format date for API
      formatDateForAPI: (date) => {
        return new Date(date).toISOString().split('T')[0];
      },

      // Get current date
      getCurrentDate: () => {
        return new Date().toISOString().split('T')[0];
      },

      // Get current month and year
      getCurrentMonthYear: () => {
        const now = new Date();
        return {
          month: now.getMonth() + 1,
          year: now.getFullYear()
        };
      }
    }),
    { name: "teacher-attendance-store" }
  )
);
