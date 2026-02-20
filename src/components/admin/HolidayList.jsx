// components/admin/HolidayList.jsx
import { useState, useEffect } from "react";
import axiosInstance from "../lib/axios";
import { toast } from "react-hot-toast";
import { Calendar, Edit, Trash2, Search, Filter } from "lucide-react";
import HolidayForm from "./HolidayForm";

const HolidayList = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchHolidays();
  }, [filterYear, filterType]);

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterYear) params.append("year", filterYear);
      if (filterType !== "all") params.append("type", filterType);

      const response = await axiosInstance.get(`/holidays?${params.toString()}`);
      setHolidays(response.data.holidays || []);
    } catch (error) {
      console.error("Error fetching holidays:", error);
      toast.error("Failed to fetch holidays");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this holiday?")) {
      return;
    }

    try {
      await axiosInstance.delete(`/holidays/${id}`);
      toast.success("Holiday deleted successfully");
      fetchHolidays();
    } catch (error) {
      console.error("Error deleting holiday:", error);
      toast.error("Failed to delete holiday");
    }
  };

  const handleEdit = (holiday) => {
    setEditingHoliday(holiday);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setEditingHoliday(null);
    setShowForm(false);
    fetchHolidays();
  };

  const handleCancelEdit = () => {
    setEditingHoliday(null);
    setShowForm(false);
  };

  const filteredHolidays = holidays.filter((holiday) => {
    const matchesSearch =
      holiday.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (holiday.description && holiday.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const getTypeColor = (type) => {
    const colors = {
      national: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      religious: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      regional: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      school: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    };
    return colors[type] || colors.other;
  };

  if (showForm && editingHoliday) {
    return (
      <div className="space-y-6">
        <HolidayForm
          editingHoliday={editingHoliday}
          onSuccess={handleFormSuccess}
        />
        <button
          onClick={handleCancelEdit}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            All Holidays
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-background dark:bg-gray-700 text-text dark:text-white"
          >
            {Array.from({ length: 5 }, (_, i) => {
              const year = new Date().getFullYear() - 2 + i;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-background dark:bg-gray-700 text-text dark:text-white"
          >
            <option value="all">All Types</option>
            <option value="national">National</option>
            <option value="religious">Religious</option>
            <option value="regional">Regional</option>
            <option value="school">School</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search holidays..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-background dark:bg-gray-700 text-text dark:text-white focus:ring-primary focus:border-primary"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading holidays...</p>
        </div>
      ) : filteredHolidays.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No holidays found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  Date
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  Name
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  Type
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  Description
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredHolidays.map((holiday) => (
                <tr
                  key={holiday._id}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="py-3 px-4">
                    {new Date(holiday.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                    {holiday.name}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                        holiday.type
                      )}`}
                    >
                      {holiday.type.charAt(0).toUpperCase() + holiday.type.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-sm">
                    {holiday.description || "-"}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEdit(holiday)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(holiday._id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredHolidays.length > 0 && (
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredHolidays.length} of {holidays.length} holiday(s)
        </div>
      )}
    </div>
  );
};

export default HolidayList;
