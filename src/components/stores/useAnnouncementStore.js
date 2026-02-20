// stores/useAnnouncementStore.js
import { create } from "zustand";
import axios from "../lib/axios";
import toast from "react-hot-toast";

export const useAnnouncementStore = create((set) => ({
  announcements: [],
  loading: false,

  // Fetch announcements with filters
  fetchAnnouncements: async ({ search = "", category = "all", priority = "all" } = {}) => {
    set({ loading: true });
    try {
      const res = await axios.get("/announcements", {
        params: { search, category, priority },
      });
      
      // Ensure we always set a valid array and filter out any invalid entries
      const announcementsData = Array.isArray(res.data) 
        ? res.data.filter(announcement => announcement && announcement._id)
        : [];
      set({ announcements: announcementsData, loading: false });
    } catch (err) {
      console.error("Error fetching announcements:", err);
      set({ announcements: [], loading: false });
      toast.error("Failed to fetch announcements");
    }
  },

// Create new announcement
createAnnouncement: async (data) => {
  set({ loading: true }); // Set loading to true when starting
  try {
    const res = await axios.post("/announcements", data);

    const { announcement, message, queuedCount } = res.data;

    set((prev) => ({
      announcements: announcement && announcement._id 
        ? [announcement, ...prev.announcements]
        : prev.announcements,
      loading: false // Set loading to false on success
    }));

    const recipientLabel = data.recipientType === 'students' ? 'Students/Parents' : 
                          data.recipientType === 'teachers' ? 'Teachers' : 
                          'All (Students & Teachers)';
    
    toast.success(
      message || `Announcement created for ${recipientLabel} & ${queuedCount || 0} WhatsApp messages queued`
    );
  } catch (err) {
    set({ loading: false }); // Set loading to false on error
    toast.error(err.response?.data?.message || "Announcement creation failed");
  }
},


  // Toggle pinned status
  togglePin: async (id) => {
    set({ loading: true });
    try {
      const res = await axios.patch(`/announcements/${id}/pin`);
      set((prev) => ({
        announcements: prev.announcements.map((a) =>
          a && a._id === id && res.data && res.data._id ? res.data : a
        ),
        loading: false
      }));
    } catch (err) {
      set({ loading: false });
      toast.error("Toggle failed");
    }
  },

  // Delete announcement
  deleteAnnouncement: async (id) => {
    set({ loading: true });
    try {
      const res = await axios.delete(`/announcements/${id}`);
      set((prev) => ({
        announcements: prev.announcements.filter((a) => a._id !== id),
        loading: false
      }));
      toast.success(res.data.message || "Deleted successfully");
    } catch (err) {
      set({ loading: false });
      toast.error(err.response?.data?.message || "Delete failed");
    }
  },
}));
