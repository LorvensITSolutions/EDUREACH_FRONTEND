import { create } from "zustand";
import axios from "../lib/axios";
import { persist } from "zustand/middleware";
import toast from "react-hot-toast";

export const useAttendanceTeacherStore = create(
  persist(
    (set, get) => ({
      assignedStudents: [],
      attendanceRecords: [],
      assignedClasses: [], // Store teacher's assigned classes
      loading: false,
      error: null,

      fetchAssignedStudentsWithAttendance: async (date) => {
        set({ loading: true, error: null });
        try {
          const response = await axios.get("/teachers/students", {
            params: date ? { date } : {},
          });
          const { students, attendance, assignedClasses } = response.data;
          
          // Ensure we have valid data
          const validStudents = Array.isArray(students) ? students : [];
          const validAttendance = Array.isArray(attendance) ? attendance : [];
          
          set({ 
            assignedStudents: validStudents, 
            attendanceRecords: validAttendance,
            assignedClasses: assignedClasses || [], // Store assigned classes
            loading: false 
          });
        } catch (error) {
          console.error("Error fetching teacher's assigned students:", error);
          const errorMessage = error.response?.data?.message || "Failed to load students";
          set({ 
            error: errorMessage,
            assignedStudents: [],
            attendanceRecords: [],
            assignedClasses: [],
            loading: false 
          });
          toast.error(errorMessage);
        }
      },

      // Get attendance status for a specific student and date
      getStudentAttendanceStatus: (studentId, date) => {
        const { attendanceRecords } = get();
        return attendanceRecords.find(
          (record) => 
            record.student._id === studentId && 
            record.date.startsWith(date)
        );
      },

      // Get attendance summary for a date
      getAttendanceSummary: (date) => {
        const { assignedStudents, attendanceRecords } = get();
        const dateRecords = attendanceRecords.filter(record => 
          record.date.startsWith(date)
        );
        
        const submittedIds = dateRecords.map(record => record.student._id);
        const totalStudents = assignedStudents.length;
        const submittedCount = submittedIds.length;
        const pendingCount = totalStudents - submittedCount;
        
        const presentCount = dateRecords.filter(record => record.status === 'present').length;
        const absentCount = dateRecords.filter(record => record.status === 'absent').length;
        
        return {
          totalStudents,
          submittedCount,
          pendingCount,
          presentCount,
          absentCount,
          attendancePercentage: submittedCount > 0 ? ((presentCount / submittedCount) * 100).toFixed(1) : 0
        };
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },

      // Reset store
      reset: () => {
        set({
          assignedStudents: [],
          attendanceRecords: [],
          assignedClasses: [],
          loading: false,
          error: null,
        });
      },
    }),
    { 
      name: "teacher-attendance-store",
      partialize: (state) => ({
        assignedStudents: state.assignedStudents,
        attendanceRecords: state.attendanceRecords,
      }),
    }
  )
);
