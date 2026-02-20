// components/admin/EventForm.jsx
import { useState } from "react";
import { useEventStore } from "../stores/useEventStore"; // corrected path if needed
import { toast } from "react-hot-toast";

const EventForm = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Academic",
    date: "",
    time: "",
    location: "",
    image: null,
  });

  const { createEvent, loading } = useEventStore();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, image: reader.result }));
        toast.success("Image selected");
      };
      reader.readAsDataURL(files[0]);
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createEvent(form);
    setForm({
      title: "",
      description: "",
      category: "Academic",
      date: "",
      time: "",
      location: "",
      image: null,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl max-w-2xl mx-auto space-y-5 animate-fade-in"
    >
      <h2 className="text-2xl font-bold text-primary-dark dark:text-primary text-center mb-4">
        Create New Event
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-background dark:bg-gray-700 text-text dark:text-white focus:ring-primary focus:border-primary"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Category
          </label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-background dark:bg-gray-700 text-text dark:text-white focus:ring-primary focus:border-primary"
          >
            <option>Academic</option>
            <option>Sports</option>
            <option>Cultural</option>
            <option>Meeting</option>
            <option>Workshop</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Date
          </label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-background dark:bg-gray-700 text-text dark:text-white focus:ring-primary focus:border-primary"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Time
          </label>
          <input
            type="time"
            name="time"
            value={form.time}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-background dark:bg-gray-700 text-text dark:text-white focus:ring-primary focus:border-primary"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Location
          </label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-background dark:bg-gray-700 text-text dark:text-white focus:ring-primary focus:border-primary"
            placeholder="Ex: Auditorium, Room 204"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-background dark:bg-gray-700 text-text dark:text-white focus:ring-primary focus:border-primary"
            placeholder="Event details..."
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Event Banner
          </label>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:border-0 file:rounded-md file:bg-primary-light file:text-white hover:file:bg-primary-dark transition"
            required
          />
          {form.image && (
            <p className="text-sm text-green-400 mt-1">✅ Image ready to upload</p>
          )}
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 rounded-md bg-primary text-white font-semibold hover:bg-primary-dark transition-colors duration-300 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Event"}
        </button>
      </div>
    </form>
  );
};

export default EventForm;
