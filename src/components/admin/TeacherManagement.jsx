// src/pages/admin/TeacherManagement.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, UserPlus, ListChecks, Users, Search, Filter, X, Image } from "lucide-react";
import { useTeacherStore } from "../stores/useTeacherStore";

import UploadTeachersForm from "../admin/UploadTeachersForm";
import AssignSectionForm from "../admin/AssignSectionForm";
import TeacherList from "../admin/TeacherList";
import AddTeacherForm from "../admin/addTeacherForm";
import UpdateTeacherImages from "../admin/UpdateTeacherImages";

const tabsDef = (t) => ([
  { id: "list", label: "Teacher List", icon: Users },
  { id: "bulk", label: t('admin.teachers.bulkUpload'), icon: Upload },
  { id: "single", label: t('admin.teachers.addSingle'), icon: UserPlus },
  { id: "images", label: "Update Images", icon: Image },
  { id: "assign", label: t('admin.teachers.assignSection'), icon: ListChecks },
]);

const TeacherManagement = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [filters, setFilters] = useState({
    search: "",
    subject: "",
    qualification: ""
  });
  const [showFilters, setShowFilters] = useState(false);
  const { t } = useTranslation();
  const tabs = tabsDef(t);
  
  const { 
    teachers, 
    loading, 
    pagination, 
    fetchTeachers, 
    searchTeachers, 
    filterTeachers,
    getUniqueSubjects,
    getUniqueQualifications 
  } = useTeacherStore();

  useEffect(() => {
    fetchTeachers({ page: 1, limit: 10 });
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId;
      return (searchTerm) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (searchTerm.trim()) {
            searchTeachers(searchTerm.trim());
          } else {
            // If search is empty, fetch all teachers
            fetchTeachers({ page: 1, limit: 10 });
          }
        }, 500); // 500ms delay
      };
    })(),
    [searchTeachers, filterTeachers, fetchTeachers]
  );

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    
    // Trigger search immediately for search input
    if (key === 'search') {
      debouncedSearch(value);
    }
  };

  const handleSearch = () => {
    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value)
    );
    
    if (activeFilters.search) {
      searchTeachers(activeFilters.search);
    } else {
      // Apply other filters
      const otherFilters = Object.fromEntries(
        Object.entries(activeFilters).filter(([key, _]) => key !== 'search')
      );
      if (Object.keys(otherFilters).length > 0) {
        filterTeachers(otherFilters);
      } else {
        fetchTeachers({ page: 1, limit: 10 });
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearFilters = () => {
    setFilters({ search: "", subject: "", qualification: "" });
    fetchTeachers({ page: 1, limit: 10 });
  };

  // Check if any filters are active
  const hasActiveFilters = filters.search || filters.subject || filters.qualification;

  const uniqueSubjects = getUniqueSubjects();
  const uniqueQualifications = getUniqueQualifications();

  return (
    <div className="p-2 sm:p-4 md:p-8 min-h-screen bg-background text-foreground space-y-4 sm:space-y-5 md:space-y-6">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">{t('menu.admin.teachers')}</h1>

      {/* Tabs */}
      <div className="flex gap-1.5 sm:gap-2 flex-wrap border rounded-lg sm:rounded-xl p-1.5 sm:p-2 bg-muted/20">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg font-medium transition-all text-xs sm:text-sm
              ${activeTab === id ? "bg-primary text-white shadow" : "bg-transparent hover:bg-muted/50"}`}
          >
            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="whitespace-nowrap">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content with Framer Motion */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {activeTab === "list" && (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="pt-2 sm:pt-3 md:pt-4"
            >
              {/* Filter Section */}
              <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-md overflow-hidden mb-4 sm:mb-5 md:mb-6">
                <div className="p-3 sm:p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
                    {/* Search Bar */}
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                          type="text"
                          placeholder="Search by name, teacher ID, or phone..."
                          value={filters.search}
                          onChange={(e) => handleFilterChange("search", e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
                        />
                      </div>
                    </div>

                    {/* Filter Toggle Button */}
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border transition-colors text-xs sm:text-sm ${
                        showFilters 
                          ? "bg-primary text-white border-primary" 
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <Filter size={16} />
                      <span>Filters</span>
                    </button>

                    {/* Clear Filters */}
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors text-xs sm:text-sm"
                      >
                        <X size={16} />
                        <span>Clear</span>
                      </button>
                    )}
                  </div>

                  {/* Advanced Filters */}
                  {showFilters && (
                    <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                          Subject
                        </label>
                        <select
                          value={filters.subject}
                          onChange={(e) => handleFilterChange("subject", e.target.value)}
                          className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
                        >
                          <option value="">All Subjects</option>
                          {uniqueSubjects.map(subject => (
                            <option key={subject} value={subject}>{subject}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                          Qualification
                        </label>
                        <select
                          value={filters.qualification}
                          onChange={(e) => handleFilterChange("qualification", e.target.value)}
                          className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
                        >
                          <option value="">All Qualifications</option>
                          {uniqueQualifications.map(qualification => (
                            <option key={qualification} value={qualification}>{qualification}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Search Button */}
                <div className="p-3 sm:p-4">
                  <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="w-full bg-primary text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    {loading ? "Searching..." : "Apply Filters"}
                  </button>
                </div>
              </div>

              {/* Search Status */}
              {hasActiveFilters && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4">
                  <div className="flex items-start sm:items-center gap-1.5 sm:gap-2 text-blue-700">
                    <Search size={14} className="flex-shrink-0 mt-0.5 sm:mt-0" />
                    <span className="text-xs sm:text-sm font-medium break-words">
                      {filters.search ? `Searching for: "${filters.search}"` : "Filters applied"}
                      {filters.subject && ` • Subject: ${filters.subject}`}
                      {filters.qualification && ` • Qualification: ${filters.qualification}`}
                    </span>
                  </div>
                </div>
              )}

              {/* Teacher List */}
              <TeacherList />
            </motion.div>
          )}
          {activeTab === "bulk" && (
            <motion.div
              key="bulk"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="pt-2 sm:pt-3 md:pt-4"
            >
              <UploadTeachersForm />
            </motion.div>
          )}
          {activeTab === "single" && (
            <motion.div
              key="single"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="pt-2 sm:pt-3 md:pt-4"
            >
              <AddTeacherForm />
            </motion.div>
          )}
          {activeTab === "images" && (
            <motion.div
              key="images"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="pt-2 sm:pt-3 md:pt-4"
            >
              <UpdateTeacherImages />
            </motion.div>
          )}
          {activeTab === "assign" && (
            <motion.div
              key="assign"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="pt-2 sm:pt-3 md:pt-4"
            >
              <AssignSectionForm />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TeacherManagement;
