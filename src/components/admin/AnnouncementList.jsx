import { useEffect } from "react";
import { useAnnouncementStore } from "../stores/useAnnouncementStore";
import { Trash2, Pin, Send } from "lucide-react";
import { format } from "date-fns";

const AnnouncementList = () => {
  const {
    announcements,
    loading,
    fetchAnnouncements,
    togglePin,
    deleteAnnouncement,
  } = useAnnouncementStore();

  useEffect(() => {
    fetchAnnouncements({ search: "", category: "all", priority: "all" });
  }, []);

  // Debug logging
  useEffect(() => {
    console.log("Announcements data:", announcements);
    console.log("Announcements type:", typeof announcements);
    console.log("Is array:", Array.isArray(announcements));
  }, [announcements]);

  // Filter out any undefined or null announcements and ensure all required properties exist
  const validAnnouncements = announcements?.filter(a => 
    a && 
    a._id && 
    a.title && 
    a.content && 
    a.category && 
    a.priority && 
    a.date
  ) || [];

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">All Announcements</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-gray-600">Loading announcements...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 relative">
      <h2 className="text-xl font-bold">All Announcements</h2>
      
      {/* Global loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="text-gray-600">Processing...</span>
          </div>
        </div>
      )}
      
      {validAnnouncements.length === 0 ? (
        <p className="text-gray-500 italic">No announcements found</p>
      ) : (
        validAnnouncements.map((a) => (
          <div
            key={a._id}
            className="bg-white p-4 rounded shadow flex justify-between items-start"
          >
            <div>
              <h3 className="font-semibold text-lg">{a.title || "Untitled"}</h3>
              <p className="text-gray-600">{a.content || "No content"}</p>
              <div className="text-sm text-gray-500 mt-2">
                {a.category || "General"} | {a.priority || "Normal"} | {a.date ? format(new Date(a.date), "PP") : "No date"}
                {a.recipientType && (
                  <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium">
                    {a.recipientType === 'students' ? 'Students/Parents' : 
                     a.recipientType === 'teachers' ? 'Teachers' : 
                     'All (Students & Teachers)'}
                  </span>
                )}
                {a.targetClasses && a.targetClasses.length > 0 && (a.recipientType === 'students' || a.recipientType === 'all') && (
                  <div className="mt-2">
                    <span className="text-xs font-medium text-gray-600">Target Classes: </span>
                    <span className="text-xs text-gray-700">
                      {a.targetClasses.map(c => `Class ${c}`).join(', ')}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">(All sections)</span>
                  </div>
                )}
                {(!a.targetClasses || a.targetClasses.length === 0) && (a.recipientType === 'students' || a.recipientType === 'all') && (
                  <div className="mt-2">
                    <span className="text-xs text-gray-500 italic">All classes (all sections)</span>
                  </div>
                )}
              </div>

              {/* Status indicator
              <div className="flex items-center gap-1 text-xs mt-1 text-blue-600">
                <Send className="w-3 h-3" />
                Queued for WhatsApp sending
              </div> */}
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => togglePin(a._id)} 
                title="Toggle Pin"
                disabled={loading}
                className={`p-1 rounded transition-colors ${
                  loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
                }`}
              >
                <Pin
                  className={`w-5 h-5 ${
                    a?.pinned ? "text-primary" : "text-gray-400"
                  }`}
                />
              </button>
              <button 
                onClick={() => deleteAnnouncement(a._id)} 
                title="Delete"
                disabled={loading}
                className={`p-1 rounded transition-colors ${
                  loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
                }`}
              >
                <Trash2 className="w-5 h-5 text-red-500" />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AnnouncementList;
