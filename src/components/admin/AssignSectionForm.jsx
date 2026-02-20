// src/components/admin/teachers/AssignSectionForm.jsx
import { useTeacherStore } from "../stores/useTeacherStore";
import { useClassesAndSections } from "../../hooks/useClassesAndSections";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const AssignSectionForm = () => {
  const { teachers, assignSection, loading, fetchAllTeachers } = useTeacherStore();
  const { classes, sections, loading: classesLoading, error: classesError } = useClassesAndSections();
  const [form, setForm] = useState({
    teacherId: "",
    className: "",
    section: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all teachers when component mounts
  useEffect(() => {
    fetchAllTeachers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.teacherId || !form.className || !form.section) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await assignSection(form);
      // Reset form after successful submission
      setForm({
        teacherId: "",
        className: "",
        section: "",
      });
    } catch (error) {
      console.error("Assignment failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl shadow-md w-full max-w-md mx-auto"
    >
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-primary mb-3 sm:mb-4 text-center">
        Assign Section to Teacher
      </h2>

      <div className="space-y-3 sm:space-y-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
            Select Teacher
          </label>
          <select
            name="teacherId"
            value={form.teacherId}
            onChange={handleChange}
            required
            className="w-full px-3 sm:px-3.5 md:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
            disabled={isSubmitting}
          >
            <option value="">Choose a teacher...</option>
            {teachers.map((t) => (
              <option key={t._id} value={t._id} title={`${t.name} - ${t.teacherId || "No ID"}`}>
                {t.name} - {t.teacherId || "No ID"}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
            Class
          </label>
          <select
            name="className"
            value={form.className}
            onChange={handleChange}
            required
            className="w-full px-3 sm:px-3.5 md:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
            disabled={isSubmitting || classesLoading}
          >
            <option value="">Choose a class...</option>
            {classes.map((className) => (
              <option key={className} value={className}>
                {className}
              </option>
            ))}
          </select>
          {classesLoading && (
            <p className="text-xs text-gray-500 mt-1">Loading classes...</p>
          )}
          {classesError && (
            <p className="text-xs text-red-500 mt-1 break-words">{classesError}</p>
          )}
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
            Section
          </label>
          <select
            name="section"
            value={form.section}
            onChange={handleChange}
            required
            className="w-full px-3 sm:px-3.5 md:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
            disabled={isSubmitting || classesLoading}
          >
            <option value="">Choose a section...</option>
            {sections.map((section) => (
              <option key={section} value={section}>
                {section}
              </option>
            ))}
          </select>
          {classesLoading && (
            <p className="text-xs text-gray-500 mt-1">Loading sections...</p>
          )}
          {classesError && (
            <p className="text-xs text-red-500 mt-1 break-words">{classesError}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || loading}
        className="w-full mt-3 sm:mt-4 bg-primary text-white px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium"
      >
        {isSubmitting ? "Assigning..." : "Assign Section"}
      </button>
    </form>
  );
};

export default AssignSectionForm;
