// src/stores/usePeriodsStore.js
import { create } from "zustand";
import axios from "../lib/axios";
import toast from "react-hot-toast";

const useTeacherTimetableStore = create((set) => ({
  teacher: null,
  slots: [],
  days: [],
  periodsPerDay: 0,
  loading: false,
  error: null,

  // Fetch teacher timetable
  fetchTeacherTimetable: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get("/timetable/my-timetable", {
        withCredentials: true, // since you're using cookies/JWT
      });

      if (res.data.success) {
        set({
          teacher: res.data.teacher,
          slots: res.data.slots,
          days: res.data.days,
          periodsPerDay: res.data.periodsPerDay,
          loading: false,
        });
      } else {
        toast.error(res.data.message || "Failed to fetch timetable");
        set({ loading: false, error: res.data.message || "Error" });
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Something went wrong");
      set({
        loading: false,
        error: err.response?.data?.error || "Something went wrong",
      });
    }
  },

  resetTimetable: () =>
    set({
      teacher: null,
      slots: [],
      days: [],
      periodsPerDay: 0,
      loading: false,
      error: null,
    }),
}));

export default useTeacherTimetableStore;