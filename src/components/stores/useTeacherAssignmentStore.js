import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useTeacherAssignmentStore = create((set) => ({
  uploading: false,
  evaluating: false,
  updatingDueDate: false,
  updatingAssignment: false,
  submissions: [],
  evaluations: [],
  assignments: [],
  assignmentTotalMarks: null,
  error: null,

  // ✅ Fetch all teacher's assignments
  fetchAssignments: async () => {
    try {
      const res = await axios.get("/assignments/teacher");
      set({ assignments: res.data.assignments });
    } catch (err) {
      console.error("Fetch assignments error:", err);
    }
  },

  // ✅ Upload new assignment — returns { success: true } on success, { success: false } on error
  uploadAssignment: async (formData) => {
    try {
      set({ uploading: true, error: null });
      const res = await axios.post("/assignments/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(res.data.message || "Assignment uploaded");
      return { success: true };
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(err.response?.data?.message || "Upload failed");
      set({ error: err.response?.data?.message || "Upload failed" });
      return { success: false };
    } finally {
      set({ uploading: false });
    }
  },

  // ✅ Evaluate a student submission
 evaluateAssignment: async ({ assignmentId, studentId, marks, feedback }) => {
  try {
    set({ evaluating: true, error: null });
    const res = await axios.post("/assignments/evaluate", {
      assignmentId,
      studentId,
      marks,
      feedback,
    });

    toast.success("Evaluation saved");

    set((state) => ({
      evaluations: [
        ...state.evaluations.filter(
          (e) => e.studentId?.toString() !== studentId.toString()
        ),
        { studentId: studentId.toString(), marks, feedback },
      ],
    }));
  } catch (err) {
    console.error("Evaluation error:", err);
    toast.error(err.response?.data?.message || "Evaluation failed");
    set({ error: err.response?.data?.message || "Evaluation failed" });
  } finally {
    set({ evaluating: false });
  }
},


  // ✅ Fetch submissions and evaluations
  fetchSubmissions: async (assignmentId) => {
    try {
      console.log('Fetching submissions for assignment:', assignmentId);
      const res = await axios.get(`/assignments/${assignmentId}/submissions`);
      console.log('Submissions API response:', res.data);
      
      set({
        submissions: res.data.submissions || [],
        evaluations: res.data.evaluations || [],
        assignmentTotalMarks: res.data.totalMarks != null ? res.data.totalMarks : null,
        error: null,
      });
      
      console.log('Store updated with submissions:', res.data.submissions);
      console.log('Store updated with evaluations:', res.data.evaluations);
    } catch (err) {
      console.error("Fetch submissions error:", err);
      toast.error("Failed to fetch submissions");
      set({ error: err.response?.data?.message || "Error fetching submissions" });
    }
  },

  // ✅ Clear both submissions and evaluations
  clearSubmissions: () =>
    set({
      submissions: [],
      evaluations: [],
      assignmentTotalMarks: null,
    }),

  // ✅ Update assignment due date only (legacy)
  updateDueDate: async (assignmentId, newDueDate) => {
    try {
      set({ updatingDueDate: true });
      await axios.patch(`/assignments/${assignmentId}/update-due-date`, { newDueDate });
      toast.success("Due date updated");
      set((state) => ({
        assignments: state.assignments.map((a) =>
          a._id === assignmentId ? { ...a, dueDate: newDueDate } : a
        ),
      }));
    } catch (err) {
      console.error("Update due date error:", err);
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      set({ updatingDueDate: false });
    }
  },

  // ✅ Update assignment (all fields: title, description, dueDate, className, section, optional files)
  updateAssignment: async (assignmentId, data) => {
    try {
      set({ updatingAssignment: true });
      const hasFiles = data.files?.length > 0;
      const hasRemovedFiles = data.removedAttachments?.length > 0;
      let res;

      if (hasFiles) {
        const formData = new FormData();
        formData.append("title", data.title ?? "");
        formData.append("description", data.description ?? "");
        formData.append("dueDate", (data.dueDate != null && data.dueDate !== "") ? data.dueDate : "");
        formData.append("className", data.className ?? "");
        formData.append("section", data.section ?? "");
        formData.append("totalMarks", data.totalMarks ?? "");
        if (hasRemovedFiles) {
          formData.append("removedAttachments", JSON.stringify(data.removedAttachments));
        }
        data.files.forEach((f) => formData.append("pdfs", f));
        res = await axios.patch(`/assignments/${assignmentId}/update`, formData);
      } else {
        res = await axios.patch(`/assignments/${assignmentId}/update`, {
          title: data.title ?? "",
          description: data.description ?? "",
          dueDate: (data.dueDate != null && data.dueDate !== "") ? data.dueDate : "",
          className: data.className ?? "",
          section: data.section ?? "",
          totalMarks: data.totalMarks ?? "",
          removedAttachments: data.removedAttachments || [],
        });
      }

      toast.success(res.data.message || "Assignment updated");
      const d = data;
      const updatedAttachments = res.data.assignment?.attachments;
      set((state) => ({
        assignments: state.assignments.map((a) =>
          a._id === assignmentId
            ? {
                ...a,
                title: d.title,
                description: d.description,
                dueDate: d.dueDate,
                class: d.className,
                className: d.className,
                section: d.section,
                totalMarks: d.totalMarks ? Number(d.totalMarks) : null,
                ...(updatedAttachments != null && { attachments: updatedAttachments }),
              }
            : a
        ),
        updatingAssignment: false,
      }));
      return true;
    } catch (err) {
      console.error("Update assignment error:", err);
      toast.error(err.response?.data?.message || "Update failed");
      set({ updatingAssignment: false });
    }
  },
  // ✅ NEW: Delete an assignment (caller must handle confirmation; uses toast for success/error)
  deleteAssignment: async (assignmentId) => {
    try {
      const res = await axios.delete(`/assignments/${assignmentId}`);
      toast.success(res.data.message || "Assignment deleted");

      set((state) => ({
        assignments: state.assignments.filter((a) => a._id !== assignmentId),
      }));
    } catch (err) {
      console.error("Delete assignment error:", err);
      toast.error(err.response?.data?.message || "Failed to delete assignment");
    }
  },
}));
