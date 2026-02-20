// src/components/SchoolCalendar.jsx
import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useCalendarStore } from "../components/stores/useCalendarStore";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import axios from "./lib/axios";
import HolidayForm from "./admin/HolidayForm";
import {
  Plus,
  X,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  Trash,
  Edit,
} from "lucide-react";

// Dark yellow for holidays, blue for today
const HOLIDAY_BG = "#FF8C00"; // dark yellow/amber
const TODAY_BG = "#DBEAFE";   // light blue for present day

// Add mobile-responsive styles for FullCalendar (v6 day cells)
const calendarStyles = `
  .fc .fc-day-sun:not(.fc-day-today),
  .fc .fc-day-sunday:not(.fc-day-today) {
    background-color: #E5E7EB !important;
  }
  .fc .fc-day-sun:not(.fc-day-today) .fc-daygrid-day-frame,
  .fc .fc-day-sunday:not(.fc-day-today) .fc-daygrid-day-frame {
    background-color: #E5E7EB !important;
  }
  .fc .fc-day-today {
    background-color: ${TODAY_BG} !important;
  }
  .fc .fc-day-today .fc-daygrid-day-frame {
    background-color: ${TODAY_BG} !important;
  }
  .fc .fc-day-today .fc-daygrid-day-number,
  .fc .fc-day-today .fc-daygrid-day-top {
    color: #1e3a5f;
    font-weight: 600;
  }
  .fc .fc-day-today .fc-daygrid-day-number {
    border-radius: 50%;
    padding: 0.2em;
  }
  @media (max-width: 640px) {
    .fc-header-toolbar {
      flex-direction: column;
      gap: 0.5rem;
      align-items: flex-start !important;
    }
    .fc-toolbar-chunk {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
    }
    .fc-button-group {
      display: flex;
      flex-wrap: wrap;
    }
    .fc-button {
      padding: 0.375rem 0.5rem;
      font-size: 0.75rem;
    }
    .fc-toolbar-title {
      font-size: 1rem !important;
      margin: 0.5rem 0;
    }
    .fc-daygrid-day {
      min-height: 60px;
    }
    .fc-daygrid-day-number {
      padding: 0.25rem;
      font-size: 0.75rem;
    }
    .fc-event {
      font-size: 0.7rem;
      padding: 0.125rem 0.25rem;
    }
  }
`;

const SchoolCalendar = ({ readOnly = false }) => {
  const {
    events,
    holidays,
    fetchEvents,
    fetchHolidays,
    addEvent,
    updateEvent,
    deleteEvent,
    loading,
    error,
  } = useCalendarStore();

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [viewMode, setViewMode] = useState("calendar"); // "calendar" or "list"
  const [listTab, setListTab] = useState("events"); // "events" or "holidays" when in list view
  const [showHolidayForm, setShowHolidayForm] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [newEvent, setNewEvent] = useState({
    summary: "",
    description: "",
    location: "",
    startTime: "",
    endTime: "",
    category: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchEvents();
    fetchHolidays();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // ✅ Validation function
  const validateForm = () => {
    const newErrors = {};
    
    // Title validation
    if (!newEvent.summary.trim()) {
      newErrors.summary = "Event title is required";
    } else if (newEvent.summary.trim().length < 3) {
      newErrors.summary = "Event title must be at least 3 characters";
    } else if (newEvent.summary.trim().length > 100) {
      newErrors.summary = "Event title must be less than 100 characters";
    }

    // Description validation
    if (newEvent.description && newEvent.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters";
    }

    // Location validation
    if (newEvent.location && newEvent.location.length > 200) {
      newErrors.location = "Location must be less than 200 characters";
    }

    // Start time validation
    if (!newEvent.startTime) {
      newErrors.startTime = "Start time is required";
    }
    // Note: Removed past date restriction to allow creating historical events if needed

    // End time validation
    if (!newEvent.endTime) {
      newErrors.endTime = "End time is required";
    } else if (newEvent.startTime && newEvent.endTime) {
      const startDate = new Date(newEvent.startTime);
      const endDate = new Date(newEvent.endTime);
      if (endDate <= startDate) {
        newErrors.endTime = "End time must be after start time";
      }
    }

    // Category validation
    if (!newEvent.category) {
      newErrors.category = "Please select a category";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Add / Update
  const handleAddEvent = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formattedEvent = {
        ...newEvent,
        summary: newEvent.summary.trim(),
        description: newEvent.description.trim(),
        location: newEvent.location.trim(),
        startTime: new Date(newEvent.startTime).toISOString(),
        endTime: new Date(newEvent.endTime).toISOString(),
      };

      if (editingEvent) {
        await updateEvent(editingEvent.id, formattedEvent);
      } else {
        await addEvent(formattedEvent);
      }

      await fetchEvents();
      resetForm();
    } catch (error) {
      console.error("Error saving event:", error);
      setErrors({ submit: "Failed to save event. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Reset form function
  const resetForm = () => {
    setShowAddForm(false);
    setEditingEvent(null);
    setErrors({});
    setNewEvent({
      summary: "",
      description: "",
      location: "",
      startTime: "",
      endTime: "",
      category: "",
    });
  };

  // ✅ Delete
  const handleDeleteEvent = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      await deleteEvent(eventId);
      await fetchEvents();
      setSelectedEvent(null);
    }
  };

  return (
    <div className="p-2 sm:p-4 md:p-6 bg-gradient-to-br from-background via-white to-primary-light/10 min-h-screen">
      <style>{calendarStyles}</style>
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:justify-start sm:items-center sm:gap-4 md:gap-6 mb-4 sm:mb-5 md:mb-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold flex items-center gap-1.5 sm:gap-2 text-primary-dark">
          <CalendarIcon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary flex-shrink-0" />
          <span className="break-words">School Events Calendar</span>
        </h2>

        <div className="calendar-buttons-row flex flex-nowrap items-center gap-2 sm:gap-2.5 overflow-x-auto pb-1 min-w-0">
          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5 flex-shrink-0">
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition whitespace-nowrap ${
                viewMode === "calendar"
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <span className="hidden sm:inline">📅 Calendar</span>
              <span className="sm:hidden">📅</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition whitespace-nowrap ${
                viewMode === "list"
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <span className="hidden sm:inline">📋 List View</span>
              <span className="sm:hidden">📋</span>
            </button>
          </div>

          {/* Subscribe */}
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href={`https://calendar.google.com/calendar/u/0/r?cid=${encodeURIComponent(
              import.meta.env.VITE_CALENDAR_ID || "YOUR_CALENDAR_ID"
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 bg-success text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg shadow hover:bg-success/90 transition text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
          >
            <span className="hidden sm:inline">📅 Subscribe</span>
            <span className="sm:hidden">📅</span>
          </motion.a>

          {/* Sync */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchEvents}
            className="flex items-center justify-center gap-1.5 bg-info text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg shadow hover:bg-info/90 transition text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
          >
            <span className="hidden sm:inline">🔄 Sync Now</span>
            <span className="sm:hidden">🔄</span>
          </motion.button>

          {/* Add Event */}
          {!readOnly && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowAddForm(true);
                setEditingEvent(null);
              }}
              className="flex items-center justify-center gap-1.5 bg-primary text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg shadow hover:bg-primary-dark transition text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" /> 
              <span>Add Event</span>
            </motion.button>
          )}
          {/* Add Holiday */}
          {!readOnly && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowHolidayForm(true);
                setEditingHoliday(null);
              }}
              className="flex items-center justify-center gap-1.5 bg-amber-500 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg shadow hover:bg-amber-600 transition text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" /> 
              <span>Holiday</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-xl p-6 sm:p-7 md:p-8 text-center">
          <div className="inline-block w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-3 sm:mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Loading calendar events...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-xl p-4 sm:p-5 md:p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <p className="text-red-700 font-medium text-sm sm:text-base">⚠️ {error}</p>
            {error.includes("Calendar service is not configured") && (
              <p className="text-red-600 text-xs sm:text-sm mt-2">
                Please contact the administrator to configure Google Calendar integration.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Calendar */}
      {!loading && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-xl p-2 sm:p-3 md:p-4"
        >
          {/* Event Legend */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 pb-3 sm:pb-4">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-[#00796B] flex-shrink-0"></div>
              <span className="text-xs sm:text-sm text-gray-700">Upcoming Events</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-[#9E9E9E] flex-shrink-0"></div>
              <span className="text-xs sm:text-sm text-gray-700">Past Events</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded flex-shrink-0" style={{ backgroundColor: HOLIDAY_BG }}></div>
              <span className="text-xs sm:text-sm text-gray-700">Holidays</span>
          </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded flex-shrink-0" style={{ backgroundColor: TODAY_BG }}></div>
              <span className="text-xs sm:text-sm text-gray-700">Today</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded flex-shrink-0 bg-gray-200"></div>
              <span className="text-xs sm:text-sm text-gray-700">Sundays</span>
            </div>
          </div>          
          {/* Empty State Message */}
          {!loading && !error && events.length === 0 && (
            <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl">
              <p className="text-blue-700 text-xs sm:text-sm font-medium">
                📅 No events found in the calendar.
              </p>
              {!readOnly && (
                <p className="text-blue-600 text-xs mt-1">
                  Click 'Add Event' button above to create your first event.
                </p>
              )}
            </div>
          )}

          {/* List View */}
          {viewMode === "list" && (
            <div className="flex flex-col min-h-0">
              {/* Tabs: Events | Holidays */}
              <div className="flex border-b-2 border-gray-200 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setListTab("events")}
                  className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold transition-colors rounded-t-lg ${
                    listTab === "events"
                      ? "bg-primary text-white border-b-2 border-primary -mb-0.5"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Events
                </button>
                <button
                  type="button"
                  onClick={() => setListTab("holidays")}
                  className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold transition-colors rounded-t-lg ${
                    listTab === "holidays"
                      ? "bg-primary text-white border-b-2 border-primary -mb-0.5"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Holidays
                </button>
              </div>

              {/* Scrollable list area - sticky headers stick to top of this container */}
              <div className="overflow-y-auto max-h-[60vh] sm:max-h-[65vh] mt-3 sm:mt-4 -mx-1 px-1">
              {/* Events list */}
              {listTab === "events" && (
                <div className="space-y-4 sm:space-y-5">
              {events.length === 0 ? (
                <div className="text-center py-8 sm:py-10 md:py-12 text-gray-500">
                  <CalendarIcon className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-3 sm:mb-4 text-gray-300" />
                  <p className="text-sm sm:text-base">No events found</p>
                </div>
              ) : (
                    (() => {
                      const now = new Date();
                      const futureEvents = events
                        .filter((e) => new Date(e.end || e.start) >= now)
                        .sort((a, b) => new Date(a.start) - new Date(b.start));
                      const pastEvents = events
                        .filter((e) => new Date(e.end || e.start) < now)
                        .sort((a, b) => new Date(b.start) - new Date(a.start));
                      return (
                        <div className="space-y-4 sm:space-y-5">
                          {futureEvents.length > 0 && (
                            <div className="space-y-2 sm:space-y-3">
                              <h3 className="text-sm font-semibold text-primary uppercase tracking-wide sticky top-0 z-20 bg-white py-2 -mt-px border-b border-gray-100 shadow-sm">
                                Upcoming
                              </h3>
                              {futureEvents.map((event) => {
                    const eventStart = new Date(event.start);
                    const eventEnd = new Date(event.end || event.start);
                    const isPast = eventEnd < now;
                    const isToday = eventStart.toDateString() === now.toDateString();
                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border-2 cursor-pointer hover:shadow-lg transition-all ${
                          isPast
                            ? "border-gray-200 bg-gray-50"
                            : isToday
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-primary"
                        }`}
                        onClick={() => {
                          setSelectedEvent({
                            id: event.id,
                            title: event.title,
                            start: event.start,
                            end: event.end,
                            description: event.description,
                            location: event.location,
                            category: event.category,
                          });
                        }}
                      >
                        <div className="flex items-start justify-between gap-2 sm:gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
                              <div
                                className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0 ${
                                  isPast ? "bg-gray-400" : "bg-primary"
                                }`}
                                          />
                              <h3 className="text-base sm:text-lg font-bold text-gray-900 break-words">
                                {event.title}
                              </h3>
                              {event.category && (
                                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold bg-primary/10 text-primary rounded-md whitespace-nowrap">
                                  {event.category}
                                </span>
                              )}
                              {isToday && (
                                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold bg-primary text-white rounded-md whitespace-nowrap">
                                  Today
                                </span>
                              )}
                            </div>
                            <div className="ml-4 sm:ml-6 space-y-1 text-xs sm:text-sm text-gray-600">
                              <p className="flex items-start sm:items-center gap-1.5 sm:gap-2">
                                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5 sm:mt-0" />
                                <span className="break-words">
                                  {eventStart.toLocaleDateString("en-US", {
                                    weekday: "short",
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}{" "}
                                  {eventStart.toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                  {eventEnd &&
                                    ` - ${eventEnd.toLocaleTimeString("en-US", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}`}
                                </span>
                              </p>
                              {event.location && (
                                <p className="flex items-start sm:items-center gap-1.5 sm:gap-2">
                                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5 sm:mt-0" />
                                  <span className="break-words">{event.location}</span>
                                </p>
                              )}
                              {event.description && (
                                <p className="text-gray-500 line-clamp-2 break-words">
                                  {event.description}
                                </p>
                              )}
                            </div>
                          </div>
                          {!readOnly && (
                            <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowAddForm(true);
                                  setEditingEvent(event);
                                  const formatDateTimeLocal = (dateString) => {
                                    const date = new Date(dateString);
                                    const year = date.getFullYear();
                                    const month = String(date.getMonth() + 1).padStart(2, '0');
                                    const day = String(date.getDate()).padStart(2, '0');
                                    const hours = String(date.getHours()).padStart(2, '0');
                                    const minutes = String(date.getMinutes()).padStart(2, '0');
                                    return `${year}-${month}-${day}T${hours}:${minutes}`;
                                  };
                                  setNewEvent({
                                    summary: event.title,
                                    description: event.description || "",
                                    location: event.location || "",
                                    startTime: formatDateTimeLocal(event.start),
                                    endTime: formatDateTimeLocal(event.end || event.start),
                                    category: event.category || "",
                                  });
                                }}
                                className="p-1.5 sm:p-2 text-primary hover:bg-primary/10 rounded-lg transition"
                                title="Edit"
                              >
                                <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteEvent(event.id);
                                }}
                                className="p-1.5 sm:p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                title="Delete"
                              >
                                <Trash className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                              })}
                            </div>
                          )}
                          {pastEvents.length > 0 && (
                            <div className="space-y-2 sm:space-y-3">
                              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide sticky top-0 z-20 bg-white py-2 -mt-px border-b border-gray-100 shadow-sm">
                                Past
                              </h3>
                              {pastEvents.map((event) => {
                                const eventStart = new Date(event.start);
                                const eventEnd = new Date(event.end || event.start);
                                const isPast = true;
                                const isToday = eventStart.toDateString() === now.toDateString();
                                return (
                                  <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border-2 border-gray-200 bg-gray-50 cursor-pointer hover:shadow-lg transition-all"
                                    onClick={() => {
                                      setSelectedEvent({
                                        id: event.id,
                                        title: event.title,
                                        start: event.start,
                                        end: event.end,
                                        description: event.description,
                                        location: event.location,
                                        category: event.category,
                                      });
                                    }}
                                  >
                                    <div className="flex items-start justify-between gap-2 sm:gap-3">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
                                          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0 bg-gray-400" />
                                          <h3 className="text-base sm:text-lg font-bold text-gray-900 break-words">
                                            {event.title}
                                          </h3>
                                          {event.category && (
                                            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold bg-gray-200 text-gray-700 rounded-md whitespace-nowrap">
                                              {event.category}
                                            </span>
                                          )}
                                          {isToday && (
                                            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold bg-primary text-white rounded-md whitespace-nowrap">
                                              Today
                                            </span>
                                          )}
                                        </div>
                                        <div className="ml-4 sm:ml-6 space-y-1 text-xs sm:text-sm text-gray-600">
                                          <p className="flex items-start sm:items-center gap-1.5 sm:gap-2">
                                            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5 sm:mt-0" />
                                            <span className="break-words">
                                              {eventStart.toLocaleDateString("en-US", {
                                                weekday: "short",
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                              })}{" "}
                                              {eventStart.toLocaleTimeString("en-US", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                              })}
                                              {eventEnd &&
                                                ` - ${eventEnd.toLocaleTimeString("en-US", {
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                                })}`}
                                            </span>
                                          </p>
                                          {event.location && (
                                            <p className="flex items-start sm:items-center gap-1.5 sm:gap-2">
                                              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5 sm:mt-0" />
                                              <span className="break-words">{event.location}</span>
                                            </p>
                                          )}
                                          {event.description && (
                                            <p className="text-gray-500 line-clamp-2 break-words">
                                              {event.description}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                      {!readOnly && (
                                        <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setShowAddForm(true);
                                              setEditingEvent(event);
                                              const formatDateTimeLocal = (dateString) => {
                                                const date = new Date(dateString);
                                                const year = date.getFullYear();
                                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                                const day = String(date.getDate()).padStart(2, '0');
                                                const hours = String(date.getHours()).padStart(2, '0');
                                                const minutes = String(date.getMinutes()).padStart(2, '0');
                                                return `${year}-${month}-${day}T${hours}:${minutes}`;
                                              };
                                              setNewEvent({
                                                summary: event.title,
                                                description: event.description || "",
                                                location: event.location || "",
                                                startTime: formatDateTimeLocal(event.start),
                                                endTime: formatDateTimeLocal(event.end || event.start),
                                                category: event.category || "",
                                              });
                                            }}
                                            className="p-1.5 sm:p-2 text-primary hover:bg-primary/10 rounded-lg transition"
                                            title="Edit"
                                          >
                                            <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteEvent(event.id);
                                            }}
                                            className="p-1.5 sm:p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                            title="Delete"
                                          >
                                            <Trash className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })() )
                  }
                </div>
              )}

              {/* Holidays list */}
              {listTab === "holidays" && (
                <div className="space-y-4 sm:space-y-5">
                  {(holidays || []).length === 0 ? (
                    <div className="text-center py-8 sm:py-10 md:py-12 text-gray-500">
                      <CalendarIcon className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-3 sm:mb-4 text-gray-300" />
                      <p className="text-sm sm:text-base">No holidays found</p>
                    </div>
                  ) : (
                    (() => {
                      const today = new Date().toISOString().slice(0, 10);
                      const futureHolidays = [...(holidays || [])]
                        .filter((h) => {
                          const d = h.date;
                          const dateStr = typeof d === "string" ? d.slice(0, 10) : new Date(d).toISOString().slice(0, 10);
                          return dateStr >= today;
                        })
                        .sort((a, b) => {
                          const dA = typeof a.date === "string" ? a.date.slice(0, 10) : new Date(a.date).toISOString().slice(0, 10);
                          const dB = typeof b.date === "string" ? b.date.slice(0, 10) : new Date(b.date).toISOString().slice(0, 10);
                          return dA.localeCompare(dB);
                        });
                      const pastHolidays = [...(holidays || [])]
                        .filter((h) => {
                          const d = h.date;
                          const dateStr = typeof d === "string" ? d.slice(0, 10) : new Date(d).toISOString().slice(0, 10);
                          return dateStr < today;
                        })
                        .sort((a, b) => {
                          const dA = typeof a.date === "string" ? a.date.slice(0, 10) : new Date(a.date).toISOString().slice(0, 10);
                          const dB = typeof b.date === "string" ? b.date.slice(0, 10) : new Date(b.date).toISOString().slice(0, 10);
                          return dB.localeCompare(dA);
                        });
                      const renderHolidayCard = (h, isPast) => {
                        const d = h.date;
                        const dateStr = typeof d === "string" ? d.slice(0, 10) : new Date(d).toISOString().slice(0, 10);
                        const displayDate = new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        });
                        return (
                          <motion.div
                            key={h._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border-2 cursor-pointer hover:shadow-lg transition-all ${
                              isPast ? "border-amber-100 bg-gray-50" : "border-amber-100 hover:border-amber-300"
                            }`}
                            onClick={() => setSelectedHoliday(h)}
                          >
                            <div className="flex items-start justify-between gap-2 sm:gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
                                  <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0 ${isPast ? "bg-gray-400" : "bg-amber-500"}`} />
                                  <h3 className="text-base sm:text-lg font-bold text-gray-900 break-words">
                                    {h.name}
                                  </h3>
                                  <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold bg-amber-100 text-amber-800 rounded-md capitalize">
                                    {h.type}
                                  </span>
                                </div>
                                <p className="ml-4 sm:ml-6 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                                  <CalendarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 text-amber-500" />
                                  {displayDate}
                                </p>
                                {h.description && (
                                  <p className="ml-4 sm:ml-6 mt-1 text-gray-500 line-clamp-2 break-words text-xs sm:text-sm">
                                    {h.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      };
                      return (
                        <div className="space-y-4 sm:space-y-5">
                          {futureHolidays.length > 0 && (
                            <div className="space-y-2 sm:space-y-3">
                              <h3 className="text-sm font-semibold text-primary uppercase tracking-wide sticky top-0 z-20 bg-white py-2 -mt-px border-b border-gray-100 shadow-sm">
                                Upcoming
                              </h3>
                              {futureHolidays.map((h) => renderHolidayCard(h, false))}
                            </div>
                          )}
                          {pastHolidays.length > 0 && (
                            <div className="space-y-2 sm:space-y-3">
                              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide sticky top-0 z-20 bg-white py-2 -mt-px border-b border-gray-100 shadow-sm">
                                Past
                              </h3>
                              {pastHolidays.map((h) => renderHolidayCard(h, true))}
                            </div>
                          )}
                        </div>
                      );
                    })() )
                  }
                </div>
              )}
              </div>
            </div>
          )}

          {/* Calendar View */}
          {viewMode === "calendar" && (
          <div className="overflow-x-auto">
            <div className="min-w-full">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                events={[
                  ...events.map((event) => {
                  let startDate = event.start;
                  let endDate = event.end;
                    if (typeof startDate === 'string') startDate = new Date(startDate);
                    if (typeof endDate === 'string') endDate = new Date(endDate);
                  const eventEnd = endDate || startDate;
                  const now = new Date();
                  const isPast = eventEnd < now;
                    return {
                    id: event.id,
                    title: event.title || "Untitled Event",
                    start: startDate instanceof Date ? startDate.toISOString() : startDate,
                    end: endDate instanceof Date ? endDate.toISOString() : endDate,
                      extendedProps: {
                    description: event.description || "",
                    location: event.location || "",
                    category: event.category || 'General',
                      },
                    backgroundColor: isPast ? "#9E9E9E" : "#00796B",
                    borderColor: isPast ? "#757575" : "#004D40",
                    textColor: "#FFFFFF",
                    classNames: isPast ? ["past-event"] : ["future-event"],
                  };
                  }),
                  ...(holidays || []).map((h) => {
                    const d = h.date;
                    const dateStr = typeof d === "string" ? d.slice(0, 10) : new Date(d).toISOString().slice(0, 10);
                    const nextDay = new Date(dateStr);
                    nextDay.setDate(nextDay.getDate() + 1);
                    const endStr = nextDay.toISOString().slice(0, 10);
                    return {
                      id: `holiday-bg-${h._id}`,
                      start: dateStr,
                      end: endStr,
                      display: "background",
                      backgroundColor: HOLIDAY_BG,
                    };
                  }),
                ]}
                dayCellClassNames={({ date }) => (date.getDay() === 0 ? ["fc-day-sunday"] : [])}
                dateClick={(info) => {
                  const dateStr = info.dateStr.slice(0, 10);
                  const holiday = (holidays || []).find((h) => {
                    const d = h.date;
                    const norm = typeof d === "string" ? d.slice(0, 10) : new Date(d).toISOString().slice(0, 10);
                    return norm === dateStr;
                  });
                  if (holiday) setSelectedHoliday(holiday);
                }}
                eventClick={(info) => {
                  if (info.event.id.startsWith("holiday-bg-")) return;
                  setSelectedEvent({
                    id: info.event.id,
                    title: info.event.title,
                    start: info.event.startStr,
                    end: info.event.endStr,
                    description: info.event.extendedProps?.description || "",
                    location: info.event.extendedProps?.location || "",
                    category: info.event.extendedProps?.category || 'General',
                  });
                }}
                eventDisplay="block"
                height="auto"
                contentHeight="auto"
                aspectRatio={1.8}
              />
            </div>
          </div>
          )}
        </motion.div>
      )}

      {/* ✅ Professional Add/Edit Event Modal */}
      <AnimatePresence>
        {!readOnly && showAddForm && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && resetForm()}
          >
            <motion.div
              className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden"
              initial={{ y: 50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {/* Header - fixed, does not scroll */}
              <div className="flex-shrink-0 z-10 bg-gradient-to-r from-primary to-primary-dark text-white p-4 sm:p-5 md:p-6 rounded-t-2xl sm:rounded-t-3xl">
                <div className="flex justify-between items-center gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                      <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold truncate">
                        {editingEvent ? "Edit Event" : "Create New Event"}
                      </h3>
                      <p className="text-primary-light text-xs sm:text-sm truncate">
                        {editingEvent ? "Update event details" : "Fill in the event information"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={resetForm}
                    className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-white/20 hover:bg-white/30 rounded-lg sm:rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  </button>
                </div>
              </div>

              {/* Form - scrollable area only; header stays fixed above */}
              <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 md:p-6">
                <form onSubmit={handleAddEvent} className="space-y-4 sm:space-y-5 md:space-y-6">
                  {/* Error Message */}
                  {errors.submit && (
                    <div className="bg-danger/10 border border-danger/20 rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-danger/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <X className="w-3 h-3 sm:w-4 sm:h-4 text-danger" />
                      </div>
                      <p className="text-danger font-medium text-xs sm:text-sm md:text-base">{errors.submit}</p>
                    </div>
                  )}

                  {/* Event Title */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="block text-xs sm:text-sm font-semibold text-text">
                      Event Title <span className="text-danger">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Enter event title..."
                        className={`w-full p-3 sm:p-3.5 md:p-4 border-2 rounded-lg sm:rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary-light/20 text-sm sm:text-base ${
                          errors.summary 
                            ? 'border-danger bg-danger/10' 
                            : 'border-gray-200 hover:border-gray-300 focus:border-primary'
                        }`}
                        value={newEvent.summary}
                        onChange={(e) => {
                          setNewEvent({ ...newEvent, summary: e.target.value });
                          if (errors.summary) {
                            setErrors({ ...errors, summary: '' });
                          }
                        }}
                        maxLength={100}
                      />
                      <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                        {newEvent.summary.length}/100
                      </div>
                    </div>
                    {errors.summary && (
                      <p className="text-danger text-xs sm:text-sm flex items-center gap-1">
                        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                        {errors.summary}
                      </p>
                    )}
                  </div>

                  {/* Category */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="block text-xs sm:text-sm font-semibold text-text">
                      Category <span className="text-danger">*</span>
                    </label>
                    <select
                      className={`w-full p-3 sm:p-3.5 md:p-4 border-2 rounded-lg sm:rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary-light/20 text-sm sm:text-base ${
                        errors.category 
                          ? 'border-danger bg-danger/10' 
                          : 'border-gray-200 hover:border-gray-300 focus:border-primary'
                      }`}
                      value={newEvent.category}
                      onChange={(e) => {
                        setNewEvent({ ...newEvent, category: e.target.value });
                        if (errors.category) {
                          setErrors({ ...errors, category: '' });
                        }
                      }}
                    >
                      <option value="">Select a category...</option>
                      <option value="Academic">📚 Academic</option>
                      <option value="Sports">⚽ Sports</option>
                      <option value="Cultural">🎭 Cultural</option>
                      <option value="Meeting">🤝 Meeting</option>
                      <option value="Workshop">🔧 Workshop</option>
                    </select>
                    {errors.category && (
                      <p className="text-danger text-xs sm:text-sm flex items-center gap-1">
                        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                        {errors.category}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="block text-xs sm:text-sm font-semibold text-text">
                      Description
                    </label>
                    <div className="relative">
                      <textarea
                        placeholder="Enter event description (optional)..."
                        rows={4}
                        className={`w-full p-3 sm:p-3.5 md:p-4 border-2 rounded-lg sm:rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary-light/20 resize-none text-sm sm:text-base ${
                          errors.description 
                            ? 'border-danger bg-danger/10' 
                            : 'border-gray-200 hover:border-gray-300 focus:border-primary'
                        }`}
                        value={newEvent.description}
                        onChange={(e) => {
                          setNewEvent({ ...newEvent, description: e.target.value });
                          if (errors.description) {
                            setErrors({ ...errors, description: '' });
                          }
                        }}
                        maxLength={500}
                      />
                      <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 text-xs text-gray-400">
                        {newEvent.description.length}/500
                      </div>
                    </div>
                    {errors.description && (
                      <p className="text-danger text-xs sm:text-sm flex items-center gap-1">
                        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                        {errors.description}
                      </p>
                    )}
                  </div>

                  {/* Location */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="block text-xs sm:text-sm font-semibold text-text">
                      Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Enter event location..."
                        className={`w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-3.5 md:py-4 border-2 rounded-lg sm:rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary-light/20 text-sm sm:text-base ${
                          errors.location 
                            ? 'border-danger bg-danger/10' 
                            : 'border-gray-200 hover:border-gray-300 focus:border-primary'
                        }`}
                        value={newEvent.location}
                        onChange={(e) => {
                          setNewEvent({ ...newEvent, location: e.target.value });
                          if (errors.location) {
                            setErrors({ ...errors, location: '' });
                          }
                        }}
                        maxLength={200}
                      />
                    </div>
                    {errors.location && (
                      <p className="text-danger text-xs sm:text-sm flex items-center gap-1">
                        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                        {errors.location}
                      </p>
                    )}
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                    {/* Start Time */}
                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="block text-xs sm:text-sm font-semibold text-text">
                        Start Date & Time <span className="text-danger">*</span>
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                        <input
                          type="datetime-local"
                          className={`w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-3.5 md:py-4 border-2 rounded-lg sm:rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary-light/20 text-sm sm:text-base ${
                            errors.startTime 
                              ? 'border-danger bg-danger/10' 
                              : 'border-gray-200 hover:border-gray-300 focus:border-primary'
                          }`}
                          value={newEvent.startTime}
                          onChange={(e) => {
                            setNewEvent({ ...newEvent, startTime: e.target.value });
                            if (errors.startTime) {
                              setErrors({ ...errors, startTime: '' });
                            }
                          }}
                        />
                      </div>
                      {errors.startTime && (
                        <p className="text-danger text-xs sm:text-sm flex items-center gap-1">
                          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                          {errors.startTime}
                        </p>
                      )}
                    </div>

                    {/* End Time */}
                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="block text-xs sm:text-sm font-semibold text-text">
                        End Date & Time <span className="text-danger">*</span>
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                        <input
                          type="datetime-local"
                          className={`w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-3.5 md:py-4 border-2 rounded-lg sm:rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary-light/20 text-sm sm:text-base ${
                            errors.endTime 
                              ? 'border-danger bg-danger/10' 
                              : 'border-gray-200 hover:border-gray-300 focus:border-primary'
                          }`}
                          value={newEvent.endTime}
                          onChange={(e) => {
                            setNewEvent({ ...newEvent, endTime: e.target.value });
                            if (errors.endTime) {
                              setErrors({ ...errors, endTime: '' });
                            }
                          }}
                        />
                      </div>
                      {errors.endTime && (
                        <p className="text-danger text-xs sm:text-sm flex items-center gap-1">
                          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                          {errors.endTime}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 pt-4 sm:pt-5 md:pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 md:py-4 border-2 border-gray-300 text-text rounded-lg sm:rounded-xl font-semibold hover:bg-background transition-colors text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 md:py-4 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg sm:rounded-xl font-semibold hover:from-primary-dark hover:to-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>{editingEvent ? "Updating..." : "Creating..."}</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span>{editingEvent ? "Update Event" : "Create Event"}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ Event Details Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-xl p-4 sm:p-5 md:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
            >
              <div className="flex justify-between items-start gap-2 mb-3 sm:mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold break-words">{selectedEvent.title}</h3>
                  {selectedEvent.category && (
                    <span className="inline-block mt-1 px-2 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-md">
                      {selectedEvent.category}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-500 hover:text-gray-700 flex-shrink-0"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              <div className="space-y-2 sm:space-y-3">
                {(() => {
                  const eventEnd = new Date(selectedEvent.end);
                  const now = new Date();
                  const isPast = eventEnd < now;
                  
                  return (
                    <div className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg ${
                      isPast 
                        ? "bg-gray-100 border border-gray-300" 
                        : "bg-green-50 border border-green-200"
                    }`}>
                      <p className={`text-xs sm:text-sm font-semibold ${
                        isPast ? "text-gray-600" : "text-green-700"
                      }`}>
                        {isPast ? "📅 Past Event" : "📅 Upcoming Event"}
                      </p>
                    </div>
                  );
                })()}
                
                <p className="flex items-start sm:items-center gap-2 text-text text-sm sm:text-base">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5 sm:mt-0" />
                  <span className="font-medium">Start:</span>{" "}
                  <span className="break-words">
                    {(() => {
                      const d = new Date(selectedEvent.start);
                      return `${d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}, ${d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`;
                    })()}
                  </span>
                </p>
                <p className="flex items-start sm:items-center gap-2 text-text text-sm sm:text-base">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5 sm:mt-0" />
                  <span className="font-medium">End:</span>{" "}
                  <span className="break-words">
                    {(() => {
                      const d = new Date(selectedEvent.end);
                      return `${d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}, ${d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`;
                    })()}
                  </span>
                </p>
                {selectedEvent.location && (
                  <p className="flex items-start sm:items-center gap-2 text-text text-sm sm:text-base">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-accent-dark flex-shrink-0 mt-0.5 sm:mt-0" />
                    <span className="break-words">{selectedEvent.location}</span>
                  </p>
                )}
                {selectedEvent.description && (
                  <p className="text-text/80 text-sm sm:text-base break-words">{selectedEvent.description}</p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-3 mt-4 sm:mt-5 md:mt-6">
                {!readOnly && (
                  <>
                    <button
                      onClick={() => {
                        setShowAddForm(true);
                        setEditingEvent(selectedEvent);
                        // Format datetime for input fields (YYYY-MM-DDTHH:mm)
                        const formatDateTimeLocal = (dateString) => {
                          const date = new Date(dateString);
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(2, '0');
                          const day = String(date.getDate()).padStart(2, '0');
                          const hours = String(date.getHours()).padStart(2, '0');
                          const minutes = String(date.getMinutes()).padStart(2, '0');
                          return `${year}-${month}-${day}T${hours}:${minutes}`;
                        };
                        
                        setNewEvent({
                          summary: selectedEvent.title,
                          description: selectedEvent.description || "",
                          location: selectedEvent.location || "",
                          startTime: formatDateTimeLocal(selectedEvent.start),
                          endTime: formatDateTimeLocal(selectedEvent.end),
                          category: selectedEvent.category || "",
                        });
                        setSelectedEvent(null);
                      }}
                      className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-accent text-text rounded-lg hover:bg-accent-dark transition text-sm sm:text-base"
                    >
                      <Edit className="w-4 h-4" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(selectedEvent.id)}
                      className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-danger text-white rounded-lg hover:bg-danger/90 transition text-sm sm:text-base"
                    >
                      <Trash className="w-4 h-4" /> Delete
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Holiday Form Modal (same style as Add Event modal) */}
      <AnimatePresence>
        {!readOnly && showHolidayForm && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && (setShowHolidayForm(false), setEditingHoliday(null))}
          >
            <motion.div
              className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
              initial={{ y: 50, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-gradient-to-r from-amber-500 to-amber-600 text-white p-4 sm:p-5 md:p-6 rounded-t-2xl sm:rounded-t-3xl">
                <div className="flex justify-between items-center gap-2">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold">
                    {editingHoliday ? "Edit Holiday" : "Add Holiday"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => { setShowHolidayForm(false); setEditingHoliday(null); }}
                    className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-white/20 hover:bg-white/30 rounded-lg sm:rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  </button>
                </div>
              </div>
              <div className="p-4 sm:p-5 md:p-6">
                <HolidayForm
                  editingHoliday={editingHoliday}
                  hideTitle
                  onSuccess={() => {
                    fetchHolidays();
                    setShowHolidayForm(false);
                    setEditingHoliday(null);
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Holiday Details Modal */}
      <AnimatePresence>
        {selectedHoliday && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-xl p-4 sm:p-5 md:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
            >
              <div className="flex justify-between items-start gap-2 mb-3 sm:mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold break-words">{selectedHoliday.name}</h3>
                  <span className="inline-block mt-1 px-2 py-1 text-xs font-semibold bg-amber-100 text-amber-800 rounded-md capitalize">
                    {selectedHoliday.type}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedHoliday(null)}
                  className="text-gray-500 hover:text-gray-700 flex-shrink-0"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <p className="flex items-center gap-2 text-text text-sm sm:text-base">
                  <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 flex-shrink-0" />
                  <span className="font-medium">
                    {(() => {
                      const d = selectedHoliday.date;
                      const str = typeof d === "string" ? d.slice(0, 10) : new Date(d).toISOString().slice(0, 10);
                      return new Date(str + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
                    })()}
                  </span>
                </p>
                {selectedHoliday.description && (
                  <p className="text-text/80 text-sm sm:text-base break-words">{selectedHoliday.description}</p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-3 mt-4 sm:mt-5 md:mt-6">
                {!readOnly && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingHoliday(selectedHoliday);
                        setShowHolidayForm(true);
                        setSelectedHoliday(null);
                      }}
                      className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition text-sm sm:text-base"
                    >
                      <Edit className="w-4 h-4" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!window.confirm("Are you sure you want to delete this holiday?")) return;
                        try {
                          await axios.delete(`/holidays/${selectedHoliday._id}`);
                          toast.success("Holiday deleted");
                          fetchHolidays();
                          setSelectedHoliday(null);
                        } catch (err) {
                          toast.error(err.response?.data?.message || "Failed to delete holiday");
                        }
                      }}
                      className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-danger text-white rounded-lg hover:bg-danger/90 transition text-sm sm:text-base"
                    >
                      <Trash className="w-4 h-4" /> Delete
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedHoliday(null)}
                  className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 border border-gray-300 text-text rounded-lg hover:bg-gray-50 transition text-sm sm:text-base"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SchoolCalendar;
