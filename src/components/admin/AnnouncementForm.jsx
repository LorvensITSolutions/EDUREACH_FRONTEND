import { useState } from "react";
import { useAnnouncementStore } from "../stores/useAnnouncementStore";
import { useClassesAndSections } from "../../hooks/useClassesAndSections";

const categories = [
  "General", "Academic", "Sports", "Events",
  "Policy", "Facility", "Emergency"
];
const priorities = ["high", "medium", "low"];
const recipientTypes = [
  { value: "students", label: "Students/Parents" },
  { value: "teachers", label: "Teachers" },
  { value: "all", label: "All (Students & Teachers)" }
];

const AnnouncementForm = () => {
  const { createAnnouncement, loading } = useAnnouncementStore();
  const { classes, loading: classesLoading } = useClassesAndSections();
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "General",
    priority: "medium",
    recipientType: "students",
    targetClasses: [], // Empty array means all classes
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Only include targetClasses if recipientType is students or all
    const submitData = {
      ...formData,
      targetClasses: (formData.recipientType === 'students' || formData.recipientType === 'all') 
        ? formData.targetClasses 
        : []
    };
    await createAnnouncement(submitData);
    setFormData({
      title: "",
      content: "",
      category: "General",
      priority: "medium",
      recipientType: "students",
      targetClasses: [],
    });
  };

  const handleClassToggle = (className) => {
    setFormData(prev => {
      const currentClasses = prev.targetClasses || [];
      if (currentClasses.includes(className)) {
        // Remove class
        return { ...prev, targetClasses: currentClasses.filter(c => c !== className) };
      } else {
        // Add class
        return { ...prev, targetClasses: [...currentClasses, className] };
      }
    });
  };

  const handleSelectAllClasses = () => {
    setFormData(prev => ({
      ...prev,
      targetClasses: classes.length > 0 ? [...classes] : []
    }));
  };

  const handleClearClasses = () => {
    setFormData(prev => ({
      ...prev,
      targetClasses: []
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
      <h2 className="text-xl font-bold">Create Announcement</h2>

      <input
        type="text"
        placeholder="Title"
        required
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        className="w-full border rounded p-2"
      />

      <textarea
        placeholder="Content"
        required
        rows={4}
        value={formData.content}
        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
        className="w-full border rounded p-2"
      />

      <div className="flex gap-4 flex-wrap">
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="border p-2 rounded flex-1 min-w-[150px]"
        >
          {categories.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>

        <select
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
          className="border p-2 rounded flex-1 min-w-[150px]"
        >
          {priorities.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>

        <select
          value={formData.recipientType}
          onChange={(e) => setFormData({ ...formData, recipientType: e.target.value })}
          className="border p-2 rounded flex-1 min-w-[200px]"
        >
          {recipientTypes.map((rt) => (
            <option key={rt.value} value={rt.value}>{rt.label}</option>
          ))}
        </select>
      </div>

      {/* Class Selection - Only show for students/parents */}
      {(formData.recipientType === 'students' || formData.recipientType === 'all') && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Select Classes (Leave empty for all classes):
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSelectAllClasses}
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={handleClearClasses}
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
              >
                Clear
              </button>
            </div>
          </div>
          {classesLoading ? (
            <div className="text-sm text-gray-500">Loading classes...</div>
          ) : (
            <div className="flex flex-wrap gap-2 p-3 border rounded bg-gray-50 min-h-[60px]">
              {classes.length === 0 ? (
                <span className="text-sm text-gray-500">No classes available</span>
              ) : (
                classes.map((className) => {
                  const isSelected = formData.targetClasses?.includes(className);
                  return (
                    <button
                      key={className}
                      type="button"
                      onClick={() => handleClassToggle(className)}
                      className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                        isSelected
                          ? 'bg-primary text-white hover:bg-primary-dark'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      Class {className}
                    </button>
                  );
                })
              )}
            </div>
          )}
          {formData.targetClasses && formData.targetClasses.length > 0 && (
            <p className="text-xs text-gray-600">
              Selected: {formData.targetClasses.length} class(es) - All sections in these classes will receive notifications
            </p>
          )}
          {(!formData.targetClasses || formData.targetClasses.length === 0) && (
            <p className="text-xs text-gray-600 italic">
              No classes selected - All classes will receive notifications
            </p>
          )}
        </div>
      )}

      <button
        type="submit"
        className={`px-4 py-2 rounded transition-colors ${
          loading 
            ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
            : 'bg-primary text-white hover:bg-primary-dark'
        }`}
        disabled={loading}
      >
        {loading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            <span className="font-medium">Creating Announcement...</span>
          </div>
        ) : (
          "Create Announcement"
        )}
      </button>
    </form>
  );
};

export default AnnouncementForm;
