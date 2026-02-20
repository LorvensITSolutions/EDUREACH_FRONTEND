import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Users, 
  Phone, 
  Plus, 
  Eye, 
  Search, 
  Filter,
  ChevronDown,
  User,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Edit2,
  X,
  Save
} from 'lucide-react';
import { useClassesAndSections } from '../../hooks/useClassesAndSections';

// Separate SearchInput component to prevent re-renders
const SearchInput = React.memo(({ value, onChange, placeholder, isSearching }) => {
  const inputRef = useRef(null);

  return (
    <div className="relative">
      <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
      {isSearching && (
        <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 border-b-2" style={{ borderColor: '#4DB6AC' }}></div>
        </div>
      )}
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-8 sm:pl-10 pr-2 sm:pr-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 transition-colors"
        style={{ 
          borderColor: '#D1D5DB',
          '--tw-ring-color': '#4DB6AC',
          paddingRight: isSearching ? '2rem' : '0.5rem'
        }}
      />
    </div>
  );
});

const ParentList = ({ onParentSelect }) => {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [expandedParent, setExpandedParent] = useState(null);
  const [editingPhone, setEditingPhone] = useState(null);
  const [phoneValue, setPhoneValue] = useState('');
  const [updatingPhone, setUpdatingPhone] = useState(false);
  
  // Get dynamic classes and sections
  const { classes, sections, loading: classesLoading, error: classesError } = useClassesAndSections();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalParents, setTotalParents] = useState(0);
  const [itemsPerPage] = useState(10);

  // Debounce search term to prevent too frequent API calls
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [isSearching, setIsSearching] = useState(false);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

  // Debounce search term
  useEffect(() => {
    if (searchTerm !== debouncedSearchTerm) {
      setIsSearching(true);
    }
    
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setIsSearching(false);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearchTerm]);

  // Memoize fetchParents to prevent unnecessary re-renders
  const fetchParents = useCallback(async () => {
    try {
      // Only show loading spinner on initial load, not during search
      if (!hasInitiallyLoaded && !isSearching) {
        setLoading(true);
      }
      
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm,
        childClass: filterClass,
        childSection: filterSection
      });
      
      const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
      const baseUrl = apiBase.endsWith('/api') ? apiBase : `${apiBase}/api`;
      const response = await fetch(`${baseUrl}/parents?${params}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setParents(data.parents || []);
        setTotalParents(data.total || 0);
        setTotalPages(Math.ceil((data.total || 0) / itemsPerPage));
        setError('');
        
        // Mark as initially loaded after first successful fetch
        if (!hasInitiallyLoaded) {
          setHasInitiallyLoaded(true);
        }
      } else {
        setError('Failed to fetch parents');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Error fetching parents:', err);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  }, [currentPage, debouncedSearchTerm, filterClass, filterSection, itemsPerPage, isSearching, hasInitiallyLoaded]);

  // Fetch parents data - only when dependencies change
  useEffect(() => {
    fetchParents();
  }, [fetchParents]);

  // Reset expanded parent when page or filters change
  useEffect(() => {
    setExpandedParent(null);
  }, [currentPage, debouncedSearchTerm, filterClass, filterSection]);


  // Pagination functions
  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const toggleExpanded = (parentId) => {
    setExpandedParent(prevExpanded => {
      return prevExpanded === parentId ? null : parentId;
    });
  };

  // Handle search input change - memoized to prevent re-renders
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  // Handle other filter changes
  const handleFilterChange = (filterType, value) => {
    setCurrentPage(1);
    if (filterType === 'class') setFilterClass(value);
    if (filterType === 'section') setFilterSection(value);
  };

  // Handle edit phone
  const handleEditPhone = (parent) => {
    setEditingPhone(parent._id);
    setPhoneValue(parent.phone || '');
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingPhone(null);
    setPhoneValue('');
  };

  // Handle update phone
  const handleUpdatePhone = async (parentId) => {
    const trimmedPhone = phoneValue.trim();
    
    if (!trimmedPhone) {
      alert('Phone number is required.');
      return;
    }
    
    if (!/^\d{10}$/.test(trimmedPhone)) {
      alert('Phone number must be exactly 10 digits.');
      return;
    }

    setUpdatingPhone(true);
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
      const baseUrl = apiBase.endsWith('/api') ? apiBase : `${apiBase}/api`;
      const response = await fetch(`${baseUrl}/parents/${parentId}/phone`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ phone: trimmedPhone })
      });

      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      
      if (response.ok) {
        const data = isJson ? await response.json() : { message: 'Phone number updated successfully' };
        // Update the parent in the local state
        setParents(prev => prev.map(p => 
          p._id === parentId ? { ...p, phone: trimmedPhone } : p
        ));
        setEditingPhone(null);
        setPhoneValue('');
        alert(data.message || 'Phone number updated successfully!');
      } else {
        const errorData = isJson ? await response.json() : { message: `Failed to update phone number (${response.status})` };
        alert(errorData.message || 'Failed to update phone number');
      }
    } catch (err) {
      alert('Network error. Please try again.');
      console.error('Error updating phone:', err);
    } finally {
      setUpdatingPhone(false);
    }
  };

  if (loading && !hasInitiallyLoaded) {
    return (
      <div className="flex items-center justify-center py-8 sm:py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 mx-auto mb-3 sm:mb-4" style={{ borderColor: '#00796B' }}></div>
          <p className="text-sm sm:text-base text-gray-600">Loading parents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-md text-sm sm:text-base">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold" style={{ color: '#00796B' }}>All Parents</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-0.5">Manage parent accounts and view their children</p>
        </div>
        <div className="text-xs sm:text-sm text-gray-500">
          {totalParents} parent{totalParents !== 1 ? 's' : ''} (Page {currentPage} of {totalPages})
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-3 sm:p-4" style={{ borderColor: '#4DB6AC' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          <SearchInput
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search parents..."
            isSearching={isSearching}
          />
          
          <div className="relative">
            <Filter className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
            <select
              value={filterClass}
              onChange={(e) => handleFilterChange('class', e.target.value)}
              className="w-full pl-8 sm:pl-10 pr-6 sm:pr-8 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 appearance-none transition-colors"
              style={{ 
                borderColor: '#D1D5DB',
                '--tw-ring-color': '#4DB6AC'
              }}
              disabled={classesLoading}
            >
              <option value="">All Classes</option>
              {classes.map((className) => (
                <option key={className} value={className}>
                  {className}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <Filter className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
            <select
              value={filterSection}
              onChange={(e) => handleFilterChange('section', e.target.value)}
              className="w-full pl-8 sm:pl-10 pr-6 sm:pr-8 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 appearance-none transition-colors"
              style={{ 
                borderColor: '#D1D5DB',
                '--tw-ring-color': '#4DB6AC'
              }}
              disabled={classesLoading}
            >
              <option value="">All Sections</option>
              {sections.map((section) => (
                <option key={section} value={section}>
                  Section {section}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 pointer-events-none" />
          </div>

          <button
            onClick={() => {
              setSearchTerm('');
              setFilterClass('');
              setFilterSection('');
              setCurrentPage(1);
            }}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Parents Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden" style={{ borderColor: '#4DB6AC' }}>
        {parents.length === 0 ? (
          <div className="p-4 sm:p-6 md:p-8 text-center">
            <Users className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No parents found</h3>
            <p className="text-sm sm:text-base text-gray-600 px-2">
              {searchTerm || filterClass || filterSection 
                ? 'Try adjusting your search or filters'
                : 'No parents have been added yet'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-gray-50 border-b" style={{ borderColor: '#4DB6AC' }}>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Parent Name
                  </th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Children
                  </th>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {parents.map((parent, index) => (
                  <React.Fragment key={`parent-${parent._id}-${index}`}>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 sm:px-4 py-2 sm:py-3">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E0F2F1' }}>
                              <User className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#00796B' }} />
                            </div>
                          </div>
                          <span className="text-sm sm:text-base font-medium text-gray-900 truncate max-w-[150px] sm:max-w-none">
                            {parent.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3">
                        {editingPhone === parent._id ? (
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <input
                              type="tel"
                              value={phoneValue}
                              onChange={(e) => {
                                const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
                                setPhoneValue(digitsOnly);
                              }}
                              maxLength={10}
                              placeholder="10 digits"
                              className="w-24 sm:w-32 px-2 py-1 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              disabled={updatingPhone}
                            />
                            <button
                              onClick={() => handleUpdatePhone(parent._id)}
                              disabled={updatingPhone}
                              className="p-1 text-green-600 hover:text-green-800 disabled:opacity-50"
                              title="Save"
                            >
                              <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              disabled={updatingPhone}
                              className="p-1 text-red-600 hover:text-red-800 disabled:opacity-50"
                              title="Cancel"
                            >
                              <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1.5 sm:space-x-2">
                            {parent.phone ? (
                              <>
                                <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 text-gray-600" />
                                <span className="text-sm sm:text-base text-gray-600 truncate max-w-[120px] sm:max-w-none">{parent.phone}</span>
                              </>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                            <button
                              onClick={() => handleEditPhone(parent)}
                              className="p-1 text-blue-600 hover:text-blue-800 ml-1"
                              title="Edit phone number"
                            >
                              <Edit2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3">
                        <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800">
                          {parent.children?.length || 0}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3">
                        <div className="flex items-center justify-center space-x-1.5 sm:space-x-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleExpanded(parent._id);
                            }}
                            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors whitespace-nowrap"
                            style={{ outline: 'none' }}
                            title={expandedParent === parent._id ? 'Hide Children' : 'View Children'}
                          >
                            <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">{expandedParent === parent._id ? 'Hide' : 'View'}</span>
                          </button>
                          
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              onParentSelect(parent);
                            }}
                            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-white rounded-md transition-colors whitespace-nowrap"
                            style={{ 
                              backgroundColor: '#00796B'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#00695C'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#00796B'}
                            title="Add Child"
                          >
                            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">Add</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Children List (Expandable Row) */}
                    {expandedParent === parent._id && (
                      <tr>
                        <td colSpan="4" className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 bg-gray-50">
                          <div className="mb-2 sm:mb-3">
                            <h4 className="text-sm sm:text-base font-medium text-gray-900">
                              Children ({parent.children?.length || 0})
                            </h4>
                          </div>
                          
                          {parent.children && parent.children.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="w-full min-w-[500px] bg-white rounded-lg border">
                                <thead>
                                  <tr className="bg-gray-100 border-b">
                                    <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-xs sm:text-sm font-medium text-gray-700">Name</th>
                                    <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-xs sm:text-sm font-medium text-gray-700">Class</th>
                                    <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-xs sm:text-sm font-medium text-gray-700">Section</th>
                                    <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-xs sm:text-sm font-medium text-gray-700">Student ID</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                  {parent.children.map((child, childIndex) => (
                                    <tr key={childIndex} className="hover:bg-gray-50">
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-900 break-words">
                                        {child.name}
                                      </td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600">
                                        {child.class || '-'}
                                      </td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600">
                                        {child.section || '-'}
                                      </td>
                                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-blue-600 font-mono break-all">
                                        {child.studentId || child.id || child._id || 'Not assigned'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="text-center py-3 sm:py-4 text-xs sm:text-sm text-gray-500 bg-white rounded-lg border">
                              No children added yet
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg shadow-sm border p-3 sm:p-4" style={{ borderColor: '#4DB6AC' }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalParents)} of {totalParents} parents
            </div>
            
            <div className="flex items-center justify-center space-x-1 sm:space-x-2">
              <button
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className="p-1.5 sm:p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                aria-label="First page"
              >
                <ChevronsLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
              
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className="p-1.5 sm:p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
              
              <div className="flex items-center space-x-0.5 sm:space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  const isActive = page === currentPage;
                  
                  return (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md border transition-colors ${
                        isActive 
                          ? 'text-white border-transparent' 
                          : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                      style={{
                        backgroundColor: isActive ? '#00796B' : 'transparent'
                      }}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className="p-1.5 sm:p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
              
              <button
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-1.5 sm:p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                aria-label="Last page"
              >
                <ChevronsRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentList;
