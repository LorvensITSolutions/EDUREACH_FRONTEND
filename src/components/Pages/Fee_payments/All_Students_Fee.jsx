import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useFeeStore } from "../../stores/useFeeStore";
import { Loader2, MailCheck, Search, Table, Grid } from "lucide-react";
import { format } from "date-fns";
import { getCurrentAcademicYear, getAcademicYearOptions } from "../../../utils/academicYear";
import axios from "../../lib/axios";
import { toast } from "react-hot-toast";

const FeeDefaultersPage = () => {
  const {
    allStudentsFeeStatus,
    fetchAllStudentsFeeStatus,
    sendFeeReminder,
    defaultersLoading,
    clearFilters,
    goToPage,
    statusFilter,
    searchQuery,
    customFeeFilter,
    currentPage,
    totalPages,
    totalStudents,
  } = useFeeStore();

  const [sendingMap, setSendingMap] = useState({});
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "table"
  const [debounceTimer, setDebounceTimer] = useState(null);
  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());
  const [academicYearOptions, setAcademicYearOptions] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [availableClasses, setAvailableClasses] = useState([]);
  const [availableClassSections, setAvailableClassSections] = useState([]);
  const [localPage, setLocalPage] = useState(1); // Local pagination for frontend filtering

  // Initialize academic year options
  useEffect(() => {
    setAcademicYearOptions(getAcademicYearOptions(2, 2)); // 2 years before, 2 years after
    // Fetch available classes for current academic year on mount
    fetchAvailableClasses(getCurrentAcademicYear());
  }, []);

  // Function to fetch available classes for an academic year
  const fetchAvailableClasses = async (year) => {
    try {
      const response = await axios.get('/payment/available-classes', {
        params: { academicYear: year }
      });
      if (response.data && response.data.success) {
        setAvailableClasses(response.data.classes || []);
        setAvailableClassSections(response.data.classSectionCombos || []);
      }
    } catch (error) {
      console.error('Error fetching available classes:', error);
      setAvailableClasses([]);
      setAvailableClassSections([]);
    }
  };

  // Debounced search function
  const debouncedSearch = useCallback((value) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    const timer = setTimeout(() => {
      fetchAllStudentsFeeStatus({
        status: statusFilter,
        search: value,
        customFeeFilter,
        academicYear,
        page: 1,
        limit: selectedClass ? 200 : 20 // Higher limit if class selected (for frontend filtering)
      });
    }, 500); // 500ms debounce
    
    setDebounceTimer(timer);
  }, [statusFilter, customFeeFilter, academicYear, fetchAllStudentsFeeStatus]);

  // Initial load - only fetch if class is selected or "All Classes" is selected
  useEffect(() => {
    // Don't fetch on initial mount - wait for class selection
    // This prevents loading all students immediately
  }, []); // Only on mount

  // Don't auto-fetch when academic year changes - wait for class selection
  
  // Reset local page when class selection changes
  useEffect(() => {
    setLocalPage(1);
  }, [selectedClass]);

  // Handle search with debouncing
  const handleSearchChange = (value) => {
    setSearch(value);
    debouncedSearch(value);
  };

  // Handle filter changes
  const handleFilterChange = useCallback((filterType, value) => {
    // fetchAllStudentsFeeStatus automatically updates the filter state in the store
    const newStatus = filterType === "status" ? value : statusFilter;
    const newCustomFee = filterType === "customFee" ? value : customFeeFilter;
    const currentSearch = search || searchQuery || "";
    
    console.log("Filter change:", { filterType, value, newStatus, newCustomFee, currentSearch });
    
    fetchAllStudentsFeeStatus({
      status: newStatus,
      search: currentSearch,
      customFeeFilter: newCustomFee,
      academicYear,
      page: 1,
      limit: 20
    });
  }, [search, searchQuery, statusFilter, customFeeFilter, academicYear, fetchAllStudentsFeeStatus]);

  const handleReminderSend = async (studentId) => {
    setSendingMap((prev) => ({ ...prev, [studentId]: true }));
    try {
      await sendFeeReminder(studentId);
    } finally {
      setSendingMap((prev) => ({ ...prev, [studentId]: false }));
    }
  };

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  return (
    <div className="p-2 sm:p-4 md:p-6">
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-5 md:mb-6 text-gray-800">
        📋 Fee Defaulters - {academicYear}
      </h2>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-5 md:mb-6">
        {/* Academic Year Filter - First Priority */}
        <select
          className="border px-3 py-2 sm:px-4 sm:py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50 font-medium text-sm sm:text-base"
          value={academicYear}
          onChange={(e) => {
            const newYear = e.target.value;
            setAcademicYear(newYear);
            // Reset class and section filters when academic year changes
            setSelectedClass("");
            setSelectedSection("");
            // Fetch available classes for the new academic year
            fetchAvailableClasses(newYear);
            // Clear current data - don't fetch until class is selected
            // This prevents loading all students immediately
          }}
        >
          {academicYearOptions.map((year) => (
            <option key={year} value={year}>
              {year} {year === getCurrentAcademicYear() ? '(Current)' : ''}
            </option>
          ))}
        </select>

        {/* Search Input with Debouncing */}
        <div className="relative">
          <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, ID..."
            className="border px-3 py-2 pl-8 sm:pl-10 sm:px-4 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <select
          className="border px-3 py-2 sm:px-4 sm:py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          value={statusFilter || ""}
          onChange={(e) => {
            const value = e.target.value;
            fetchAllStudentsFeeStatus({
              status: value || "",
              search: search || searchQuery || "",
              customFeeFilter: customFeeFilter || "",
              academicYear: academicYear || getCurrentAcademicYear(),
              page: 1,
              limit: 20
            });
          }}
        >
          <option value="">All Statuses</option>
          <option value="Paid">Paid</option>
          <option value="Unpaid">Unpaid</option>
          <option value="Partially Paid">Partially Paid</option>
        </select>

        {/* Custom Fee Filter */}
        <select
          className="border px-3 py-2 sm:px-4 sm:py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          value={customFeeFilter || ""}
          onChange={(e) => {
            const value = e.target.value;
            fetchAllStudentsFeeStatus({
              status: statusFilter || "",
              search: search || searchQuery || "",
              customFeeFilter: value || "",
              academicYear: academicYear || getCurrentAcademicYear(),
              page: 1,
              limit: 20
            });
          }}
        >
          <option value="">All Fee Types</option>
          <option value="yes">Custom Fee Only</option>
          <option value="no">Standard Fee Only</option>
        </select>

        {/* Class-Section Filter */}
        <select
          className="border px-3 py-2 sm:px-4 sm:py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          value={selectedClass}
          onChange={(e) => {
            const newValue = e.target.value;
            setSelectedClass(newValue);
            
            // Parse class and section from value (format: "class-section" or empty for "All Classes")
            if (newValue === "") {
              setSelectedSection("");
              // Fetch all students when "All Classes" is selected
              fetchAllStudentsFeeStatus({
                status: statusFilter || "",
                search: search || searchQuery || "",
                customFeeFilter: customFeeFilter || "",
                academicYear: academicYear || getCurrentAcademicYear(),
                page: 1,
                limit: 20
              });
            } else {
              // Value is in format "class-section" (e.g., "1-A", "2-B")
              const [classNum, section] = newValue.split('-');
              setSelectedSection(section || "");
              
              setLocalPage(1); // Reset to page 1 when class changes
              
              // Fetch data for the selected class-section
              // Use reasonable limit - backend is now optimized
              fetchAllStudentsFeeStatus({
                status: statusFilter || "",
                search: search || searchQuery || "",
                customFeeFilter: customFeeFilter || "",
                academicYear: academicYear || getCurrentAcademicYear(),
                page: 1,
                limit: 200 // Reduced from 1000 - backend is optimized now
              });
            }
          }}
        >
          <option value="">All Classes</option>
          {availableClassSections.map(item => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>

        {/* Section Filter - Hidden since we're using class-section combo */}
        {/* <select
          className="border px-4 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 opacity-50 cursor-not-allowed"
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
          disabled={true}
          title="Section is included in Class-Section dropdown above"
        >
          <option value="">All Sections</option>
        </select> */}

        {/* View Mode Toggle */}
        <div className="flex gap-2">
          <button
            className={`flex-1 px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium flex items-center justify-center gap-1 sm:gap-2 ${
              viewMode === "grid"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setViewMode("grid")}
          >
            <Grid className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Grid</span>
          </button>
          <button
            className={`flex-1 px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium flex items-center justify-center gap-1 sm:gap-2 ${
              viewMode === "table"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setViewMode("table")}
          >
            <Table className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Table</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-3 sm:mb-4">
        {/* Clear Button */}
        <button
          className="bg-red-100 text-red-700 hover:bg-red-200 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium"
          onClick={() => {
            setSearch("");
            setSelectedClass("");
            setSelectedSection("");
            setLocalPage(1); // Reset local pagination
            clearFilters();
            const currentYear = getCurrentAcademicYear();
            setAcademicYear(currentYear);
            // Fetch available classes for current year (to populate dropdown)
            fetchAvailableClasses(currentYear);
            // Clear student data - don't fetch anything
            // User needs to select "All Classes" or a specific class to load data
          }}
        >
          Clear Filters
        </button>
        
        {/* Results Count */}
        {!defaultersLoading && (() => {
          // Calculate filtered count based on class selection
          let filteredCount = allStudentsFeeStatus.length;
          
          if (selectedClass) {
            const [classNum, section] = selectedClass.split('-');
            filteredCount = allStudentsFeeStatus.filter(s => {
              const studentClass = s.student.displayClass || s.student.class;
              const studentSection = s.student.displaySection || s.student.section;
              return studentClass === classNum && studentSection === section;
            }).length;
          }
          
          // Use filtered count if class is selected, otherwise use total from backend
          const displayCount = selectedClass ? filteredCount : totalStudents;
          const pageToUse = selectedClass ? localPage : currentPage;
          
          if (displayCount > 0) {
            const limit = 20;
            const start = (pageToUse - 1) * limit + 1;
            const end = Math.min(pageToUse * limit, displayCount);
            return (
              <div className="flex items-center px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-600">
                Showing {start}-{end} of {displayCount} students
              </div>
            );
          }
          return null;
        })()}
      </div>


      {/* Main Content */}
      {!selectedClass && !defaultersLoading && allStudentsFeeStatus.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <p className="text-blue-600 font-semibold text-base sm:text-lg">📋 Please select a class to view student fee status</p>
          <p className="text-gray-500 text-xs sm:text-sm mt-2">Choose a class from the dropdown above to load student data</p>
        </div>
      ) : defaultersLoading ? (
        <div className="flex items-center justify-center gap-2 text-gray-700 py-8 sm:py-12">
          <Loader2 className="animate-spin w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-sm sm:text-base">Loading student fee statuses...</span>
        </div>
      ) : (() => {
        // Apply class and section filters on frontend
        let displayStudents = allStudentsFeeStatus;
        
        if (selectedClass) {
          // selectedClass is in format "class-section" (e.g., "1-A", "2-B")
          const [classNum, section] = selectedClass.split('-');
          displayStudents = displayStudents.filter(s => {
            const studentClass = String(s.student.displayClass || s.student.class).trim();
            const studentSection = String(s.student.displaySection || s.student.section).trim();
            return studentClass === String(classNum).trim() && studentSection === String(section).trim();
          });
        }
        
        // Calculate pagination for filtered results
        const limit = 20;
        const filteredTotal = displayStudents.length;
        const filteredTotalPages = Math.ceil(filteredTotal / limit);
        // Use localPage if class is selected, otherwise use currentPage from store
        const pageToUse = selectedClass ? localPage : currentPage;
        const startIndex = (pageToUse - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedStudents = displayStudents.slice(startIndex, endIndex);
        
        if (displayStudents.length === 0) {
          return (
            <div className="text-center py-8 sm:py-12">
              <p className="text-green-600 font-semibold text-base sm:text-lg">🎉 No students found!</p>
              <p className="text-gray-500 text-xs sm:text-sm mt-2">Try adjusting your filters</p>
            </div>
          );
        }
        
        return viewMode === "table" ? (
        /* Table View - Better for large datasets */
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <table className="w-full min-w-[640px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase">Student</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase">Class-Section</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-semibold text-gray-700 uppercase">Base Fee</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-semibold text-gray-700 uppercase">Paid</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-semibold text-gray-700 uppercase">Remaining</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs font-semibold text-gray-700 uppercase">Status</th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs font-semibold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedStudents.map((item) => (
                  <tr key={item.student._id} className="hover:bg-gray-50">
                    <td className="px-2 sm:px-4 py-2 sm:py-3">
                      <div>
                        <p className="font-medium text-gray-900 text-xs sm:text-sm">{item.student.name}</p>
                        <p className="text-xs text-gray-500">ID: {item.student.studentId || "N/A"}</p>
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-700">
                      Class {item.student.displayClass || item.student.class}-{item.student.displaySection || item.student.section}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm text-gray-700">
                      ₹{item.baseFee.toLocaleString()}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm text-green-600 font-medium">
                      ₹{item.totalPaid.toLocaleString()}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm text-red-600 font-medium">
                      ₹{item.remaining.toLocaleString()}
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                      <span
                        className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full ${
                          item.paymentStatus === "Paid"
                            ? "bg-green-100 text-green-700"
                            : item.paymentStatus === "Partially Paid"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {item.paymentStatus}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                      {item.paymentStatus !== "Paid" && (
                        <button
                          disabled={sendingMap[item.student._id]}
                          onClick={() => handleReminderSend(item.student._id)}
                          className="px-2 sm:px-3 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded hover:bg-yellow-200 disabled:opacity-50"
                        >
                          {sendingMap[item.student._id] ? "Sending..." : "Remind"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {paginatedStudents.map((item) => (
            <div
              key={item.student._id}
              className="bg-white shadow rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200 flex flex-col justify-between"
            >
              <div className="space-y-1">
                <h3 className="font-semibold text-base sm:text-lg text-gray-800">
                  {item.student.name} – Class {item.student.displayClass || item.student.class}
                  {item.student.displaySection || item.student.section}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  🎓 ID NUMBER: {item.student.studentId || "N/A"}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 break-words">
                  👨‍👩‍👧 Parent: {item.parent?.name} | 📧 {item.parent?.email}
                </p>
              </div>

              <hr className="my-2 sm:my-3" />

              <div className="text-xs sm:text-sm text-gray-700 space-y-1">
                <p>
                  💰 <strong>Base Fee:</strong> ₹{item.baseFee}
                </p>
                <p>
                  ✅ <strong>Total Paid:</strong> ₹{item.totalPaid}
                </p>
                <p className="text-red-600 font-medium">
                  💸 <strong>Remaining:</strong> ₹{item.remaining}
                </p>
                <p>
                  🏷️ <strong>Status:</strong>{" "}
                  <span
                    className={
                      item.paymentStatus === "Paid"
                        ? "text-green-600"
                        : item.paymentStatus === "Partially Paid"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }
                  >
                    {item.paymentStatus}
                  </span>
                </p>

                {item.discount > 0 && (
                  <p className="text-green-600">
                    🎁 <strong>Discount:</strong> ₹{item.discount} (
                    {item.discountPercentage})
                  </p>
                )}

                <p>
                  📅 <strong>Due Date:</strong>{" "}
                  {item.dueDate
                    ? format(new Date(item.dueDate), "dd MMM yyyy")
                    : "N/A"}
                </p>
                <p>
                  🕒 <strong>Overdue Days:</strong> {item.overdueDays}
                </p>
                <p>
                  🔁 <strong>Late Fee/Day:</strong> ₹{item.lateFeePerDay}
                </p>
                <p>
                  ⏱️ <strong>Total Late Fee:</strong> ₹{item.totalLateFee}
                </p>
                <p className="font-bold text-red-600">
                  🧾 Total Payable: ₹{item.totalDue}
                </p>
              </div>

              {/* Payment History */}
              {item.paymentHistory?.length > 0 && (
                <details className="mt-2 sm:mt-3 bg-gray-50 border border-gray-200 rounded p-2 sm:p-3 text-xs sm:text-sm">
                  <summary className="cursor-pointer text-blue-600 font-medium">
                    🧾 View Payment History ({item.paymentHistory.length})
                  </summary>
                  <ul className="space-y-2 mt-2">
                    {item.paymentHistory.map((p, i) => (
                      <li key={i} className="border-b pb-2">
                        <p>
                          🗓️ <strong>Date:</strong>{" "}
                          {format(new Date(p.paidAt), "dd MMM yyyy")}
                        </p>
                        <p>
                          💵 <strong>Paid:</strong> ₹{p.amountPaid} + Late Fee ₹
                          {p.lateFee || 0} ={" "}
                          <span className="font-semibold text-green-700">
                            ₹{p.total}
                          </span>
                        </p>
                        {/* ✅ Show payment method */}
                        {p.paymentMethod && (
                          <p>
                            💳 <strong>Method:</strong>{" "}
                            <span className={`font-medium ${
                              p.paymentMethod === "cash" 
                                ? "text-green-600" 
                                : "text-blue-600"
                            }`}>
                              {p.paymentMethod === "cash" ? "Cash" : "Online"}
                            </span>
                          </p>
                        )}
                        {p.receiptUrl ? (
                          <p>
                            📥{" "}
                            <button
                              onClick={async () => {
                                try {
                                  // If it's a Cloudinary URL, open directly
                                  if (p.receiptUrl.startsWith('http')) {
                                    window.open(p.receiptUrl, '_blank');
                                    return;
                                  }
                                  
                                  // If it's an API endpoint, construct full URL and fetch with authentication
                                  const apiBase = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
                                  const receiptUrl = `${apiBase}${p.receiptUrl}`;
                                  
                                  // Use fetch to get the PDF with credentials (cookies)
                                  const response = await fetch(receiptUrl, {
                                    method: 'GET',
                                    credentials: 'include', // Include cookies for authentication
                                  });
                                  
                                  if (!response.ok) {
                                    throw new Error('Failed to fetch receipt');
                                  }
                                  
                                  // Create a blob from the response
                                  const blob = await response.blob();
                                  const url = window.URL.createObjectURL(blob);
                                  
                                  // Create a temporary link and trigger download
                                  const link = document.createElement('a');
                                  link.href = url;
                                  link.download = `Receipt_${item.student.name}_${i + 1}.pdf`;
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                  
                                  // Clean up the blob URL after a delay
                                  setTimeout(() => window.URL.revokeObjectURL(url), 100);
                                } catch (error) {
                                  console.error('Error downloading receipt:', error);
                                  toast.error('Failed to download receipt. Please try again.');
                                }
                              }}
                              className="text-blue-600 underline cursor-pointer bg-transparent border-none p-0 hover:text-blue-800 text-xs sm:text-sm"
                            >
                              Download Receipt
                            </button>
                          </p>
                        ) : (
                          <p className="text-gray-500 text-xs sm:text-sm">No Receipt Available</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </details>
              )}

              {/* Reminder Button */}
              {item.paymentStatus !== "Paid" && (
                <button
                  disabled={sendingMap[item.student._id]}
                  onClick={() => handleReminderSend(item.student._id)}
                  className="mt-3 sm:mt-4 inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-yellow-500 rounded-md hover:bg-yellow-600 disabled:opacity-50"
                >
                  <MailCheck className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  {sendingMap[item.student._id]
                    ? "Sending..."
                    : "Send Reminder"}
                </button>
              )}
            </div>
          ))}
        </div>
        );
      })()}

      {/* Pagination Controls */}
      {(() => {
        // Calculate pagination based on filtered results
        let displayTotal = allStudentsFeeStatus.length;
        let displayTotalPages = totalPages;
        const pageToUse = selectedClass ? localPage : currentPage;
        
        if (selectedClass) {
          const [classNum, section] = selectedClass.split('-');
          const filtered = allStudentsFeeStatus.filter(s => {
            const studentClass = String(s.student.displayClass || s.student.class).trim();
            const studentSection = String(s.student.displaySection || s.student.section).trim();
            return studentClass === String(classNum).trim() && studentSection === String(section).trim();
          });
          displayTotal = filtered.length;
          displayTotalPages = Math.ceil(displayTotal / 20);
        }
        
        if (displayTotalPages > 1) {
          return (
            <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-2 mt-4 sm:mt-6">
              <button
                onClick={() => {
                  if (selectedClass) {
                    // Use local pagination for frontend filtering
                    setLocalPage(Math.max(1, localPage - 1));
                  } else {
                    // Use backend pagination
                    fetchAllStudentsFeeStatus({
                      status: statusFilter,
                      search: search || searchQuery || "",
                      customFeeFilter,
                      academicYear,
                      page: currentPage - 1,
                      limit: 20
                    });
                  }
                }}
                disabled={pageToUse === 1 || defaultersLoading}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
              >
                Previous
              </button>
              
              <span className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md font-medium text-xs sm:text-sm text-center">
                Page {pageToUse} of {displayTotalPages}
              </span>
              
              <button
                onClick={() => {
                  if (selectedClass) {
                    // Use local pagination for frontend filtering
                    setLocalPage(Math.min(displayTotalPages, localPage + 1));
                  } else {
                    // Use backend pagination
                    fetchAllStudentsFeeStatus({
                      status: statusFilter,
                      search: search || searchQuery || "",
                      customFeeFilter,
                      academicYear,
                      page: currentPage + 1,
                      limit: 20
                    });
                  }
                }}
                disabled={pageToUse === displayTotalPages || defaultersLoading}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
              >
                Next
              </button>
            </div>
          );
        }
        return null;
      })()}
    </div>
  );
};

export default FeeDefaultersPage;
