import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useLeaveStore = create((set, get) => ({
  myLeaves: [],
  allLeaves: [],
  teacherLeaves: [], // ✅ New: Teacher-specific leaves
  leaveStatistics: null, // ✅ New: Leave statistics
  assignedStudents: [], // ✅ New: Assigned students list
  loading: false,

  // ✅ Apply leave (used by parent)
  applyLeave: async (leaveData) => {
    try {
      const { data } = await axios.post("/leaves/apply", leaveData);
      toast.success("Leave application submitted");
      // Optionally refresh parent leave list
      get().fetchMyLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit leave");
      console.error("Apply Leave Error:", err);
    }
  },

  // ✅ Fetch leaves submitted by this parent
  fetchMyLeaves: async () => {
    set({ loading: true });
    try {
      const { data } = await axios.get("/leaves/my-leaves");
      set({ myLeaves: data.leaves });
    } catch (err) {
      toast.error("Failed to fetch your leave applications");
      console.error("Fetch My Leaves Error:", err);
    } finally {
      set({ loading: false });
    }
  },

  // ✅ Fetch teacher's assigned students' leaves with statistics
  fetchTeacherLeaves: async () => {
    set({ loading: true });
    try {
      const { data } = await axios.get("/leaves/my-students");
      set({ 
        teacherLeaves: data.leaves,
        leaveStatistics: data.statistics,
        assignedStudents: data.assignedStudents
      });
    } catch (err) {
      toast.error("Failed to fetch assigned students' leave applications");
      console.error("Fetch Teacher Leaves Error:", err);
    } finally {
      set({ loading: false });
    }
  },

  // ✅ Fetch all leaves (for admin/teachers - now filtered by assigned students for teachers)
  fetchAllLeaves: async () => {
    set({ loading: true });
    try {
      const { data } = await axios.get("/leaves/all");
      set({ allLeaves: data.leaves });
    } catch (err) {
      toast.error("Failed to fetch leave applications");
      console.error("Fetch All Leaves Error:", err);
    } finally {
      set({ loading: false });
    }
  },

  // ✅ Update leave status (admin/teacher)
  updateLeaveStatus: async ({ leaveId, status, rejectionReason }) => {
    try {
      const { data } = await axios.patch(`/leaves/update-status/${leaveId}`, {
        status,
        rejectionReason,
      });

      // Update both allLeaves and teacherLeaves arrays
      set((state) => ({
        allLeaves: state.allLeaves.map((leave) =>
          leave._id === leaveId
            ? {
                ...leave,
                status,
                rejectionReason,
                approvedBy: data.leave?.approvedBy || leave.approvedBy,
              }
            : leave
        ),
        teacherLeaves: state.teacherLeaves.map((leave) =>
          leave._id === leaveId
            ? {
                ...leave,
                status,
                rejectionReason,
                approvedBy: data.leave?.approvedBy || leave.approvedBy,
              }
            : leave
        ),
        // Update statistics
        leaveStatistics: state.leaveStatistics ? {
          ...state.leaveStatistics,
          pending: status === 'approved' || status === 'rejected' 
            ? state.leaveStatistics.pending - 1 
            : state.leaveStatistics.pending,
          approved: status === 'approved' 
            ? state.leaveStatistics.approved + 1 
            : state.leaveStatistics.approved,
          rejected: status === 'rejected' 
            ? state.leaveStatistics.rejected + 1 
            : state.leaveStatistics.rejected,
        } : null
      }));

      toast.success(`Leave ${status} successfully`);
    } catch (error) {
      toast.error("Failed to update leave status");
      console.error("Update Leave Status Error:", error);
    }
  },

  // ✅ Helper: Get leaves based on user role
  getLeavesForRole: (userRole) => {
    const state = get();
    switch (userRole) {
      case 'admin':
        return state.allLeaves;
      case 'teacher':
        return state.teacherLeaves;
      case 'parent':
        return state.myLeaves;
      default:
        return [];
    }
  },

  // ✅ Helper: Get statistics for teachers
  getLeaveStatistics: () => {
    const state = get();
    return state.leaveStatistics;
  },

  // ✅ Helper: Get assigned students for teachers
  getAssignedStudents: () => {
    const state = get();
    return state.assignedStudents;
  },

}));
