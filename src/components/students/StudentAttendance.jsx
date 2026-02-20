import { useEffect, useState } from "react";
import { useStudentAttendanceStore } from "../stores/useStudentAttendanceStore";
import { 
  CheckCircle, 
  XCircle, 
  Download,
  Calendar,
  TrendingUp,
  Award,
  BarChart3,
  Clock,
  User,
  GraduationCap,
  Star,
  Target,
  Zap,
  Shield,
  BookOpen,
  Users,
  Activity,
  X
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";
import { useTranslation } from "react-i18next";
import axios from "../lib/axios";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Tooltip,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  ComposedChart,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ReferenceLine,
  ReferenceArea,
  Brush,
  FunnelChart,
  Funnel,
  LabelList,
  Treemap,
  Sankey,
} from "recharts";

const StudentAttendance = () => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [holidays, setHolidays] = useState([]); // Store holidays for the selected month/year (day numbers)
  const [holidaysData, setHolidaysData] = useState([]); // Store full holiday objects
  const [selectedHoliday, setSelectedHoliday] = useState(null); // Selected holiday for modal
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal open/close state

  const {
    summary: attendance,
    fetchStudentAttendance,
    loading,
    error,
  } = useStudentAttendanceStore();
  
  const { t } = useTranslation();

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
            
            // Verify the date is in the correct month/year
            if (holidayMonth === month && holidayYear === year) {
              // Store holiday data with day number for easy lookup
              holidaysInMonth.push({
                ...holiday,
                day: holidayDay,
                parsedDate: date
              });
              return holidayDay; // Get day of month (1-31)
            }
            return null;
          })
          .filter(day => day !== null); // Remove null values
          
        setHolidays(holidayDates);
        setHolidaysData(holidaysInMonth); // Store full holiday data
      } else {
        setHolidays([]);
        setHolidaysData([]);
      }
    } catch (error) {
      // Silently fail for holidays - it's optional data
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('Holidays endpoint requires authentication - skipping');
      } else {
        console.error('Error fetching holidays:', error.response?.status || error.message);
      }
      setHolidays([]);
      setHolidaysData([]);
    }
  };

  useEffect(() => {
    fetchStudentAttendance(month, year);
    fetchHolidays(year, month);
  }, [month, year]);

  const handleMonthChange = (e) => setMonth(Number(e.target.value));
  const handleYearChange = (e) => setYear(Number(e.target.value));

  const COLORS = ["#4CAF50", "#F44336"]; // present = green, absent = red

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`${t('student.attendance.reportTitle')}`, 14, 20);
    doc.setFontSize(12);
    doc.text(`${t('student.attendance.month')}: ${month} / ${t('student.attendance.year')}: ${year}`, 14, 30);

    const tableRows = Object.entries(attendance.dailyStatus).map(([date, status]) => [
      format(new Date(date), "dd MMM yyyy (EEE)"),
      status.charAt(0).toUpperCase() + status.slice(1),
    ]);

    autoTable(doc, {
      startY: 40,
      head: [[t('student.attendance.date'), t('student.attendance.status')]],
      body: tableRows,
    });

    doc.save(`Student-Attendance-${month}-${year}.pdf`);
  };

  const handleDownloadCSV = () => {
    const data = Object.entries(attendance.dailyStatus).map(([date, status]) => ({
      Date: format(new Date(date), "dd MMM yyyy (EEE)"),
      Status: status,
    }));

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `Attendance-${month}-${year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const chartData = [
    { name: "Present", value: attendance?.presents || 0 },
    { name: "Absent", value: attendance?.absents || 0 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-4 sm:py-6">
    

        {/* Compact Date Selector */}
      <motion.div
        className="sm:p-2  sm:mb-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex gap-4 items-center justify-start flex-wrap">
            <div className="flex items-center gap-2 max-w-[200px]">
              <label className="text-sm font-semibold text-primary whitespace-nowrap">
                {t('student.attendance.month')}:
              </label>
            <select
              value={month}
              onChange={handleMonthChange}
                className="flex-1 px-3 py-2 border border-primary-light/50 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary-light/30 transition-all duration-300 bg-white text-text font-medium text-sm"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString("default", { month: "long" })}
                </option>
              ))}
            </select>
          </div>
            <div className="flex items-center gap-2 max-w-[150px]">
              <label className="text-sm font-semibold text-primary whitespace-nowrap">
                {t('student.attendance.year')}:
              </label>
            <input
              type="number"
              value={year}
              onChange={handleYearChange}
                className="flex-1 px-3 py-2 border border-primary-light/50 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary-light/30 transition-all duration-300 bg-white text-text font-medium text-sm"
            />
          </div>
        </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <motion.div 
            className="text-center py-20"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative inline-block mb-8">
              <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-20 h-20 border-4 border-accent/20 border-t-accent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            <h3 className="text-3xl font-bold text-primary mb-4">Loading Attendance Data</h3>
            <p className="text-gray-600 text-xl mb-8">Please wait while we fetch your attendance information...</p>
            <div className="flex justify-center gap-3">
              <div className="w-4 h-4 bg-primary rounded-full animate-bounce"></div>
              <div className="w-4 h-4 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-4 h-4 bg-success rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </motion.div>
        )}
        
        {/* Error State */}
        {error && (
          <motion.div 
            className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-3xl p-12 text-center shadow-xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-red-600 mb-3">Oops! Something went wrong</h3>
            <p className="text-red-500 font-semibold text-lg">{error}</p>
          </motion.div>
        )}

        {/* Student Content */}
        {attendance && (
          <motion.div
            className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/50 relative"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Student Header */}
            <div className="bg-gradient-to-r from-primary to-primary-dark p-4 text-white relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-sm">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center border border-white">
                      <Star className="w-2 h-2 text-yellow-800" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">My Attendance</h3>
                    <p className="text-primary-light text-sm mb-1">
                      Student Dashboard
                    </p>
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                      parseFloat(attendance.attendancePercentage) >= 95 ? "bg-green-100 text-green-600" :
                      parseFloat(attendance.attendancePercentage) >= 85 ? "bg-blue-100 text-blue-600" :
                      parseFloat(attendance.attendancePercentage) >= 75 ? "bg-yellow-100 text-yellow-600" :
                      "bg-red-100 text-red-600"
                    } shadow-sm`}>
                      {parseFloat(attendance.attendancePercentage) >= 95 ? <Star className="w-3 h-3" /> :
                       parseFloat(attendance.attendancePercentage) >= 85 ? <Target className="w-3 h-3" /> :
                       parseFloat(attendance.attendancePercentage) >= 75 ? <Zap className="w-3 h-3" /> :
                       <Shield className="w-3 h-3" />}
                      {parseFloat(attendance.attendancePercentage) >= 95 ? "Excellent" :
                       parseFloat(attendance.attendancePercentage) >= 85 ? "Good" :
                       parseFloat(attendance.attendancePercentage) >= 75 ? "Fair" :
                       "Needs Improvement"}
                    </div>
              </div>
              </div>
                <div className="flex gap-2">
                  <motion.button
                    onClick={handleDownloadPDF}
                    className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 backdrop-blur-sm border border-white/30 text-sm font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Download className="w-4 h-4" />
                    <span>PDF</span>
                  </motion.button>
                  <motion.button
                    onClick={handleDownloadCSV}
                    className="bg-yellow-400/20 hover:bg-yellow-400/30 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 backdrop-blur-sm border border-yellow-400/30 text-sm font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Download className="w-4 h-4" />
                    <span>CSV</span>
                  </motion.button>
              </div>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {/* Compact Performance Overview */}
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-3 sm:p-4 border border-primary/20 shadow-lg mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-md">
                      <Award className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-primary">Performance Overview</h3>
                      <p className="text-gray-600 text-xs sm:text-sm">Analytics for your attendance</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl sm:text-3xl font-extrabold text-primary">{attendance.attendancePercentage}</div>
                    <div className="text-xs sm:text-sm text-gray-600 font-medium">Overall Rate</div>
                  </div>
                </div>
              </div>

              {/* Calendar and Statistics Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                {/* Attendance Calendar - Left Side */}
                <div className="lg:col-span-2">
              {attendance && attendance.dailyStatus && (() => {
                const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                
                // Get the first day of the month and number of days
                const firstDay = new Date(year, month - 1, 1).getDay();
                const daysInMonth = new Date(year, month, 0).getDate();
                const today = new Date();
                const isCurrentMonth = today.getMonth() + 1 === month && today.getFullYear() === year;
                const todayDate = isCurrentMonth ? today.getDate() : null;
                
                // Create attendance map for quick lookup
                const attendanceMap = {};
                Object.entries(attendance.dailyStatus).forEach(([date, status]) => {
                  const dateObj = new Date(date);
                  if (dateObj.getMonth() + 1 === month && dateObj.getFullYear() === year) {
                    attendanceMap[dateObj.getDate()] = status;
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
                  const date = new Date(year, month - 1, day);
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
                    isDbHoliday: isDbHoliday,
                    holidayData: holidayData || null
                  });
                }
                
                // Get status color
                const getStatusColor = (status, isHoliday = false, isSunday = false, isDbHoliday = false) => {
                  // Sundays get gray background
                  if (isSunday) {
                    return 'bg-gray-300 text-gray-700';
                  }
                  // Admin-created holidays (from database) get yellow background
                  if (isDbHoliday || (status && status.toLowerCase() === 'holiday' && !isSunday)) {
                    return 'bg-yellow-300 text-yellow-900';
                  }
                  if (!status) return 'bg-gray-100 text-gray-400';
                  switch (status.toLowerCase()) {
                    case 'present':
                    case 'p':
                      return 'bg-green-500 text-white';
                    case 'absent':
                    case 'a':
                      return 'bg-red-500 text-white';
                    case 'late':
                    case 'l':
                      return 'bg-orange-500 text-white';
                    case 'halfday':
                    case 'half_day':
                    case 'h':
                      return 'bg-purple-500 text-white';
                    default:
                      return 'bg-gray-200 text-gray-600';
                  }
                };
                
                // Navigate months
                const handlePrevMonth = () => {
                  if (month === 1) {
                    setMonth(12);
                    setYear(year - 1);
                  } else {
                    setMonth(month - 1);
                  }
                };
                
                const handleNextMonth = () => {
                  if (month === 12) {
                    setMonth(1);
                    setYear(year + 1);
                  } else {
                    setMonth(month + 1);
                  }
                };
                
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="w-full"
                  >
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-2 sm:p-3 shadow-xl border border-gray-200/50">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-primary/10 rounded-lg">
                            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                          </div>
                          <h4 className="text-sm sm:text-base font-bold text-gray-900">Attendance Calendar</h4>
                        </div>
                        <div className="flex items-center gap-1 bg-gray-50 rounded-lg px-1 py-0.5 border border-gray-200">
                          <button
                            onClick={handlePrevMonth}
                            className="p-0.5 rounded hover:bg-white hover:shadow-sm transition-all duration-200"
                            aria-label="Previous month"
                          >
                            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          <span className="text-[10px] sm:text-xs font-semibold text-gray-900 min-w-[90px] sm:min-w-[100px] text-center px-1">
                            {monthNames[month - 1]} {year}
                          </span>
                          <button
                            onClick={handleNextMonth}
                            className="p-0.5 rounded hover:bg-white hover:shadow-sm transition-all duration-200"
                            aria-label="Next month"
                          >
                            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      {/* Days of week header */}
                      <div className="grid grid-cols-7 gap-1.5 mb-2 max-w-[360px] sm:max-w-[400px] mx-auto">
                        {dayNames.map((day) => (
                          <div key={day} className="text-center text-xs sm:text-sm font-bold text-gray-600 py-2 bg-gray-50 rounded">
                            {day}
                          </div>
                        ))}
                      </div>
                      
                      {/* Calendar grid */}
                      <div className="grid grid-cols-7 gap-1.5 max-w-[360px] sm:max-w-[400px] mx-auto">
                        {calendarDays.map((item, index) => {
                          if (item.day === null) {
                            return <div key={`empty-${index}`} className="aspect-square" />;
                          }
                          
                          const isHoliday = item.status === 'holiday' || item.isSunday || item.isDbHoliday;
                          const statusColor = getStatusColor(item.status, isHoliday, item.isSunday, item.isDbHoliday);
                          const isToday = item.isToday;
                          const displayText = isHoliday 
                            ? (item.isSunday ? 'Sun' : 'H') 
                            : (item.status ? item.status.charAt(0).toUpperCase() : '');
                          
                          // Handle click on holiday cell
                          const handleCellClick = () => {
                            if (isHoliday && item.isDbHoliday && item.holidayData) {
                              setSelectedHoliday(item.holidayData);
                              setIsModalOpen(true);
                            } else if (item.isSunday) {
                              setSelectedHoliday({
                                name: 'Sunday',
                                description: 'Weekly holiday',
                                type: 'other',
                                date: new Date(year, month - 1, item.day)
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
                                hover:shadow-sm
                              `}
                              title={
                                isHoliday
                                  ? `${item.day} ${monthNames[month - 1]}: ${item.isSunday ? 'Sunday' : 'Holiday'}${item.isDbHoliday ? ' - Click for details' : ''}`
                                  : item.status 
                                  ? `${item.day} ${monthNames[month - 1]}: ${item.status}` 
                                  : `${item.day} ${monthNames[month - 1]}: No data`
                              }
                            >
                              <span className={`text-xs sm:text-sm font-bold ${
                                item.status || isHoliday 
                                  ? (item.isSunday ? 'text-gray-700' : (item.isDbHoliday ? 'text-yellow-900' : 'text-white'))
                                  : 'text-gray-500'
                              }`}>
                                {item.day}
                              </span> 
                            </motion.div>
                          );
                        })}
                      </div>
                      
                      {/* Legend */}
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 text-[8px] sm:text-[9px]">
                          <span className="font-semibold text-gray-700">Legend:</span>
                          <div className="flex items-center gap-0.5">
                            <div className="w-1.5 h-1.5 rounded bg-green-500 shadow-sm"></div>
                            <span className="text-gray-600 font-medium">Present</span>
                          </div>
                          <div className="flex items-center gap-0.5">
                            <div className="w-1.5 h-1.5 rounded bg-red-500 shadow-sm"></div>
                            <span className="text-gray-600 font-medium">Absent</span>
                          </div>
                          <div className="flex items-center gap-0.5">
                            <div className="w-1.5 h-1.5 rounded bg-yellow-300 shadow-sm"></div>
                            <span className="text-gray-600 font-medium">Holiday</span>
                          </div>
                          <div className="flex items-center gap-0.5">
                            <div className="w-1.5 h-1.5 rounded bg-gray-300 shadow-sm"></div>
                            <span className="text-gray-600 font-medium">Sunday</span>
                          </div>
                          <div className="flex items-center gap-0.5">
                            <div className="w-1.5 h-1.5 rounded bg-gray-100 border border-gray-300 shadow-sm"></div>
                            <span className="text-gray-600 font-medium">No Data</span>
                          </div>
                          {isCurrentMonth && todayDate && (
                            <div className="flex items-center gap-0.5">
                              <div className="w-1.5 h-1.5 rounded border border-blue-500 bg-blue-50 shadow-sm"></div>
                              <span className="text-gray-600 font-medium">Today</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })()}
                </div>

                {/* Statistics Cards - Right Side */}
                <div className="lg:col-span-1 space-y-2 sm:space-y-3">
                <motion.div
                    className="bg-gradient-to-br from-primary to-primary-dark text-white rounded-xl p-2.5 sm:p-3 shadow-lg relative overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white/20 rounded-lg flex items-center justify-center">
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="text-xl sm:text-2xl font-black">{attendance.totalDays}</span>
                    </div>
                    <p className="text-primary-light text-xs sm:text-sm font-bold">{t('student.attendance.totalDays')}</p>
                </motion.div>

                <motion.div
                    className="bg-gradient-to-br from-success to-green-600 text-white rounded-xl p-2.5 sm:p-3 shadow-lg relative overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white/20 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="text-xl sm:text-2xl font-black">{attendance.presents}</span>
                    </div>
                    <p className="text-green-100 text-xs sm:text-sm font-bold">{t('student.attendance.presents')}</p>
                </motion.div>

                <motion.div
                    className="bg-gradient-to-br from-danger to-red-600 text-white rounded-xl p-2.5 sm:p-3 shadow-lg relative overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white/20 rounded-lg flex items-center justify-center">
                        <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="text-xl sm:text-2xl font-black">{attendance.absents}</span>
                    </div>
                    <p className="text-red-100 text-xs sm:text-sm font-bold">{t('student.attendance.absents')}</p>
                </motion.div>

                <motion.div
                    className="bg-gradient-to-br from-accent to-accent-dark text-white rounded-xl p-2.5 sm:p-3 shadow-lg relative overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white/20 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="text-xl sm:text-2xl font-black">{attendance.attendancePercentage}</span>
                    </div>
                    <p className="text-accent-light text-xs sm:text-sm font-bold">{t('student.attendance.percent')}</p>
                  </motion.div>
                  </div>
              </div>

              {/* Large Chart */}
              <motion.div 
                className="w-full mb-4 sm:mb-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="w-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 shadow-lg border border-slate-700 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xl font-bold text-white flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                      </div>
                      Attendance Trend
                    </h4>
                    <div className="text-right">
                      <div className="text-2xl font-black text-green-400">{attendance.attendancePercentage}</div>
                      <div className="text-sm text-gray-400">Current Rate</div>
                    </div>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={Object.entries(attendance.dailyStatus).slice(0, 14).map(([date, status], index) => ({
                        day: format(new Date(date), "dd MMM"), // ✅ Display actual dates
                        date: date, // Keep original date for tooltip
                        attendance: status === 'present' ? 100 : 0,
                        present: status === 'present' ? 1 : 0,
                        absent: status === 'absent' ? 1 : 0
                      }))}>
                        <defs>
                          <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          dataKey="day" 
                          tick={{ fill: '#9CA3AF', fontWeight: 'bold', fontSize: 10 }}
                          axisLine={{ stroke: '#374151' }}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis 
                          tick={{ fill: '#9CA3AF', fontWeight: 'bold', fontSize: 10 }}
                          axisLine={{ stroke: '#374151' }}
                          domain={[0, 100]}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '2px solid #10B981',
                            borderRadius: '6px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                            color: 'white',
                            fontSize: '11px'
                          }}
                          formatter={(value, name) => [`${value}%`, 'Attendance']}
                          labelFormatter={(label, payload) => {
                            if (payload && payload[0] && payload[0].payload) {
                              return `Date: ${format(new Date(payload[0].payload.date), "dd MMM yyyy (EEE)")}`;
                            }
                            return `Date: ${label}`;
                          }}
                        />
                        <ReferenceLine y={75} stroke="#EF4444" strokeDasharray="2 2" strokeWidth={1} />
                        <ReferenceLine y={90} stroke="#F59E0B" strokeDasharray="2 2" strokeWidth={1} />
                        <Area 
                          type="monotone" 
                          dataKey="attendance" 
                          stroke="#10B981" 
                          strokeWidth={2}
                          fill="url(#attendanceGradient)" 
                          name="Attendance %"
                        />
                      </AreaChart>
              </ResponsiveContainer>
            </div>
                  <div className="flex justify-between mt-4 text-sm">
                    <div className="flex items-center gap-2 text-green-400 font-semibold">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span>↑ 100% = Present</span>
                    </div>
                    <div className="flex items-center gap-2 text-red-400 font-semibold">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <span>↓ 0% = Absent</span>
                    </div>
                    <div className="flex items-center gap-2 text-yellow-400 font-semibold">
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <span>→ Date Range</span>
                    </div>
                  </div>
                </div>
              </motion.div>

           

              {/* Compact Daily Log Table */}
              <motion.div 
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 sm:p-4 shadow-lg border border-white/50 relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <h4 className="text-base sm:text-lg font-bold text-primary mb-3 sm:mb-4 flex items-center gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  </div>
                  Daily Attendance Log
                </h4>
                <div className="overflow-x-auto max-h-[250px] sm:max-h-[300px] rounded-xl border border-primary/20 bg-white shadow-sm">
                  <table className="min-w-full">
                    <thead className="bg-gradient-to-r from-primary to-primary-dark text-white sticky top-0">
                      <tr>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-bold text-xs sm:text-sm">{t('student.attendance.date')}</th>
                        <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-bold text-xs sm:text-sm">{t('student.attendance.status')}</th>
                  </tr>
                </thead>
                <tbody>
                      {Object.entries(attendance.dailyStatus).map(
                        ([date, status], index) => (
                          <motion.tr
                      key={date}
                            className={`border-b border-primary/10 hover:bg-primary/5 transition-all duration-300 ${
                              status === "absent"
                                ? "bg-red-50/50"
                                : "bg-green-50/50"
                            }`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.02 }}
                            whileHover={{ scale: 1.005 }}
                          >
                            <td className="px-3 sm:px-4 py-2 sm:py-3 font-bold text-gray-800 text-xs sm:text-sm">
                        {format(new Date(date), "dd MMM yyyy (EEE)")}
                      </td>
                            <td className="px-3 sm:px-4 py-2 sm:py-3">
                              <div className="flex items-center gap-1.5 sm:gap-2">
                        {status === "present" ? (
                          <>
                                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-success/20 rounded-full flex items-center justify-center">
                                      <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-success" />
                                    </div>
                                    <span className="font-black text-success bg-success/10 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs">
                                      {t('student.attendance.present')}
                                    </span>
                          </>
                        ) : (
                          <>
                                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-danger/20 rounded-full flex items-center justify-center">
                                      <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-danger" />
                                    </div>
                                    <span className="font-black text-danger bg-danger/10 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs">
                                      {t('student.attendance.absent')}
                                    </span>
                          </>
                        )}
                              </div>
                      </td>
                          </motion.tr>
                        )
                      )}
                </tbody>
              </table>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!attendance && !loading && !error && (
          <motion.div
            className="text-center py-24"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative inline-block mb-10">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-2xl scale-150"></div>
              <div className="relative w-40 h-40 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center mx-auto border-4 border-primary/20">
                <Calendar className="w-20 h-20 text-primary" />
              </div>
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                <Award className="w-7 h-7 text-accent-dark" />
              </div>
            </div>
            <h3 className="text-5xl font-black text-primary mb-6">No Attendance Data Found</h3>
            <p className="text-gray-600 text-2xl max-w-3xl mx-auto leading-relaxed mb-10">
              📅 No attendance records found for the selected month and year. 
              <br />
              Please check back later or contact the school for more information.
            </p>
            <div className="flex justify-center items-center gap-12">
              <div className="flex items-center gap-3 text-primary font-bold text-lg">
                <div className="w-4 h-4 bg-primary rounded-full animate-pulse"></div>
                <span>Check Date Range</span>
              </div>
              <div className="flex items-center gap-3 text-primary font-bold text-lg">
                <div className="w-4 h-4 bg-accent rounded-full animate-pulse"></div>
                <span>Contact School</span>
              </div>
            </div>
      </motion.div>
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
    </div>
  );
};

export default StudentAttendance;
