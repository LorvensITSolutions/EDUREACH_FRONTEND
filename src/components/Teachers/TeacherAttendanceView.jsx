import React, { useState, useEffect } from 'react';
import { useTeacherAttendanceStore } from '../stores/useTeacherAttendanceStore';
import { motion } from 'framer-motion';
import axios from '../lib/axios';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  User,
  BookOpen,
  RefreshCw,
  Download,
  TrendingUp,
  X
} from 'lucide-react';

const TeacherAttendanceView = () => {
  const {
    loading,
    error,
    teacherAttendanceHistory,
    teacherAttendanceSummary,
    todayAttendanceStatus,
    pagination,
    getTeacherAttendanceHistory,
    getTeacherAttendanceSummary,
    getTodayAttendanceStatus,
    getStatusColor,
    getStatusLabel,
    formatDate,
    getCurrentMonthYear
  } = useTeacherAttendanceStore();

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState('summary'); // 'summary' or 'history'
  const [holidays, setHolidays] = useState([]); // Store holidays for the selected month/year (day numbers)
  const [holidaysData, setHolidaysData] = useState([]); // Store full holiday objects
  const [selectedHoliday, setSelectedHoliday] = useState(null); // Selected holiday for modal
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal open/close state

  // Fetch holidays for the selected month/year
  const fetchHolidays = async (year, month) => {
    try {
      const response = await axios.get(`/holidays?year=${year}&month=${month}`);
      
      if (response.data && response.data.holidays && Array.isArray(response.data.holidays)) {
        console.log('Fetched holidays:', response.data.holidays);
        
        // Store full holiday data
        const holidaysInMonth = [];
        
        // Extract dates from holidays and store them
        const holidayDates = response.data.holidays
          .filter(holiday => holiday && holiday.date && holiday.isActive !== false)
          .map(holiday => {
            // Handle date parsing - MongoDB returns dates as ISO strings
            let date;
            let dateStr = holiday.date;
            
            // If it's already a string, use it; if it's an object with toISOString, convert it
            if (typeof dateStr === 'string') {
              // Extract just the date part (YYYY-MM-DD) from ISO string
              const dateMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
              if (dateMatch) {
                const [, y, m, d] = dateMatch.map(Number);
                // Use UTC to parse since dates are stored at UTC midnight
                date = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
              } else {
                date = new Date(dateStr);
              }
            } else if (dateStr && typeof dateStr.toISOString === 'function') {
              // If it's a Date object, use UTC methods to get the date
              date = dateStr;
            } else {
              date = new Date(dateStr);
            }
            
            // Use UTC methods since dates are stored at UTC midnight
            const holidayMonth = date.getUTCMonth() + 1;
            const holidayYear = date.getUTCFullYear();
            const holidayDay = date.getUTCDate();
            
            console.log(`Processing holiday: ${holiday.name}, Original: ${dateStr}, Parsed Date: ${date.toLocaleDateString()}, Month: ${holidayMonth}, Year: ${holidayYear}, Day: ${holidayDay}, Target: ${month}/${year}`);
            
            // Verify the date is in the correct month/year
            if (holidayMonth === month && holidayYear === year) {
              console.log(`✓ Holiday found: ${holiday.name} on day ${holidayDay} of month ${month}`);
              // Store holiday data with day number for easy lookup
              holidaysInMonth.push({
                ...holiday,
                day: holidayDay,
                parsedDate: date
              });
              return holidayDay; // Get day of month (1-31)
            } else {
              console.log(`✗ Holiday ${holiday.name} (${holidayMonth}/${holidayYear}) not in target month/year (${month}/${year})`);
            }
            return null;
          })
          .filter(day => day !== null); // Remove null values
          
        console.log('Final holiday dates array for calendar:', holidayDates);
        setHolidays(holidayDates);
        setHolidaysData(holidaysInMonth); // Store full holiday data
      } else {
        console.log('No holidays data in response:', response.data);
        setHolidays([]);
        setHolidaysData([]);
      }
    } catch (error) {
      // Silently fail for holidays - it's optional data
      // The axios interceptor is configured to not redirect for /holidays endpoint errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('Holidays endpoint requires authentication - skipping');
      } else {
        console.error('Error fetching holidays:', error.response?.status || error.message, error);
      }
      setHolidays([]);
      setHolidaysData([]);
    }
  };

  // Load data on component mount
  useEffect(() => {
    getTodayAttendanceStatus();
    getTeacherAttendanceSummary(selectedMonth, selectedYear);
    getTeacherAttendanceHistory();
    fetchHolidays(selectedYear, selectedMonth);
  }, []);

  // Load summary and holidays when month/year changes
  useEffect(() => {
    getTeacherAttendanceSummary(selectedMonth, selectedYear);
    fetchHolidays(selectedYear, selectedMonth);
  }, [selectedMonth, selectedYear]);

  // Get status badge component
  const StatusBadge = ({ status }) => {
    const color = getStatusColor(status);
    const label = getStatusLabel(status);
    
    const colorClasses = {
      green: 'bg-green-100 text-green-800',
      red: 'bg-red-100 text-red-800',
      orange: 'bg-orange-100 text-orange-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      blue: 'bg-blue-100 text-blue-800',
      purple: 'bg-purple-100 text-purple-800',
      pink: 'bg-pink-100 text-pink-800',
      gray: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClasses[color] || colorClasses.gray}`}>
        {label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin h-8 w-8 text-primary" />
        <span className="ml-2 text-gray-600">Loading attendance data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Attendance</h1>
          <p className="text-xs sm:text-sm text-gray-600">View your attendance records and summary</p>
        </div>
        <div className="flex gap-1.5 sm:gap-2">
          <button
            onClick={() => setViewMode('summary')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg ${
              viewMode === 'summary' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setViewMode('history')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg ${
              viewMode === 'history' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            History
          </button>
        </div>
      </div>

      {/* Today's Status */}
      {todayAttendanceStatus && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border"
        >
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Today's Status</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 sm:p-2.5 bg-primary/10 rounded-lg">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="ml-2 sm:ml-3">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Status</p>
                <StatusBadge status={todayAttendanceStatus.status} />
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Date</p>
              <p className="text-sm sm:text-base font-semibold text-gray-900">{formatDate(todayAttendanceStatus.date)}</p>
            </div>
          </div>
          {todayAttendanceStatus.reason && (
            <div className="mt-2 sm:mt-3 p-2 sm:p-2.5 bg-gray-50 rounded-lg">
              <p className="text-xs sm:text-sm text-gray-600">
                <span className="font-medium">Reason:</span> {todayAttendanceStatus.reason}
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Summary View */}
      {viewMode === 'summary' && teacherAttendanceSummary && (
        <div className="space-y-4">
          {/* Month/Year Selector */}
          <div className="bg-white p-2 sm:p-3 rounded-lg shadow-sm border">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              <label className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">Select Month:</label>
              <div className="flex items-center gap-2 flex-1 sm:flex-none">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(0, i).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - 2 + i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>

          {/* Calendar and Summary Cards Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Calendar - Left Side */}
            <div className="lg:col-span-2">

          {/* Daily Status Calendar - Visual Calendar View */}
          {teacherAttendanceSummary && teacherAttendanceSummary.dailyStatus && (() => {
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            
            // Get the first day of the month and number of days
            const firstDay = new Date(selectedYear, selectedMonth - 1, 1).getDay();
            const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
            const today = new Date();
            const isCurrentMonth = today.getMonth() + 1 === selectedMonth && today.getFullYear() === selectedYear;
            const todayDate = isCurrentMonth ? today.getDate() : null;
            
            // Create attendance map for quick lookup
            const attendanceMap = {};
            Object.entries(teacherAttendanceSummary.dailyStatus).forEach(([date, status]) => {
              const dateObj = new Date(date);
              if (dateObj.getMonth() + 1 === selectedMonth && dateObj.getFullYear() === selectedYear) {
                attendanceMap[dateObj.getDate()] = status.status;
              }
            });
            
            // Generate calendar days
            const calendarDays = [];
            
            // Add empty cells for days before the first day of the month
            for (let i = 0; i < firstDay; i++) {
              calendarDays.push({ day: null, date: null, status: null });
            }
            
            // Helper function to check if a date is a Sunday
            const isSunday = (day) => {
              const date = new Date(selectedYear, selectedMonth - 1, day);
              return date.getDay() === 0; // 0 = Sunday
            };
            
            // Helper function to check if a date is a holiday (from database or Sunday)
            const isHolidayDate = (day) => {
              // Check if it's a Sunday
              if (isSunday(day)) return true;
              // Check if it's in the holidays array (from database)
              if (holidays.includes(day)) return true;
              return false;
            };
            
    
            
            // Add all days of the month
            for (let day = 1; day <= daysInMonth; day++) {
              const status = attendanceMap[day] || null;
              const isSundayDay = isSunday(day);
              const isHolidayDay = isHolidayDate(day);
              const isDbHoliday = holidays.includes(day) && !isSundayDay;
              
              // Debug specific days
              if (holidays.includes(day)) {
                console.log(`Day ${day} is in holidays array. isDbHoliday: ${isDbHoliday}, isSunday: ${isSundayDay}`);
              }
              
              // Find the holiday data for this day
              const holidayData = holidaysData.find(h => h.day === day);
              
              // Mark as holiday if it's a Sunday, in holidays array, or if status indicates holiday
              const isHoliday = isHolidayDay || (status && status.toLowerCase() === 'holiday');
              calendarDays.push({ 
                day, 
                date: day, 
                status: isHoliday ? 'holiday' : status, 
                isToday: day === todayDate,
                isSunday: isSundayDay,
                isDbHoliday: isDbHoliday, // Track if it's a DB holiday (not Sunday)
                holidayData: holidayData || null // Store holiday data for modal
              });
            }
            
            // Get status color
            const getStatusColor = (status, isHoliday = false, isSunday = false, isDbHoliday = false) => {
              // Sundays get gray background
              if (isSunday) {
                return 'bg-gray-300 text-gray-700'; // Gray for Sundays
              }
              // Admin-created holidays (from database) get yellow background
              if (isDbHoliday || (status && status.toLowerCase() === 'holiday' && !isSunday)) {
                return 'bg-yellow-300 text-yellow-900'; // Yellow for admin-created holidays
              }
              if (!status) return 'bg-gray-100 text-gray-400'; // No data
              switch (status.toLowerCase()) {
                case 'present':
                case 'p':
                  return 'bg-green-500 text-white';
                case 'absent':
                case 'a':
                  return 'bg-red-500 text-white';
                case 'late':
                case 'l':
                  return 'bg-yellow-300 text-white';
                case 'halfday':
                case 'half_day':
                case 'h':
                  return 'bg-orange-500 text-white';
                default:
                  return 'bg-gray-200 text-gray-600';
              }
            };
            
            // Navigate months
            const handlePrevMonth = () => {
              if (selectedMonth === 1) {
                setSelectedMonth(12);
                setSelectedYear(selectedYear - 1);
              } else {
                setSelectedMonth(selectedMonth - 1);
              }
            };
            
            const handleNextMonth = () => {
              if (selectedMonth === 12) {
                setSelectedMonth(1);
                setSelectedYear(selectedYear + 1);
              } else {
                setSelectedMonth(selectedMonth + 1);
              }
            };
            
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-2 sm:p-2.5 rounded-lg shadow-md border border-gray-200 h-full"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900">Attendance Calendar</h3>
                  </div>
                  <div className="flex items-center gap-1 bg-gray-50 rounded px-1 py-0.5">
                    <button
                      onClick={handlePrevMonth}
                      className="p-0.5 rounded hover:bg-white hover:shadow-sm transition-all duration-200"
                      aria-label="Previous month"
                    >
                      <svg className="w-2.5 h-2.5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <span className="text-[10px] sm:text-xs font-semibold text-gray-900 min-w-[90px] sm:min-w-[110px] text-center">
                      {monthNames[selectedMonth - 1]} {selectedYear}
                    </span>
                    <button
                      onClick={handleNextMonth}
                      className="p-0.5 rounded hover:bg-white hover:shadow-sm transition-all duration-200"
                      aria-label="Next month"
                    >
                      <svg className="w-2.5 h-2.5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Days of week header */}
                <div className="grid grid-cols-7 gap-0.5 mb-1 max-w-[320px] sm:max-w-[380px] mx-auto">
                  {dayNames.map((day) => (
                    <div key={day} className="text-center text-[9px] sm:text-[10px] font-bold text-gray-600 py-0.5 bg-gray-50 rounded">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-0.5 max-w-[340px] sm:max-w-[380px] mx-auto">
                  {calendarDays.map((item, index) => {
                    if (item.day === null) {
                      return <div key={`empty-${index}`} className="aspect-square" />;
                    }
                    
                    // Check if it's a holiday (Sunday, DB holiday, or status is holiday)
                    const isHoliday = item.status === 'holiday' || item.isSunday || item.isDbHoliday;
                    
                    // Debug specific days that should be holidays
                    if (holidays.includes(item.day)) {
                      console.log(`Calendar cell for day ${item.day}: isDbHoliday=${item.isDbHoliday}, isSunday=${item.isSunday}, isHoliday=${isHoliday}, holidays array:`, holidays);
                    }
                    
                    const statusColor = getStatusColor(item.status, isHoliday, item.isSunday, item.isDbHoliday);
                    const isToday = item.isToday;
                    // Show "H" for database holidays, "Sun" for Sundays, or status initial for attendance
                    const displayText = isHoliday 
                      ? (item.isSunday ? 'Sun' : 'H') 
                      : (item.status ? item.status.charAt(0).toUpperCase() : '');
                    
                    // Handle click on holiday cell
                    const handleCellClick = () => {
                      if (isHoliday && item.isDbHoliday && item.holidayData) {
                        setSelectedHoliday(item.holidayData);
                        setIsModalOpen(true);
                      } else if (item.isSunday) {
                        // For Sundays, show a simple modal
                        setSelectedHoliday({
                          name: 'Sunday',
                          description: 'Weekly holiday',
                          type: 'other',
                          date: new Date(selectedYear, selectedMonth - 1, item.day)
                        });
                        setIsModalOpen(true);
                      }
                    };
                    
                    return (
                      <motion.div
                        key={item.day}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCellClick}
                        className={`
                          aspect-square rounded flex flex-col items-center justify-center
                          transition-all duration-200 ${isHoliday ? 'cursor-pointer' : 'cursor-default'} relative
                          ${item.status || isHoliday
                            ? `${statusColor} shadow-sm` 
                            : 'bg-gray-50 text-gray-400 border border-gray-200 hover:border-gray-300'
                          }
                          ${isToday ? 'ring-1 ring-blue-500' : ''}
                          hover:shadow-md
                        `}
                        title={
                          isHoliday
                            ? `${item.day} ${monthNames[selectedMonth - 1]}: ${item.isSunday ? 'Sunday' : 'Holiday'}${item.isDbHoliday ? ' - Click for details' : ''}`
                            : item.status 
                            ? `${item.day} ${monthNames[selectedMonth - 1]}: ${item.status}` 
                            : `${item.day} ${monthNames[selectedMonth - 1]}: No data`
                        }
                      >
                        <span className={`text-[10px] sm:text-xs font-bold ${
                          item.status || isHoliday 
                            ? (item.isSunday ? 'text-gray-700' : (item.isDbHoliday ? 'text-yellow-900' : 'text-white'))
                            : 'text-gray-500'
                        }`}>
                          {item.day}
                        </span>
                        {(item.status || isHoliday) && (
                          <span className={`text-[7px] sm:text-[8px] font-semibold mt-0.5 ${
                            item.isSunday ? 'text-gray-700 opacity-90' : (item.isDbHoliday ? 'text-yellow-900 opacity-90' : 'text-white opacity-90')
                          }`}>
                            {displayText}
                          </span>
                        )}
                        {isToday && !item.status && !isHoliday && (
                          <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-blue-500 rounded-full"></div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
                
                {/* Legend */}
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px]">
                    <span className="font-semibold text-gray-700">Legend:</span>
                    <div className="flex items-center gap-0.5">
                      <div className="w-2 h-2 rounded bg-green-500 shadow-sm"></div>
                      <span className="text-gray-600 font-medium">Present</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <div className="w-2 h-2 rounded bg-red-500 shadow-sm"></div>
                      <span className="text-gray-600 font-medium">Absent</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <div className="w-2 h-2 rounded bg-yellow-300 shadow-sm"></div>
                      <span className="text-gray-600 font-medium">Holiday</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <div className="w-2 h-2 rounded bg-gray-300 shadow-sm"></div>
                      <span className="text-gray-600 font-medium">Sunday</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <div className="w-2 h-2 rounded bg-gray-100 border border-gray-300 shadow-sm"></div>
                      <span className="text-gray-600 font-medium">No Data</span>
                    </div>
                    {isCurrentMonth && todayDate && (
                      <div className="flex items-center gap-0.5">
                        <div className="w-2 h-2 rounded border border-blue-500 bg-blue-50 shadow-sm"></div>
                        <span className="text-gray-600 font-medium">Today</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })()}
            </div>

            {/* Summary Cards - Right Side */}
            <div className="lg:col-span-1 space-y-3 sm:space-y-4">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white p-4 sm:p-5 rounded-xl shadow-md border border-gray-200"
              >
                <div className="flex items-center mb-3">
                  <div className="p-2.5 bg-green-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Present Days</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">{teacherAttendanceSummary.presents || 0}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white p-4 sm:p-5 rounded-xl shadow-md border border-gray-200"
              >
                <div className="flex items-center mb-3">
                  <div className="p-2.5 bg-red-100 rounded-lg">
                    <XCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Absent Days</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">{teacherAttendanceSummary.absents || 0}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white p-4 sm:p-5 rounded-xl shadow-md border border-gray-200"
              >
                <div className="flex items-center mb-3">
                  <div className="p-2.5 bg-blue-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">{teacherAttendanceSummary.attendancePercentage || '0%'}</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      )}

      {/* History View */}
      {viewMode === 'history' && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Attendance History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modified
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teacherAttendanceHistory.map((attendance) => (
                  <tr key={attendance._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(attendance.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={attendance.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {attendance.reason || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {attendance.notes || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {attendance.isModified ? (
                        <span className="text-orange-600 font-medium">Yes</span>
                      ) : (
                        <span className="text-gray-500">No</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => getTeacherAttendanceHistory({ page: pagination.current - 1 })}
                  disabled={pagination.current <= 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => getTeacherAttendanceHistory({ page: pagination.current + 1 })}
                  disabled={pagination.current >= pagination.pages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{((pagination.current - 1) * pagination.limit) + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(pagination.current * pagination.limit, pagination.total)}
                    </span>{' '}
                    of <span className="font-medium">{pagination.total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => getTeacherAttendanceHistory({ page: pagination.current - 1 })}
                      disabled={pagination.current <= 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => getTeacherAttendanceHistory({ page: pagination.current + 1 })}
                      disabled={pagination.current >= pagination.pages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <XCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Holiday Details Modal */}
      {isModalOpen && selectedHoliday && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Content */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedHoliday.name}</h2>
                  <p className="text-sm text-gray-600">
                    {selectedHoliday.parsedDate 
                      ? selectedHoliday.parsedDate.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })
                      : selectedHoliday.date 
                        ? new Date(selectedHoliday.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })
                        : 'N/A'
                    }
                  </p>
                </div>
              </div>

              {selectedHoliday.description && (
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-1">Description</p>
                  <p className="text-sm text-gray-600">{selectedHoliday.description}</p>
                </div>
              )}

              <div className="flex items-center gap-4 pt-2 border-t border-gray-200">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Type</p>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium capitalize">
                    {selectedHoliday.type || 'Other'}
                  </span>
                </div>
                {selectedHoliday.academicYear && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Academic Year</p>
                    <p className="text-sm font-semibold text-gray-700">{selectedHoliday.academicYear}</p>
                  </div>
                )}
              </div>

              {selectedHoliday.createdBy && typeof selectedHoliday.createdBy === 'object' && (
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-1">Created By</p>
                  <p className="text-sm text-gray-700">{selectedHoliday.createdBy.name || selectedHoliday.createdBy.email || 'Admin'}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TeacherAttendanceView;
