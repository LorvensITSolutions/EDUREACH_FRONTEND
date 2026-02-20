// src/components/students/StudentTable.jsx
import { useEffect, useState } from "react";
import { useStudentStore } from "../stores/useStudentStore";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, Filter, X, Eye, Trash2 } from "lucide-react";
import axios from "../lib/axios";
import StudentProfileModal from "../admin/StudentProfileModal";

// Custom styles for mobile responsiveness
const styles = `
  @media (max-width: 475px) {
    .xs\\:hidden {
      display: none !important;
    }
    .xs\\:inline {
      display: inline !important;
    }
    .xs\\:table-cell {
      display: none !important;
    }
  }
`;

const StudentTable = () => {
  const { 
    students, 
    fetchStudents, 
    deleteStudent, 
    pagination, 
    goToPage, 
    nextPage, 
    prevPage,
    isLoading: storeLoading
  } = useStudentStore();

  // Helper to get current academic year in "YYYY-YYYY" format
  const getCurrentAcademicYear = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-based, so 5 = June
    if (currentMonth >= 5) {
      return `${currentYear}-${currentYear + 1}`;
    } else {
      return `${currentYear - 1}-${currentYear}`;
    }
  };
console.log("Current totallllll students :", pagination);
  const currentAcademicYear = getCurrentAcademicYear();

  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    class: "",
    section: "",
    academicYear: ""
  });
  const [showFilters, setShowFilters] = useState(false);

  // State for unique classes, sections and academic years
  const [uniqueClasses, setUniqueClasses] = useState([]);
  const [uniqueSections, setUniqueSections] = useState([]);
  const [uniqueAcademicYears, setUniqueAcademicYears] = useState([]);
  
  // State to track current active filters for pagination
  const [activeFilters, setActiveFilters] = useState({});
  
  // State for profile modal
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Sort classes: Nursery first, then LKG, then numeric (1, 2, 3...)
  const sortClasses = (classes) => {
    // Define the order for special classes
    const classOrder = {
      'Nursery': 1,
      'LKG': 2,
      'UKG': 3, // In case UKG exists
    };
    
    return [...classes].sort((a, b) => {
      // Get order values (undefined if not in special list)
      const aOrder = classOrder[a];
      const bOrder = classOrder[b];
      
      // If both are special classes, use their defined order
      if (aOrder !== undefined && bOrder !== undefined) {
        return aOrder - bOrder;
      }
      
      // If only a is special, it comes first
      if (aOrder !== undefined) {
        return -1;
      }
      
      // If only b is special, it comes first
      if (bOrder !== undefined) {
        return 1;
      }
      
      // Check if both are numeric
      const aNum = parseInt(a);
      const bNum = parseInt(b);
      const aIsNum = !isNaN(aNum) && a.toString() === aNum.toString();
      const bIsNum = !isNaN(bNum) && b.toString() === bNum.toString();
      
      // If both are numeric, sort numerically
      if (aIsNum && bIsNum) {
        return aNum - bNum;
      }
      
      // If only a is numeric, it comes after special classes but before other text
      if (aIsNum && !bIsNum) {
        return -1;
      }
      
      // If only b is numeric, it comes after special classes but before other text
      if (!aIsNum && bIsNum) {
        return 1;
      }
      
      // If both are non-numeric and not special, sort alphabetically
      return a.localeCompare(b);
    });
  };

  // Load unique classes and sections for dropdowns
  const loadUniqueValues = async () => {
    try {
      const { data } = await axios.get('/students/unique-values');
      // Sort classes properly: numeric first, then alphabetical
      const sortedClasses = sortClasses(data.classes || []);
      setUniqueClasses(sortedClasses);
      // Sort sections alphabetically
      const sortedSections = [...(data.sections || [])].sort((a, b) => a.localeCompare(b));
      setUniqueSections(sortedSections);
      // Academic years - use as provided from backend (already sorted there)
      setUniqueAcademicYears(data.academicYears || []);
    } catch (error) {
      console.error('Failed to load unique values:', error);
    }
  };

  // Load unique values on component mount
  useEffect(() => {
    loadUniqueValues();
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (filters.search || filters.class || filters.section || filters.academicYear) {
        handleFilter();
      }
    }, 300); // Reduced timeout for better responsiveness

    return () => clearTimeout(timeoutId);
  }, [filters]);

  // Immediate filter for dropdowns (no debounce)
  const handleDropdownChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Trigger immediate search for dropdown changes
    if (value) {
      const cleanFilters = Object.fromEntries(Object.entries(newFilters).filter(([_, val]) => val));
      const filterParams = {
        page: 1,
        limit: 10,
        ...cleanFilters
      };
      console.log("🔍 Immediate filter for dropdown:", filterParams);
      
      // Store active filters for pagination
      setActiveFilters(cleanFilters);
      
      fetchStudents(filterParams);
    }
  };

  const handleFilter = async () => {
    const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([_, value]) => value));
    const filterParams = {
      page: 1,
      limit: 10,
      ...cleanFilters
    };
    
    console.log("🔍 Filtering with params:", filterParams);
    console.log("🔍 Current filters:", filters);
    
    // Store active filters for pagination
    setActiveFilters(cleanFilters);
    
    await fetchStudents(filterParams);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      class: "",
      section: "",
      academicYear: ""
    });
    setActiveFilters({});
    // Don't automatically fetch students - let user choose to load all or apply filters
  };

  const loadAllStudents = () => {
    setFilters({
      search: "",
      class: "",
      section: "",
      academicYear: ""
    });
    setActiveFilters({});
    fetchStudents({ page: 1, limit: 10 });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Handle profile modal
  const handleViewProfile = (student) => {
    setSelectedStudent(student);
    setIsProfileModalOpen(true);
  };

  const handleCloseProfile = () => {
    setIsProfileModalOpen(false);
    setSelectedStudent(null);
  };

  // Debug: Log student data to see image structure and pagination
  useEffect(() => {
    if (students.length > 0) {
      console.log("Students data sample:", students[0]);
      console.log("First student image:", students[0]?.image);
    }
    console.log("Pagination data:", pagination);
  }, [students, pagination]);

  return (
    <>
      <style jsx>{styles}</style>
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-md overflow-hidden">
      {/* Filter Section */}
      <div className="p-3 sm:p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by name or student ID..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full pl-10 pr-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg border transition-colors text-sm sm:text-base ${
              showFilters 
                ? "bg-primary text-white border-primary" 
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            <Filter size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="hidden xs:inline">Filters</span>
            <span className="xs:hidden">Filter</span>
          </button>

          {/* Load All Students Button */}
          {!Object.values(filters).some(value => value) && students.length === 0 && (
            <button
              onClick={loadAllStudents}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors text-sm sm:text-base"
            >
              <Search size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="hidden xs:inline">Load All Students</span>
              <span className="xs:hidden">Load All</span>
            </button>
          )}

          {/* Clear Filters */}
          {(filters.search || filters.class || filters.section || filters.academicYear) && (
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={clearFilters}
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors text-sm sm:text-base"
              >
                <X size={16} className="sm:w-[18px] sm:h-[18px]" />
                Clear
              </button>
              <button
                onClick={loadAllStudents}
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors text-sm sm:text-base"
              >
                <Search size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden xs:inline">Show All</span>
                <span className="xs:hidden">All</span>
              </button>
            </div>
          )}
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Academic Year
              </label>
              <select
                value={filters.academicYear}
                onChange={(e) => handleDropdownChange("academicYear", e.target.value)}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Academic Years</option>
                {uniqueAcademicYears.map((year) => (
                  <option key={year} value={year}>
                    {year}{year === currentAcademicYear ? " (Current)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class
              </label>
              <select
                value={filters.class}
                onChange={(e) => handleDropdownChange("class", e.target.value)}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Classes</option>
                {uniqueClasses.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Section
              </label>
              <select
                value={filters.section}
                onChange={(e) => handleDropdownChange("section", e.target.value)}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Sections</option>
                {uniqueSections.map(section => (
                  <option key={section} value={section}>{section}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      {students.length === 0 && !storeLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mx-3 sm:mx-4 my-3 sm:my-4">
          <div className="flex items-center gap-2 text-blue-800">
            <Search size={18} className="sm:w-5 sm:h-5" />
            <div>
              <div className="font-medium text-sm sm:text-base">No students loaded</div>
              <div className="text-xs sm:text-sm">Use the search bar or filters above to find specific students, or click "Load All Students" to view all records.</div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {storeLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto text-xs sm:text-sm text-left">
        <thead className="bg-primary text-white">
          <tr>
            <th className="px-1 sm:px-2 md:px-4 py-2 hidden xs:table-cell">Photo</th>
            <th className="px-1 sm:px-2 md:px-4 py-2">ID</th>
            <th className="px-1 sm:px-2 md:px-4 py-2">Name</th>
            <th className="px-1 sm:px-2 md:px-4 py-2">Class</th>
            <th className="px-1 sm:px-2 md:px-4 py-2 hidden sm:table-cell">Section</th>
            <th className="px-1 sm:px-2 md:px-4 py-2 hidden lg:table-cell">Parent</th>
            <th className="px-1 sm:px-2 md:px-4 py-2 hidden xl:table-cell">Credentials</th>
            <th className="px-1 sm:px-2 md:px-4 py-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s._id} className="border-t hover:bg-gray-100">
              <td className="px-1 sm:px-2 md:px-4 py-2 hidden xs:table-cell">
                <div className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-gray-300 shadow-sm">
                  {s.image?.url ? (
                    <img
                      src={s.image.url}
                      alt={s.name}
                      className="w-full h-full object-cover object-center"
                      style={{ objectPosition: 'center top' }}
                      onError={(e) => {
                        // Remove the onError handler to prevent infinite loop
                        e.target.onerror = null;
                        console.log(`Image failed to load for student ${s.studentId}:`, s.image);
                        // Hide the image and show initials instead
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `<span class="text-gray-600 font-semibold text-xs sm:text-sm md:text-lg">${s.name.charAt(0).toUpperCase()}</span>`;
                      }}
                    />
                  ) : (
                    <span className="text-gray-600 font-semibold text-xs sm:text-sm md:text-lg">
                      {s.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-1 sm:px-2 md:px-4 py-2 font-medium text-xs sm:text-sm">{s.studentId}</td>
              <td className="px-1 sm:px-2 md:px-4 py-2 text-xs sm:text-sm">{s.name}</td>
              <td className="px-1 sm:px-2 md:px-4 py-2 text-xs sm:text-sm">{s.class}</td>
              <td className="px-1 sm:px-2 md:px-4 py-2 hidden sm:table-cell text-xs sm:text-sm">{s.section}</td>
              <td className="px-1 sm:px-2 md:px-4 py-2 hidden lg:table-cell text-xs sm:text-sm">{s.parent?.name || "N/A"}</td>
              <td className="px-1 sm:px-2 md:px-4 py-2 hidden xl:table-cell text-xs sm:text-sm">
                {s.generatedCredentials ? (
                  <div className="space-y-2">
                    {/* Student Credentials */}
                    <div className="font-mono text-green-600 border-b pb-1">
                      <div className="text-xs text-gray-500">Student:</div>
                      <div>User: {s.generatedCredentials.username}</div>
                      <div>Pass: {s.generatedCredentials.password}</div>
                    </div>
                    {/* Parent Credentials */}
                    <div className="font-mono text-blue-600">
                      <div className="text-xs text-gray-500">Parent:</div>
                      <div>User: P{s.generatedCredentials.username}</div>
                      <div>Pass: {s.generatedCredentials.password}</div>
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-400">Not generated</span>
                )}
              </td>
              <td className="px-1 sm:px-2 md:px-4 py-2 text-center">
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                  <button
                    onClick={() => handleViewProfile(s)}
                    className="bg-blue-500 text-white px-1 sm:px-2 md:px-3 py-1 rounded hover:bg-blue-600 transition text-xs sm:text-sm flex items-center gap-1"
                    title="View Profile"
                  >
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">View</span>
                  </button>
                  <button
                    onClick={() => deleteStudent(s._id)}
                    className="bg-red-500 text-white px-1 sm:px-2 md:px-3 py-1 rounded hover:bg-red-600 transition text-xs sm:text-sm flex items-center gap-1"
                    title="Delete Student"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {students.length === 0 && (
            <tr>
              <td colSpan="8" className="text-center py-8 text-gray-500">
                {Object.values(filters).some(value => value) ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-lg font-medium">No students found matching your filters</div>
                    <div className="text-sm">Try adjusting your search criteria</div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-lg font-medium">No students loaded</div>
                    <div className="text-sm">Please apply filters to view students</div>
                  </div>
                )}
              </td>
            </tr>
          )}
        </tbody>
        </table>
      </div>
      
      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-2 sm:px-4 py-3 bg-gray-50 border-t gap-2 sm:gap-3">
          {/* Mobile: Show current page info */}
          <div className="flex items-center text-xs sm:text-sm text-gray-700 order-2 sm:order-1">
            <span className="text-center sm:text-left">
              <span className="hidden xs:inline">
                Showing {((pagination?.currentPage || 1) - 1) * (pagination?.limit || 10) + 1} to{' '}
                {Math.min((pagination?.currentPage || 1) * (pagination?.limit || 10), pagination?.totalStudents || 0)} of{' '}
                {pagination?.totalStudents || 0} students
              </span>
              <span className="xs:hidden">
                Page {pagination?.currentPage || 1} of {pagination?.totalPages || 1}
              </span>
            </span>
          </div>
          
          {/* Pagination Controls */}
          <div className="flex items-center space-x-1 sm:space-x-2 order-1 sm:order-2">
            {/* First Page - Hidden on mobile */}
            <button
              onClick={() => goToPage(1, activeFilters)}
              disabled={!pagination?.hasPrevPage}
              className="hidden sm:flex p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronsLeft size={16} />
            </button>
            
            {/* Previous Page */}
            <button
              onClick={() => prevPage(activeFilters)}
              disabled={!pagination?.hasPrevPage}
              className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            
            {/* Page Numbers - Responsive */}
            <div className="flex items-center space-x-1">
              {/* Mobile: Show only 3 pages */}
              <div className="flex sm:hidden">
                {Array.from({ length: Math.min(3, pagination?.totalPages || 1) }, (_, i) => {
                  let pageNum;
                  const totalPages = pagination?.totalPages || 1;
                  const currentPage = pagination?.currentPage || 1;
                  
                  if (totalPages <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage <= 2) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 1) {
                    pageNum = totalPages - 2 + i;
                  } else {
                    pageNum = currentPage - 1 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum, activeFilters)}
                      className={`px-2 py-2 text-xs rounded-md border ${
                        pageNum === currentPage
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              {/* Desktop: Show up to 5 pages */}
              <div className="hidden sm:flex">
                {Array.from({ length: Math.min(5, pagination?.totalPages || 1) }, (_, i) => {
                  let pageNum;
                  const totalPages = pagination?.totalPages || 1;
                  const currentPage = pagination?.currentPage || 1;
                  
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum, activeFilters)}
                      className={`px-3 py-2 text-sm rounded-md border ${
                        pageNum === currentPage
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Next Page */}
            <button
              onClick={() => nextPage(activeFilters)}
              disabled={!pagination?.hasNextPage}
              className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
            
            {/* Last Page - Hidden on mobile */}
            <button
              onClick={() => goToPage(pagination?.totalPages || 1, activeFilters)}
              disabled={!pagination?.hasNextPage}
              className="hidden sm:flex p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Student Profile Modal */}
      <StudentProfileModal
        student={selectedStudent}
        isOpen={isProfileModalOpen}
        onClose={handleCloseProfile}
      />
      </div>
    </>
  );
};

export default StudentTable;
