// src/store/useCalendarStore.js
import { create } from "zustand";
import axios from "../lib/axios";

export const useCalendarStore = create((set, get) => ({
  events: [],
  holidays: [],
  loading: false,
  error: null,

  // ✅ Fetch all events (Google Calendar + School DB events)
  fetchEvents: async () => {
    try {
      set({ loading: true, error: null });

      const allEvents = [];

      // 1) Fetch from Google Calendar (if configured)
      try {
        const res = await axios.get("/calendar/list?all=true");
        const raw = res.data?.events ?? res.data?.data?.events ?? [];
        if (res.data?.message && raw.length === 0) {
          console.warn("⚠️ Calendar configuration warning:", res.data.message);
        }
        const googleEvents = (raw || []).map((e, index) => {
          const start = e.start?.dateTime || e.start?.date || null;
          const end = e.end?.dateTime || e.end?.date || null;
          if (!start || !end) return null;
          return {
            id: e.id || `google-event-${index}`,
            title: e.summary || e.title || "Untitled Event",
            description: e.description || "",
            location: e.location || "",
            start,
            end,
            category: e.extendedProperties?.private?.category || e.category || "General",
          };
        }).filter(Boolean);
        allEvents.push(...googleEvents);
      } catch (calendarErr) {
        console.warn("📅 Google Calendar fetch failed (may not be configured):", calendarErr?.response?.data || calendarErr.message);
      }

      // 2) Fetch from School Events API (DB) so admin-created events show on calendar
      try {
        const eventsRes = await axios.get("/events");
        const dbList = Array.isArray(eventsRes.data) ? eventsRes.data : eventsRes.data?.events || [];
        dbList.forEach((e) => {
          if (!e.date) return;
          // Build start/end in UTC so stored dates (UTC midnight + UTC time from backend) display correctly
          const startDate = new Date(e.date);
          const timeStr = (e.time || "09:00").toString().trim();
          const [hours = 9, minutes = 0] = timeStr.split(":").map(Number);
          startDate.setUTCHours(hours, minutes, 0, 0);
          let endDate;
          if (e.endDate && e.endTime) {
            endDate = new Date(e.endDate);
            const [endH = 9, endM = 0] = e.endTime.toString().trim().split(":").map(Number);
            endDate.setUTCHours(endH, endM, 0, 0);
          } else {
            endDate = new Date(startDate);
            endDate.setUTCHours(endDate.getUTCHours() + 1, endDate.getUTCMinutes(), 0, 0);
          }
          allEvents.push({
            id: `db-event-${e._id}`,
            title: e.title || "Untitled Event",
            description: e.description || "",
            location: e.location || "",
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            category: e.category || "General",
          });
        });
      } catch (eventsErr) {
        console.warn("📅 School events fetch failed:", eventsErr?.response?.data || eventsErr.message);
      }

      const events = allEvents.filter((e) => e && e.start && e.end);
      console.log("✅ Processed events for calendar:", events.length, "events");

      set({
        events,
        loading: false,
        error: null,
      });
    } catch (err) {
      console.error("❌ Fetch events error:", err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || "Failed to load events";
      set({ error: errorMessage, loading: false, events: [] });
    }
  },

  // ✅ Add new event
  addEvent: async (eventData) => {
    try {
      set({ loading: true, error: null });
      console.log("Creating event with data:", eventData);
      
      const res = await axios.post("/calendar/create", eventData);
      console.log("Event created successfully:", res.data);

      const newEvent = {
        id: res.data.event.id,
        title: res.data.event.summary,
        description: res.data.event.description,
        location: res.data.event.location,
        start: res.data.event.start?.dateTime || res.data.event.start?.date,
        end: res.data.event.end?.dateTime || res.data.event.end?.date,
        category: res.data.event.extendedProperties?.private?.category || eventData.category || 'General',
      };

      console.log("Adding new event to store:", newEvent);
      set({ events: [...get().events, newEvent], loading: false });
      return newEvent;
    } catch (err) {
      console.error("Add event error:", err);
      const errorMessage = err.response?.data?.error || "Failed to create event";
      set({ error: errorMessage, loading: false });
      throw err;
    }
  },

  // ✅ Update event
  updateEvent: async (eventId, updatedData) => {
    try {
      set({ loading: true, error: null });
      console.log("Updating event:", eventId, "with data:", updatedData);
      
      const res = await axios.put(`/calendar/events/${eventId}`, updatedData);
      console.log("Event updated successfully:", res.data);

      const updatedEvent = {
        id: res.data.event.id,
        title: res.data.event.summary,
        description: res.data.event.description,
        location: res.data.event.location,
        start: res.data.event.start?.dateTime || res.data.event.start?.date,
        end: res.data.event.end?.dateTime || res.data.event.end?.date,
        category: res.data.event.extendedProperties?.private?.category || updatedData.category || 'General',
      };

      console.log("Updating event in store:", updatedEvent);
      // replace old event with updated event
      set({
        events: get().events.map((e) => (e.id === eventId ? updatedEvent : e)),
        loading: false,
      });

      return updatedEvent;
    } catch (err) {
      console.error("Update event error:", err);
      const errorMessage = err.response?.data?.error || "Failed to update event";
      set({ error: errorMessage, loading: false });
      throw err;
    }
  },

  // ✅ Delete event
  deleteEvent: async (eventId) => {
    try {
      set({ loading: true, error: null });
      console.log("Deleting event:", eventId);
      
      await axios.delete(`/calendar/events/${eventId}`);
      console.log("Event deleted successfully");

      // remove from state
      set({
        events: get().events.filter((e) => e.id !== eventId),
        loading: false,
      });

      return true;
    } catch (err) {
      console.error("Delete event error:", err);
      const errorMessage = err.response?.data?.error || "Failed to delete event";
      set({ error: errorMessage, loading: false });
      throw err;
    }
  },

  // ✅ Refresh events
  refreshEvents: async () => {
    await get().fetchEvents();
  },

  // ✅ Fetch holidays (for calendar yellow cells and details)
  fetchHolidays: async (year = null) => {
    try {
      const params = year ? `?year=${year}` : "";
      const res = await axios.get(`/holidays${params}`);
      const list = res.data?.holidays ?? [];
      set({ holidays: list });
      return list;
    } catch (err) {
      console.warn("📅 Fetch holidays error:", err?.response?.data || err.message);
      set({ holidays: [] });
      return [];
    }
  },
}));
