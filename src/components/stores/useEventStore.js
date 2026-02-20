// stores/useEventStore.js
import { create } from "zustand";
import axios from "../lib/axios";
import toast from "react-hot-toast";

export const useEventStore = create((set) => ({
  events: [],
  loading: false,

  fetchEvents: async () => {
    set({ loading: true });
    try {
      const res = await axios.get("/events");
      set({ events: res.data, loading: false });
    } catch (err) {
      set({ loading: false });
      toast.error("Failed to fetch events");
    }
  },

  createEvent: async (eventData) => {
    set({ loading: true });
    try {
      const res = await axios.post("/events", eventData);
      set((prev) => ({
        events: [...prev.events, res.data],
        loading: false,
      }));
      toast.success("Event created");
    } catch (err) {
      set({ loading: false });
      toast.error(err.response?.data?.message || "Event creation failed");
    }
  },

  deleteEvent: async (id) => {
    set({ loading: true });
    try {
      await axios.delete(`/events/${id}`);
      set((prev) => ({
        events: prev.events.filter((event) => event._id !== id),
        loading: false,
      }));
      toast.success("Event deleted");
    } catch (err) {
      set({ loading: false });
      toast.error("Delete failed");
    }
  },

  toggleRSVP: async (id) => {
    try {
      const res = await axios.patch(`/events/${id}/rsvp`);
      set((prev) => ({
        events: prev.events.map((event) =>
          event._id === id ? res.data : event
        ),
      }));
    } catch (err) {
      toast.error("RSVP update failed");
    }
  },
}));
