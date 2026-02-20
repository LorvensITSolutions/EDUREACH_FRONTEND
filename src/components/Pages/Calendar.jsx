import { useState, useEffect } from 'react';
import { useCalendarStore } from '../stores/useCalendarStore';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Users,
  Filter,
  Search,
  Edit,
  Trash2,
  RefreshCw
} from 'lucide-react';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [view, setView] = useState('month'); // month, week, day
  const [showEventModal, setShowEventModal] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingEvent, setEditingEvent] = useState(null);

  // Calendar store
  const { 
    events, 
    loading, 
    error, 
    fetchEvents, 
    addEvent, 
    updateEvent, 
    deleteEvent,
    refreshEvents 
  } = useCalendarStore();

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Load events on component mount
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Filter events based on search and category
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    const dateString = date.toISOString().split('T')[0];
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.start).toISOString().split('T')[0];
      return eventDate === dateString;
    });
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    const events = getEventsForDate(date);
    setSelectedEvents(events);
    if (events.length > 0) {
      setShowEventModal(true);
    }
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSameDate = (date1, date2) => {
    if (!date1 || !date2) return false;
    return date1.toDateString() === date2.toDateString();
  };

  const getEventColor = (category) => {
    const colors = {
      'Academic': 'bg-blue-500',
      'Sports': 'bg-green-500',
      'Cultural': 'bg-purple-500',
      'Meeting': 'bg-orange-500',
      'Workshop': 'bg-pink-500',
      'Holiday': 'bg-red-500',
      'General': 'bg-gray-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setShowEventForm(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      await deleteEvent(eventId);
      setShowEventModal(false);
    }
  };

  const handleRefresh = () => {
    refreshEvents();
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">School Calendar</h1>
            <p className="text-gray-600">Keep track of all school events and activities</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setView('month')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  view === 'month' ? 'bg-primary text-white' : 'text-gray-600 hover:text-primary'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setView('week')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  view === 'week' ? 'bg-primary text-white' : 'text-gray-600 hover:text-primary'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setView('day')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  view === 'day' ? 'bg-primary text-white' : 'text-gray-600 hover:text-primary'
                }`}
              >
                Day
              </button>
            </div>
            <button 
              onClick={handleRefresh}
              className="p-2 text-gray-600 hover:text-primary transition-colors"
              title="Refresh events"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
            <button 
              onClick={handleCreateEvent}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Add Event</span>
            </button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="Academic">Academic</option>
              <option value="Sports">Sports</option>
              <option value="Cultural">Cultural</option>
              <option value="Meeting">Meeting</option>
              <option value="Workshop">Workshop</option>
              <option value="Holiday">Holiday</option>
              <option value="General">General</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Calendar Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => navigateMonth(-1)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h2>
                  <button
                    onClick={() => navigateMonth(1)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
                <button
                  onClick={goToToday}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Today
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="p-6">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {weekdays.map((day) => (
                    <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                  {days.map((date, index) => {
                    const events = getEventsForDate(date);
                    const isCurrentDay = isToday(date);
                    const isSelected = isSameDate(date, selectedDate);

                    return (
                      <div
                        key={index}
                        onClick={() => date && handleDateClick(date)}
                        className={`min-h-[100px] p-2 border border-gray-100 cursor-pointer transition-colors ${
                          date 
                            ? 'hover:bg-gray-50' 
                            : 'bg-gray-50 cursor-default'
                        } ${
                          isCurrentDay ? 'bg-primary/10 border-primary' : ''
                        } ${
                          isSelected ? 'ring-2 ring-primary' : ''
                        }`}
                      >
                        {date && (
                          <>
                            <div className={`text-sm font-medium mb-1 ${
                              isCurrentDay ? 'text-primary' : 'text-gray-900'
                            }`}>
                              {date.getDate()}
                            </div>
                            <div className="space-y-1">
                              {events.slice(0, 2).map((event) => (
                                <div
                                  key={event.id}
                                  className={`text-xs p-1 rounded text-white truncate ${getEventColor(event.category)}`}
                                  title={event.title}
                                >
                                  {event.title}
                                </div>
                              ))}
                              {events.length > 2 && (
                                <div className="text-xs text-gray-500">
                                  +{events.length - 2} more
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Mini Calendar */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Navigate</h3>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {new Date().getDate()}
                </div>
                <div className="text-sm text-gray-600">
                  {months[new Date().getMonth()]} {new Date().getFullYear()}
                </div>
              </div>
            </div>

            {/* Event Categories */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Categories</h3>
              <div className="space-y-3">
                {[
                  { name: 'Academic', color: 'bg-blue-500', count: 5 },
                  { name: 'Sports', color: 'bg-green-500', count: 3 },
                  { name: 'Cultural', color: 'bg-purple-500', count: 2 },
                  { name: 'Meeting', color: 'bg-orange-500', count: 4 },
                  { name: 'Workshop', color: 'bg-pink-500', count: 1 }
                ].map((category) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 ${category.color} rounded-full`}></div>
                      <span className="text-sm text-gray-700">{category.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">{category.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
              <div className="space-y-4">
                {filteredEvents
                  .filter(event => new Date(event.start) >= new Date())
                  .slice(0, 3)
                  .map((event) => (
                  <div key={event.id} className="border-l-4 border-primary pl-4">
                    <h4 className="font-medium text-gray-900 text-sm">{event.title}</h4>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <CalendarIcon size={12} className="mr-1" />
                      <span>{new Date(event.start).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock size={12} className="mr-1" />
                      <span>{new Date(event.start).toLocaleTimeString()}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center text-xs text-gray-500">
                        <MapPin size={12} className="mr-1" />
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>
                ))}
                {filteredEvents.filter(event => new Date(event.start) >= new Date()).length === 0 && (
                  <p className="text-gray-500 text-sm">No upcoming events</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Event Details Modal */}
        {showEventModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Events on {selectedDate && formatDate(selectedDate)}
                </h3>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                {selectedEvents.map((event) => (
                  <div key={event.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{event.title}</h4>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs text-white ${getEventColor(event.category)}`}>
                          {event.category}
                        </span>
                        <button
                          onClick={() => handleEditEvent(event)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="Edit event"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="Delete event"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    {event.description && (
                      <p className="text-gray-600 text-sm mb-3">{event.description}</p>
                    )}
                    <div className="space-y-1 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Clock size={12} className="mr-2" />
                        <span>{new Date(event.start).toLocaleTimeString()}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center">
                          <MapPin size={12} className="mr-2" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {selectedEvents.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No events on this date</p>
                )}
              </div>
              
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={handleCreateEvent}
                  className="flex-1 btn-primary flex items-center justify-center space-x-2"
                >
                  <Plus size={16} />
                  <span>Add Event</span>
                </button>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Event Form Modal */}
        {showEventForm && (
          <EventFormModal
            event={editingEvent}
            onClose={() => setShowEventForm(false)}
            onSave={async (eventData) => {
              if (editingEvent) {
                await updateEvent(editingEvent.id, eventData);
              } else {
                await addEvent(eventData);
              }
              setShowEventForm(false);
            }}
          />
        )}

        {/* Error Display */}
        {error && (
          <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
            <div className="flex items-center">
              <span className="mr-2">⚠️</span>
              <span>{error}</span>
              <button
                onClick={() => window.location.reload()}
                className="ml-4 text-red-600 hover:text-red-800"
              >
                Retry
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Event Form Modal Component
const EventFormModal = ({ event, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    location: event?.location || '',
    category: event?.category || 'General',
    startTime: event?.start ? new Date(event.start).toISOString().slice(0, 16) : '',
    endTime: event?.end ? new Date(event.end).toISOString().slice(0, 16) : ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.startTime || !formData.endTime) {
      alert('Please fill in all required fields');
      return;
    }
    onSave(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {event ? 'Edit Event' : 'Create Event'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="General">General</option>
              <option value="Academic">Academic</option>
              <option value="Sports">Sports</option>
              <option value="Cultural">Cultural</option>
              <option value="Meeting">Meeting</option>
              <option value="Workshop">Workshop</option>
              <option value="Holiday">Holiday</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time *
              </label>
              <input
                type="datetime-local"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time *
              </label>
              <input
                type="datetime-local"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="flex space-x-2 pt-4">
            <button
              type="submit"
              className="flex-1 btn-primary"
            >
              {event ? 'Update Event' : 'Create Event'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Calendar;