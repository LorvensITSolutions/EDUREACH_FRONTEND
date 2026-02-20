// components/admin/HolidayForm.jsx
import { useState, useEffect } from "react";
import axiosInstance from "../lib/axios";
import { toast } from "react-hot-toast";
import { Calendar, Plus, Loader2 } from "lucide-react";

const HolidayForm = ({ onSuccess, editingHoliday, hideTitle }) => {
  const [form, setForm] = useState({
    name: editingHoliday?.name || "",
    date: editingHoliday?.date 
      ? (() => {
          // Handle date parsing - could be ISO string or Date object
          const dateStr = editingHoliday.date;
          if (typeof dateStr === 'string') {
            // Extract YYYY-MM-DD from ISO string to avoid timezone issues
            const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
            if (match) {
              return match[0]; // Return YYYY-MM-DD
            }
            return new Date(dateStr).toISOString().split('T')[0];
          }
          // If it's a Date object, use UTC methods to get the correct date
          const date = new Date(dateStr);
          const year = date.getUTCFullYear();
          const month = String(date.getUTCMonth() + 1).padStart(2, '0');
          const day = String(date.getUTCDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        })()
      : "",
    description: editingHoliday?.description || "",
    type: editingHoliday?.type || "school",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!editingHoliday) {
      setForm({ name: "", date: "", description: "", type: "school" });
      return;
    }
    let dateStr = "";
    if (typeof editingHoliday.date === "string") {
      const m = editingHoliday.date.match(/^(\d{4})-(\d{2})-(\d{2})/);
      dateStr = m ? m[0] : editingHoliday.date.slice(0, 10);
    } else {
      const d = new Date(editingHoliday.date);
      dateStr = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
    }
    setForm({
      name: editingHoliday.name || "",
      date: dateStr,
      description: editingHoliday.description || "",
      type: editingHoliday.type || "school",
    });
  }, [editingHoliday]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingHoliday) {
        // Update existing holiday
        await axiosInstance.put(`/holidays/${editingHoliday._id}`, form);
        toast.success("Holiday updated successfully");
      } else {
        // Create new holiday
        await axiosInstance.post("/holidays", form);
        toast.success("Holiday created successfully");
      }

      // Reset form
      setForm({
        name: "",
        date: "",
        description: "",
        type: "school",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error saving holiday:", error);
      toast.error(
        error.response?.data?.message || "Failed to save holiday. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`${hideTitle ? "space-y-5" : "bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl max-w-2xl mx-auto space-y-5"}`}
    >
      {!hideTitle && (
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-primary-dark dark:text-primary">
            {editingHoliday ? "Edit Holiday" : "Add New Holiday"}
          </h2>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Holiday Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-background dark:bg-gray-700 text-text dark:text-white focus:ring-primary focus:border-primary"
            placeholder="e.g., Independence Day"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Date <span className="text-red-500">*</span>
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
            Type
          </label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-background dark:bg-gray-700 text-text dark:text-white focus:ring-primary focus:border-primary"
          >
            <option value="national">National</option>
            <option value="religious">Religious</option>
            <option value="regional">Regional</option>
            <option value="school">School</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-background dark:bg-gray-700 text-text dark:text-white focus:ring-primary focus:border-primary"
            placeholder="Optional description..."
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full md:w-auto px-6 py-2.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            {editingHoliday ? "Updating..." : "Creating..."}
          </>
        ) : (
          <>
            <Plus className="h-5 w-5" />
            {editingHoliday ? "Update Holiday" : "Add Holiday"}
          </>
        )}
      </button>
    </form>
  );
};

export default HolidayForm;
