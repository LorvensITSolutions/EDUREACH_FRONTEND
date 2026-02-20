import { useEffect, useState } from "react";
import { Calendar, Clock, MapPin, Users, Filter, Search, ChevronDown } from "lucide-react";
import { useEventStore } from "../stores/useEventStore";

const Events = () => {
  const {
    events,
    fetchEvents,
    toggleRSVP,
    loading,
  } = useEventStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [showFilters, setShowFilters] = useState(false);

  const categories = ["all", "Academic", "Sports", "Cultural", "Meeting", "Workshop"];

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

  const filteredEvents = (events || [])
    .filter(hasValidImage)
    .filter((event) =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((event) => selectedCategory === "all" || event.category === selectedCategory)
    .sort((a, b) => {
      if (sortBy === "date") return new Date(a.date) - new Date(b.date);
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return 0;
    });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">School Events</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Stay updated with all the exciting events happening at our school
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search events..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter size={20} />
              <span>Filters</span>
              <ChevronDown className={`transform transition-transform ${showFilters ? "rotate-180" : ""}`} size={16} />
            </button>

            <div className={`flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 ${showFilters ? "block" : "hidden lg:flex"}`}>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="date">Sort by Date</option>
                <option value="title">Sort by Title</option>
              </select>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((event) => (
            <div key={event._id} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="relative">
                <img src={event.image} alt={event.title} className="w-full h-48 object-cover" />
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    event.category === "Academic" ? "bg-blue-100 text-blue-800" :
                    event.category === "Sports" ? "bg-green-100 text-green-800" :
                    event.category === "Cultural" ? "bg-purple-100 text-purple-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {event.category}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{event.title}</h3>
                <p className="text-gray-600 mb-4">{event.description}</p>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar size={16} className="mr-2" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock size={16} className="mr-2" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin size={16} className="mr-2" />
                    <span>{event.location}</span>
                  </div>
                </div>
{/* 
                <div className="flex space-x-3">
                  <button
                    onClick={() => toggleRSVP(event._id)}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      event.rsvpUsers?.includes("currentUser") // optional conditional for logged-in user ID
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-primary text-white hover:bg-primary-dark"
                    }`}
                  >
                    RSVP
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    Details
                  </button>
                </div> */}
              </div>
            </div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Summary */}
        <div className="mt-12 bg-gradient-to-r from-primary to-primary-light rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Don't Miss Out!</h2>
          <p className="text-lg mb-6">
            We have {filteredEvents.filter((e) => new Date(e.date) >= new Date()).length} upcoming events
          </p>
          <button className="btn-accent">Subscribe to Event Notifications</button>
        </div>
      </div>
    </div>
  );
};

export default Events;
