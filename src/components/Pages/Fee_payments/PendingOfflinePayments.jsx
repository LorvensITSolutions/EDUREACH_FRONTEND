import React, { useEffect, useState, useCallback } from "react";
import { useFeeStore } from "../../stores/useFeeStore";
import { Loader2, CheckCircle, Search, FileText, X, Calendar, Filter } from "lucide-react";
import { format } from "date-fns";
import axios from "../../lib/axios";

const PendingOfflinePayments = () => {
  const {
    pendingOfflinePayments,
    fetchPendingOfflinePayments,
    verifyOfflinePayment,
    loading,
    currentPage,
    totalPages,
  } = useFeeStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("");
  const [academicYearOptions, setAcademicYearOptions] = useState([]);
  const [verifyingMap, setVerifyingMap] = useState({});
  const [notesMap, setNotesMap] = useState({});
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Fetch available academic years
  useEffect(() => {
    const loadAcademicYears = async () => {
      try {
        const { data } = await axios.get('/students/unique-values');
        const years = (data.academicYears || []).sort((a, b) => {
          const [aStart] = a.split('-').map(y => parseInt(y, 10));
          const [bStart] = b.split('-').map(y => parseInt(y, 10));
          return bStart - aStart; // Newest first
        });
        setAcademicYearOptions(years);
      } catch (error) {
        console.error('Failed to load academic years:', error);
      }
    };
    loadAcademicYears();
  }, []);

  useEffect(() => {
    fetchPendingOfflinePayments({ academicYear: selectedAcademicYear });
  }, [selectedAcademicYear]);

  // Debounced search function
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout for debounced search
    const timeout = setTimeout(() => {
      console.log("🔍 Searching for:", query);
      fetchPendingOfflinePayments({ search: query, page: 1, academicYear: selectedAcademicYear });
    }, 500); // 500ms delay
    
    setSearchTimeout(timeout);
  }, [searchTimeout, fetchPendingOfflinePayments, selectedAcademicYear]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const clearSearch = () => {
    setSearchQuery("");
    fetchPendingOfflinePayments({ search: "", page: 1, academicYear: selectedAcademicYear });
  };

  const handleAcademicYearChange = (year) => {
    setSelectedAcademicYear(year);
    fetchPendingOfflinePayments({ search: searchQuery, page: 1, academicYear: year });
  };

  const handleVerifyPayment = async (paymentId) => {
    setVerifyingMap((prev) => ({ ...prev, [paymentId]: true }));
    const notes = notesMap[paymentId] || "";
    
    try {
      await verifyOfflinePayment(paymentId, notes);
      // Clear notes after successful verification
      setNotesMap((prev) => {
        const newMap = { ...prev };
        delete newMap[paymentId];
        return newMap;
      });
      // Refresh with current filters
      fetchPendingOfflinePayments({ search: searchQuery, page: currentPage, academicYear: selectedAcademicYear });
    } finally {
      setVerifyingMap((prev) => ({ ...prev, [paymentId]: false }));
    }
  };

  const handlePageChange = (page) => {
    fetchPendingOfflinePayments({ page, search: searchQuery, academicYear: selectedAcademicYear });
  };

  if (loading && pendingOfflinePayments.length === 0) {
    return (
      <div className="flex justify-center items-center h-32 sm:h-48">
        <Loader2 className="animate-spin h-5 w-5 sm:h-6 sm:w-6 text-primary" />
        <span className="ml-2 sm:ml-3 text-gray-700 text-sm sm:text-base">Loading pending payments...</span>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 sm:mb-5 md:mb-6 gap-3 sm:gap-4">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
          💰 Pending Offline Payments
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full md:w-auto">
          {/* Academic Year Filter */}
          <div className="relative w-full sm:w-64">
            <Filter className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
            <select
              value={selectedAcademicYear}
              onChange={(e) => handleAcademicYearChange(e.target.value)}
              className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-sm sm:text-base"
            >
              <option value="">All Academic Years</option>
              {academicYearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
            <input
              type="text"
              placeholder="Search by name, class..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-8 sm:pl-10 pr-8 sm:pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
            {searchQuery.length > 0 && (
              <button
                onClick={clearSearch}
                className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {pendingOfflinePayments.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-500 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
            No Pending Offline Payments
          </h3>
          <p className="text-sm sm:text-base text-gray-500">
            All offline payment requests have been processed.
          </p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-5 md:space-y-6">
          {pendingOfflinePayments.map((payment) => (
            <div
              key={payment._id}
              className="bg-white shadow-lg rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border border-gray-200"
            >
              <div className="flex flex-col lg:flex-row justify-between gap-3 sm:gap-4">
                {/* Student & Payment Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="flex-1 min-w-0 pr-2">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800 truncate">
                        {payment.student?.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Class {payment.student?.class} {payment.student?.section}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">
                        ₹{payment.amountPaid}
                      </div>
                      {payment.lateFee > 0 && (
                        <div className="text-xs sm:text-sm text-red-600">
                          + ₹{payment.lateFee} late fee
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Parent Info */}
                  <div className="bg-gray-50 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4">
                    <h4 className="font-medium text-gray-700 mb-2 text-sm sm:text-base">Parent Information</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                      <p className="break-words"><span className="font-medium">Name:</span> {payment.parent?.name}</p>
                      <p><span className="font-medium">Phone:</span> {payment.parent?.phone || "N/A"}</p>
                      <p className="sm:col-span-2"><span className="font-medium">Requested:</span> {format(new Date(payment.createdAt), "dd MMM yyyy 'at' h:mm a")}</p>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm">
                    <div>
                      <span className="font-medium text-gray-600 block mb-1">Total Amount:</span>
                      <p className="text-base sm:text-lg font-semibold text-gray-800">
                        ₹{payment.amountPaid + (payment.lateFee || 0)}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 block mb-1">Base Amount:</span>
                      <p className="text-gray-800">₹{payment.amountPaid}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 block mb-1">Late Fee:</span>
                      <p className="text-red-600">₹{payment.lateFee || 0}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 block mb-1">Academic Year:</span>
                      <p className="text-gray-800">{payment.academicYear}</p>
                    </div>
                  </div>
                </div>

                {/* Verification Section */}
                <div className="w-full lg:w-80">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                    <h4 className="font-medium text-blue-800 mb-2 sm:mb-3 text-sm sm:text-base">
                      📝 Verification Notes (Optional)
                    </h4>
                    <textarea
                      value={notesMap[payment._id] || ""}
                      onChange={(e) => setNotesMap(prev => ({
                        ...prev,
                        [payment._id]: e.target.value
                      }))}
                      placeholder="e.g., Payment received at front desk, receipt #123"
                      className="w-full p-2 border border-blue-300 rounded-md text-xs sm:text-sm resize-none"
                      rows="3"
                    />
                    
                    <button
                      onClick={() => handleVerifyPayment(payment._id)}
                      disabled={verifyingMap[payment._id]}
                      className="w-full mt-2 sm:mt-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-3 sm:px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-xs sm:text-sm"
                    >
                      {verifyingMap[payment._id] ? (
                        <>
                          <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                          Verify Payment
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 sm:mt-8">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-2 w-full sm:w-auto">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm sm:text-base"
            >
              Previous
            </button>
            
            <span className="px-3 sm:px-4 py-2 text-gray-700 text-xs sm:text-sm text-center">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm sm:text-base"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingOfflinePayments;