import { useEffect, useState } from 'react';
import {
  Bell,
  Search,
  Filter,
  Calendar,
  AlertTriangle,
  Info,
  CheckCircle,
  ChevronDown,
  Pin,
  Share,
} from 'lucide-react';
import { useAnnouncementStore } from '../stores/useAnnouncementStore';

const Announcements = () => {
  // Force cache refresh - updated to fix pinned property error
  const {
    announcements,
    fetchAnnouncements,
    togglePin,
    loading,
  } = useAnnouncementStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const categories = ['all', 'General', 'Academic', 'Sports', 'Events', 'Policy', 'Facility', 'Emergency'];
  const priorities = ['all', 'high', 'medium', 'low'];

  useEffect(() => {
    console.log('Announcements component loaded - cache refresh version');
    const timeout = setTimeout(() => {
      fetchAnnouncements({ search: searchTerm, category: selectedCategory, priority: selectedPriority });
    }, 300); // debounce for search

    return () => clearTimeout(timeout);
  }, [searchTerm, selectedCategory, selectedPriority]);

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="text-red-500" size={20} />;
      case 'medium': return <Info className="text-yellow-500" size={20} />;
      case 'low': return <CheckCircle className="text-green-500" size={20} />;
      default: return <Info className="text-gray-500" size={20} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      General: 'bg-blue-100 text-blue-800',
      Academic: 'bg-purple-100 text-purple-800',
      Sports: 'bg-green-100 text-green-800',
      Events: 'bg-orange-100 text-orange-800',
      Policy: 'bg-red-100 text-red-800',
      Facility: 'bg-gray-100 text-gray-800',
      Emergency: 'bg-red-100 text-red-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const shareAnnouncement = (announcement) => {
    if (!announcement) return;
    
    const title = announcement?.title || 'Untitled Announcement';
    const content = announcement?.content || 'No content available';
    
    if (navigator.share) {
      navigator.share({
        title: title,
        text: content,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(`${title}\n\n${content}`);
      alert('Announcement copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">School Announcements</h1>
          <p className="text-xl text-gray-600">Stay updated with the latest news and important information</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search announcements..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter Toggle for Mobile */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter size={20} />
              <span>Filters</span>
              <ChevronDown className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} size={16} />
            </button>

            {/* Filters */}
            <div className={`flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 ${showFilters ? 'block' : 'hidden lg:flex'}`}>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>

              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {priorities.map(priority => (
                  <option key={priority} value={priority}>
                    {priority === 'all' ? 'All Priorities' : priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Announcements List */}
        <div className="space-y-6">
          {loading ? (
            <p className="text-center text-gray-500">Loading announcements...</p>
          ) : announcements.length === 0 ? (
            <div className="text-center py-12">
              <Bell size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No announcements found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            announcements.filter(announcement => announcement && announcement._id).map((announcement) => (
              <div
                key={announcement._id}
                className={`bg-white rounded-xl shadow-lg overflow-hidden card-hover ${announcement?.pinned ? 'ring-2 ring-primary' : ''}`}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {announcement?.pinned && <Pin className="text-primary" size={20} />}
                      {getPriorityIcon(announcement?.priority)}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{announcement?.title || 'Untitled'}</h3>
                        <div className="flex items-center space-x-2 mt-1 flex-wrap gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(announcement?.category)}`}>
                            {announcement?.category || 'General'}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(announcement?.priority)}`}>
                            {announcement?.priority || 'medium'} priority
                          </span>
                          {/* Recipient Type Badge */}
                          {announcement?.recipientType && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                              {announcement.recipientType === 'students' ? '📚 For Students/Parents' : 
                               announcement.recipientType === 'teachers' ? '👨‍🏫 For Teachers' : 
                               '👥 For Everyone'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* <button
                        onClick={() => togglePin(announcement._id)}
                        className={`p-2 rounded-lg transition-colors ${
                          announcement?.pinned
                            ? 'text-primary bg-primary/10 hover:bg-primary/20'
                            : 'text-gray-400 hover:text-primary hover:bg-gray-100'
                        }`}
                        title={announcement?.pinned ? 'Unpin' : 'Pin announcement'}
                      >
                        <Pin size={16} />
                      </button> */}
                      <button
                        onClick={() => shareAnnouncement(announcement)}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                        title="Share announcement"
                      >
                        <Share size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="mb-4">
                    <p className="text-gray-600 leading-relaxed">{announcement?.content || 'No content available'}</p>
                  </div>

                  {/* Target Classes Info - Only show for students/parents announcements */}
                  {(announcement?.recipientType === 'students' || announcement?.recipientType === 'all') && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="font-medium text-blue-900">Target Classes:</span>
                        {announcement?.targetClasses && announcement.targetClasses.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {announcement.targetClasses.map((className, idx) => (
                              <span 
                                key={idx}
                                className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium"
                              >
                                Class {className}
                              </span>
                            ))}
                            <span className="text-blue-700 text-xs ml-1">(All sections)</span>
                          </div>
                        ) : (
                          <span className="text-blue-700 text-sm">All Classes (All sections)</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
                    <div className="flex items-center space-x-1">
                      <Calendar size={16} />
                      <span>Published on {announcement?.date ? formatDate(announcement.date) : 'Unknown date'}</span>
                    </div>

                    {announcement?.priority === 'high' && (
                      <div className="flex items-center space-x-1 text-red-600">
                        <Bell size={16} />
                        <span className="font-medium">Urgent</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Notification Settings */}
        <div className="mt-12 bg-gradient-to-r from-primary to-primary-light rounded-xl p-8 text-white text-center">
          <Bell size={48} className="mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Never Miss an Important Update</h2>
          <p className="text-lg mb-6">
            Subscribe to email notifications and get announcements delivered directly to your inbox
          </p>
          <button className="btn-accent">Enable Notifications</button>
        </div>
      </div>
    </div>
  );
};

export default Announcements;
