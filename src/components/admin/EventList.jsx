// components/admin/EventList.jsx
import { useEffect } from "react";
import { useEventStore } from "../stores/useEventStore";

const EventList = () => {
  const { events, fetchEvents, deleteEvent } = useEventStore();

  useEffect(() => {
    fetchEvents();
  }, []);

  const hasValidImage = (event) => {
    const img = event?.image;
    if (!img || typeof img !== "string") return false;
    const s = img.trim();
    if (s === "") return false;
    if (/^event$/i.test(s)) return false;
    if (s.toLowerCase().includes("placeholder")) return false;
    if (s.toLowerCase().includes("placehold.co")) return false;
    return s.startsWith("http") || s.startsWith("/") || s.startsWith("data:image");
  };

  const eventsWithImage = (events || []).filter(hasValidImage);

  if (eventsWithImage.length === 0) return <p>No events yet.</p>;

  return (
    <div className="grid gap-4 mt-6">
      {eventsWithImage.map((event) => (
        <div key={event._id} className="bg-gray-800 p-5 rounded shadow text-white">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold">{event.title}</h3>
              <p className="text-sm text-gray-300">{event.description}</p>
              <p className="mt-2 text-sm">📍 {event.location}</p>
              <p className="text-sm">🗓️ {new Date(event.date).toLocaleDateString()} at {event.time}</p>
              <p className="text-sm">📚 {event.category}</p>
            </div>
            <img src={event.image} alt={event.title} className="h-20 w-28 object-cover rounded ml-4" />
          </div>
          <button
            onClick={() => deleteEvent(event._id)}
            className="mt-4 text-red-400 hover:underline text-sm"
          >
            Delete Event
          </button>
        </div>
      ))}
    </div>
  );
};

export default EventList;
