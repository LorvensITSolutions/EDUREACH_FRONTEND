import React, { useState, useEffect } from 'react';
import { useTeacherAttendanceStore } from '../stores/useTeacherAttendanceStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Users,
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Edit,
  Download,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import axios from '../lib/axios';
import { utils, writeFile } from 'xlsx';

const TeacherAttendanceManagement = () => {
  const {
    loading,
    error,
    allTeachers,
    allTeachersAttendance,
    markTeacherAttendance,
    getAllTeachers,
    getAllTeachersAttendance,
w  } = useTeacherAttendanceStore();

  const [formData, setFormData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState(null);
  const [dailySummary, setDailySummary] = useState({
    totalTeachers: 0,
    presents: 0,
    absents: 0,
    late: 0,
    halfDay: 0,
    attendancePercentage: 0
  });
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [downloadType, setDownloadType] = useState('daily'); // 'daily', 'monthly', 'yearly', 'specific-month'
  const [selectedMonth, setSelectedMonth] = useState(() => format(new Date(), "yyyy-MM"));
  const [selectedYear, setSelectedYear] = useState(() => format(new Date(), "yyyy"));
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [yearlySummary, setYearlySummary] = useState(null);
  const [attendanceTab, setAttendanceTab] = useState('mark'); // 'mark' or 'download'
  const [isHoliday, setIsHoliday] = useState(false);
  const [holidayInfo, setHolidayInfo] = useState(null);

  // Check if selected date is a holiday
  const checkHoliday = async (date) => {
    try {
      const response = await axios.get(`/holidays/check?date=${date}`);
      setIsHoliday(response.data.isHoliday || false);
      setHolidayInfo(response.data.holiday || null);
    } catch (error) {
      console.error('Error checking holiday:', error);
      setIsHoliday(false);
      setHolidayInfo(null);
    }
  };

  // Check for holiday when date changes
  useEffect(() => {
    if (selectedDate) {
      checkHoliday(selectedDate);
    }
  }, [selectedDate]);

  // Fetch daily teacher attendance summary
  const fetchDailySummary = async (date) => {
    if (!date) return;
    
    setSummaryLoading(true);
    try {
      const response = await axios.get(`/teacher-attendance/admin/daily-summary?date=${date}`);
      setDailySummary(response.data);
    } catch (error) {
      console.error('Error fetching daily teacher summary:', error);
      // Set default values if API fails
      setDailySummary({
        totalTeachers: 0,
        presents: 0,
        absents: 0,
        late: 0,
        halfDay: 0,
        attendancePercentage: 0
      });
    } finally {
      setSummaryLoading(false);
    }
  };

  // Load teachers on component mount
  useEffect(() => {
    getAllTeachers();
  }, []);

  // Load attendance records when date changes
  useEffect(() => {
    if (selectedDate) {
      getAllTeachersAttendance({ date: selectedDate });
      fetchDailySummary(selectedDate);
    }
  }, [selectedDate]);

  // Update form data when teachers or attendance records change
  useEffect(() => {
    if (allTeachers.length > 0) {
      const submittedIds = allTeachersAttendance
        .filter((rec) => rec.teacher && rec.teacher._id) // Add null check
        .map((rec) => rec.teacher._id);
      
      setFormData(
        allTeachers
          .filter((teacher) => teacher && teacher._id) // Add null check for teacher
          .map((teacher) => {
            const existingRecord = allTeachersAttendance.find(
              (rec) => rec.teacher && rec.teacher._id === teacher._id // Add null check
            );
            
            return {
              teacherMongoId: teacher._id, // MongoDB _id for backend operations
              teacherId: teacher.teacherId || teacher._id.toString(), // Custom teacherId (T1003) for display
              teacherName: teacher.name,
              subject: teacher.subject,
              status: existingRecord ? existingRecord.status : "present",
              reason: existingRecord ? existingRecord.reason : "",
              disabled: submittedIds.includes(teacher._id),
              existingRecord: existingRecord || null,
            };
          })
      );
    }
  }, [allTeachers, allTeachersAttendance]);

  const handleChange = (index, field, value) => {
    const updated = [...formData];
    updated[index][field] = value;
    setFormData(updated);
  };

  const handleEdit = (teacherMongoId) => {
    setIsEditing(true);
    setEditingTeacherId(teacherMongoId);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingTeacherId(null);
    // Reset form data to original state
    getAllTeachersAttendance({ date: selectedDate });
  };

  const handleSaveEdit = async (teacherMongoId) => {
    const teacherData = formData.find(entry => entry.teacherMongoId === teacherMongoId);
    if (!teacherData) return;

    try {
      // Use teacherMongoId for backend, but keep other data
      const attendanceData = {
        teacherId: teacherData.teacherMongoId, // Backend expects MongoDB _id
        status: teacherData.status,
        reason: teacherData.reason,
        date: selectedDate
      };
      const result = await markTeacherAttendance([attendanceData]);
      setIsEditing(false);
      setEditingTeacherId(null);
      getAllTeachersAttendance({ date: selectedDate });
      fetchDailySummary(selectedDate); // Refresh daily summary
      
      // Show success message with summary if available
      if (result.data?.summary) {
        const { summary } = result.data;
        toast.success(
          `Attendance updated! Present: ${summary.present}, Absent: ${summary.absent}, Total: ${summary.total}`,
          { duration: 4000 }
        );
      } else {
        toast.success("Attendance updated successfully!");
      }
    } catch (error) {
      toast.error("Failed to update attendance. Please try again.");
      console.error("Edit attendance error:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    // Check if date is a holiday
    if (isHoliday) {
      toast.error("Cannot mark attendance on a holiday. Please select a different date.");
      setSubmitLoading(false);
      return;
    }

    const withDate = formData
      .filter((entry) => !entry.disabled || (isEditing && editingTeacherId === entry.teacherMongoId))
      .map((entry) => ({ 
        teacherId: entry.teacherMongoId, // Use MongoDB _id for backend
        status: entry.status,
        reason: entry.reason,
        date: selectedDate 
      }));

    if (withDate.length === 0) {
      toast.error("No attendance to submit");
      setSubmitLoading(false);
      return;
    }

    try {
      const result = await markTeacherAttendance(withDate);
      getAllTeachersAttendance({ date: selectedDate });
      fetchDailySummary(selectedDate); // Refresh daily summary
      
      // Show success message with summary if available
      if (result.data?.summary) {
        const { summary } = result.data;
        toast.success(
          `Attendance submitted! Present: ${summary.present}, Absent: ${summary.absent}, Total: ${summary.total}`,
          { duration: 4000 }
        );
      } else {
        toast.success(`Attendance submitted for ${withDate.length} teachers!`);
      }
    } catch (error) {
      toast.error("Failed to submit attendance. Please try again.");
      console.error("Submit attendance error:", error);
    } finally {
      setSubmitLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "present":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "absent":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "present":
        return "bg-green-50 border-green-200 text-green-800";
      case "absent":
        return "bg-red-50 border-red-200 text-red-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  // Fetch monthly attendance summary
  const fetchMonthlySummary = async (year, month) => {
    try {
      setSummaryLoading(true);
      const response = await axios.get(`/teacher-attendance/admin/monthly-report?year=${year}&month=${month}`);
      setMonthlySummary(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching monthly summary:', error);
      toast.error('Failed to fetch monthly attendance summary');
      return null;
    } finally {
      setSummaryLoading(false);
    }
  };

  // Fetch yearly attendance summary (aggregate from monthly data)
  const fetchYearlySummary = async (year) => {
    try {
      setSummaryLoading(true);
      const monthlyData = [];
      
      // Fetch all 12 months
      for (let month = 1; month <= 12; month++) {
        try {
          const response = await axios.get(`/teacher-attendance/admin/monthly-report?year=${year}&month=${month}`);
          if (response.data?.data) {
            monthlyData.push({
              month,
              monthName: new Date(year, month - 1).toLocaleString('default', { month: 'long' }),
              ...response.data.data
            });
          }
        } catch (err) {
          console.warn(`Failed to fetch data for month ${month}:`, err);
        }
      }
      
      // Aggregate yearly data
      const yearlyData = {
        year,
        months: monthlyData,
        totalPresent: monthlyData.reduce((sum, m) => sum + (m.present || 0), 0),
        totalAbsent: monthlyData.reduce((sum, m) => sum + (m.absent || 0), 0),
        totalLate: monthlyData.reduce((sum, m) => sum + (m.late || 0), 0),
        totalHalfDay: monthlyData.reduce((sum, m) => sum + (m.halfDay || 0), 0),
        totalDays: monthlyData.reduce((sum, m) => sum + (m.totalDays || 0), 0)
      };
      
      setYearlySummary(yearlyData);
      return yearlyData;
    } catch (error) {
      console.error('Error fetching yearly summary:', error);
      toast.error('Failed to fetch yearly attendance summary');
      return null;
    } finally {
      setSummaryLoading(false);
    }
  };

  // Download daily attendance summary as Excel
  const downloadAttendanceSummary = () => {
    try {
      // Prepare data for Excel
      const summaryData = [
        ['Teacher Attendance Summary'],
        ['Date', format(new Date(selectedDate), 'MMMM dd, yyyy')],
        [''],
        ['Summary Statistics'],
        ['Total Teachers', dailySummary.totalTeachers],
        ['Present', dailySummary.presents],
        ['Absent', dailySummary.absents],
        ['Late/Half Day', dailySummary.late + dailySummary.halfDay],
        ['Attendance Rate', `${dailySummary.attendancePercentage}%`],
        [''],
        ['Detailed Attendance Records'],
        ['Teacher Name', 'Teacher ID', 'Subject', 'Status', 'Reason']
      ];

      // Add individual teacher attendance records
      formData.forEach(entry => {
        summaryData.push([
          entry.teacherName || 'N/A',
          entry.teacherId || 'N/A', // Display custom teacherId (T1003)
          entry.subject || 'N/A',
          entry.status ? entry.status.charAt(0).toUpperCase() + entry.status.slice(1) : 'N/A',
          entry.reason || '-'
        ]);
      });

      // Create workbook and worksheet
      const wb = utils.book_new();
      const ws = utils.aoa_to_sheet(summaryData);

      // Set column widths
      ws['!cols'] = [
        { wch: 25 }, // Teacher Name
        { wch: 15 }, // Teacher ID
        { wch: 20 }, // Subject
        { wch: 12 }, // Status
        { wch: 30 }  // Reason
      ];

      // Merge cells for title
      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
        { s: { r: 3, c: 0 }, e: { r: 3, c: 1 } }
      ];

      // Add worksheet to workbook
      utils.book_append_sheet(wb, ws, 'Attendance Summary');

      // Generate filename with date
      const fileName = `Teacher_Attendance_Summary_${format(new Date(selectedDate), 'yyyy-MM-dd')}.xlsx`;

      // Write and download
      writeFile(wb, fileName);
      
      toast.success('Attendance summary downloaded successfully!');
    } catch (error) {
      console.error('Error downloading attendance summary:', error);
      toast.error('Failed to download attendance summary');
    }
  };

  // Download monthly attendance summary as Excel
  const downloadMonthlySummary = async () => {
    try {
      const [year, month] = selectedMonth.split('-').map(Number);
      const data = await fetchMonthlySummary(year, month);
      
      if (!data || !data.data) {
        toast.error('No data available for selected month');
        return;
      }

      const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });
      const summaryData = [
        ['Teacher Attendance Monthly Summary'],
        ['Month', `${monthName} ${year}`],
        [''],
        ['Summary Statistics'],
        ['Total Present', data.data.present || 0],
        ['Total Absent', data.data.absent || 0],
        ['Total Late', data.data.late || 0],
        ['Total Half Day', data.data.halfDay || 0],
        ['Total Days', data.data.totalDays || 0],
        ['Attendance Rate', data.data.attendancePercentage ? `${data.data.attendancePercentage}%` : 'N/A'],
        ['']
      ];

      // Add teacher-wise breakdown if available
      if (data.data.teachers && data.data.teachers.length > 0) {
        summaryData.push(['Teacher-wise Attendance']);
        summaryData.push(['Teacher Name', 'Teacher ID', 'Present', 'Absent', 'Late', 'Half Day', 'Total Days', 'Attendance %']);
        data.data.teachers.forEach(teacher => {
          const total = (teacher.present || 0) + (teacher.absent || 0) + (teacher.late || 0) + (teacher.halfDay || 0);
          const percentage = total > 0 ? Math.round(((teacher.present || 0) / total) * 100) : 0;
          summaryData.push([
            teacher.teacherName || 'N/A',
            teacher.teacherId || 'N/A',
            teacher.present || 0,
            teacher.absent || 0,
            teacher.late || 0,
            teacher.halfDay || 0,
            total,
            `${percentage}%`
          ]);
        });
      }

      const wb = utils.book_new();
      const ws = utils.aoa_to_sheet(summaryData);
      ws['!cols'] = [
        { wch: 25 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, 
        { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 }
      ];
      utils.book_append_sheet(wb, ws, 'Monthly Summary');
      const fileName = `Teacher_Attendance_Monthly_${monthName}_${year}.xlsx`;
      writeFile(wb, fileName);
      toast.success('Monthly attendance summary downloaded!');
    } catch (error) {
      console.error('Error downloading monthly summary:', error);
      toast.error('Failed to download monthly summary');
    }
  };

  // Download yearly attendance summary as Excel
  const downloadYearlySummary = async () => {
    try {
      const year = parseInt(selectedYear);
      const data = await fetchYearlySummary(year);
      
      if (!data || !data.months || data.months.length === 0) {
        toast.error('No data available for selected year');
        return;
      }

      const summaryData = [
        ['Teacher Attendance Yearly Summary'],
        ['Year', year.toString()],
        [''],
        ['Overall Statistics'],
        ['Total Present', data.totalPresent],
        ['Total Absent', data.totalAbsent],
        ['Total Late', data.totalLate],
        ['Total Half Day', data.totalHalfDay],
        ['Total Days', data.totalDays],
        ['Overall Attendance Rate', data.totalDays > 0 ? 
          `${Math.round((data.totalPresent / data.totalDays) * 100)}%` : 'N/A'],
        [''],
        ['Monthly Breakdown'],
        ['Month', 'Present', 'Absent', 'Late', 'Half Day', 'Total Days', 'Attendance %']
      ];

      data.months.forEach(monthData => {
        const total = monthData.totalDays || 0;
        const percentage = total > 0 ? 
          Math.round(((monthData.present || 0) / total) * 100) : 0;
        summaryData.push([
          monthData.monthName || `Month ${monthData.month}`,
          monthData.present || 0,
          monthData.absent || 0,
          monthData.late || 0,
          monthData.halfDay || 0,
          total,
          `${percentage}%`
        ]);
      });

      const wb = utils.book_new();
      const ws = utils.aoa_to_sheet(summaryData);
      ws['!cols'] = [
        { wch: 20 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
        { wch: 12 }, { wch: 12 }, { wch: 15 }
      ];
      utils.book_append_sheet(wb, ws, 'Yearly Summary');
      const fileName = `Teacher_Attendance_Yearly_${year}.xlsx`;
      writeFile(wb, fileName);
      toast.success('Yearly attendance summary downloaded!');
    } catch (error) {
      console.error('Error downloading yearly summary:', error);
      toast.error('Failed to download yearly summary');
    }
  };

  // Handle download based on selected type
  const handleDownload = async () => {
    switch (downloadType) {
      case 'daily':
        // Fetch daily summary first if not already loaded
        if (!dailySummary.totalTeachers || format(new Date(selectedDate), "yyyy-MM-dd") !== format(new Date(), "yyyy-MM-dd")) {
          await fetchDailySummary(selectedDate);
          // Also fetch attendance records for the date
          await getAllTeachersAttendance({ date: selectedDate });
        }
        // Small delay to ensure state is updated
        setTimeout(() => {
          downloadAttendanceSummary();
        }, 100);
        break;
      case 'monthly':
        // Use current month for monthly
        const currentMonth = format(new Date(), "yyyy-MM");
        setSelectedMonth(currentMonth);
        await downloadMonthlySummary();
        break;
      case 'specific-month':
        await downloadMonthlySummary();
        break;
      case 'yearly':
        await downloadYearlySummary();
        break;
      default:
        downloadAttendanceSummary();
    }
  };

  const submittedCount = formData.filter(f => f.disabled).length;
  const totalTeachers = formData.length;
  const pendingCount = totalTeachers - submittedCount;

  if (loading && totalTeachers === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin h-8 w-8 text-primary" />
        <span className="ml-2 text-gray-600">Loading teachers...</span>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-5 max-w-7xl mx-auto">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-1 text-primary flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          Teacher Attendance Management
        </h2>
        <p className="text-sm text-gray-600">Manage teacher attendance and download reports</p>
      </div>

      {/* Attendance Tabs */}
      <div className="flex gap-2 border rounded-lg p-1 bg-muted/20 mb-4">
        <button
          onClick={() => setAttendanceTab('mark')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            attendanceTab === 'mark'
              ? 'bg-primary text-white shadow-sm'
              : 'bg-transparent hover:bg-muted/50 text-gray-700'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          Mark Attendance
        </button>
        <button
          onClick={() => setAttendanceTab('download')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            attendanceTab === 'download'
              ? 'bg-primary text-white shadow-sm'
              : 'bg-transparent hover:bg-muted/50 text-gray-700'
          }`}
        >
          <Download className="w-4 h-4" />
          Download Summary
        </button>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {attendanceTab === 'mark' && (
          <motion.div
            key="mark"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >

      {/* Date Selection & Summary Header - Compact */}
      <div className="bg-white rounded-lg shadow-sm border p-3 mb-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Date:
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 px-2.5 py-1.5 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              max={format(new Date(), "yyyy-MM-dd")}
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{dailySummary.attendancePercentage}%</div>
              <div className="text-xs text-gray-600">Attendance Rate</div>
            </div>
            <div className="text-sm text-gray-600">
              {format(new Date(selectedDate), "MMM dd, yyyy")}
            </div>
          </div>
        </div>
        {isHoliday && (
          <div className="mt-3 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-yellow-900 mb-1">
                  {holidayInfo?.name || 'Sunday'} - Holiday
                </h3>
                <p className="text-sm text-yellow-800 mb-2">
                  {holidayInfo?.description || (holidayInfo?.isSunday ? 'Weekly holiday' : 'This is a school holiday.')}
                </p>
                <p className="text-sm font-medium text-yellow-700">
                  ⚠️ Attendance cannot be marked on holidays. Please select a different date to mark attendance.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Only show statistics and teachers list if NOT a holiday */}
      {!isHoliday && (
        <>
          {/* Compact Statistics Cards */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {/* Total Teachers Card */}
            <motion.div
              className="bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 text-white rounded-lg p-4 shadow-lg relative overflow-hidden border border-slate-500/20"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
              <div className="relative flex items-center justify-between">
                <div className="w-10 h-10 bg-white/15 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-md border border-white/10">
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold drop-shadow-sm">{dailySummary.totalTeachers}</div>
                  <div className="text-white/80 text-xs font-medium">Total</div>
                </div>
              </div>
            </motion.div>

            {/* Presents Card */}
            <motion.div
              className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 text-white rounded-lg p-4 shadow-lg relative overflow-hidden border border-emerald-400/20"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="relative flex items-center justify-between">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-md border border-white/20">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold drop-shadow-sm">{dailySummary.presents}</div>
                  <div className="text-white/90 text-xs font-medium">Present</div>
                </div>
              </div>
            </motion.div>

            {/* Absents Card */}
            <motion.div
              className="bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-600 text-white rounded-lg p-4 shadow-lg relative overflow-hidden border border-orange-400/20"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="relative flex items-center justify-between">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-md border border-white/20">
                  <XCircle className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold drop-shadow-sm">{dailySummary.absents}</div>
                  <div className="text-white/90 text-xs font-medium">Absent</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Loading State for Summary */}
          {summaryLoading && (
            <motion.div 
              className="bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-md border border-white/50 mb-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <span className="text-gray-600 text-sm font-medium">Loading summary...</span>
              </div>
            </motion.div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-4">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                {error}
              </div>
            </div>
          )}

          {/* Show message when no teachers */}
          {formData.length === 0 && !loading && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                No teachers found
              </div>
            </div>
          )}

          {/* Professional Table Structure */}
          <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="bg-gradient-to-r from-primary to-primary-dark text-white px-4 py-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Users className="w-4 h-4" />
                Teacher Attendance Records
              </h3>
              <div className="text-xs font-medium">
                {pendingCount > 0 ? (
                  <span className="bg-white/20 px-2.5 py-1 rounded-full">
                    {pendingCount} Pending
                  </span>
                ) : (
                  <span className="bg-green-500/20 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    All Submitted
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Teacher Name
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {formData.map((entry, index) => {
                  const isDisabled = entry.disabled;
                  const isEditingRow = isEditing && editingTeacherId === entry.teacherMongoId;
                  
                  return (
                    <tr
                      key={entry.teacherMongoId}
                      className={`transition-colors ${
                        isDisabled && !isEditingRow
                          ? "bg-gray-50 opacity-75"
                          : isEditingRow
                          ? "bg-yellow-50 ring-2 ring-yellow-400"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      {/* Serial Number */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {index + 1}
                        </div>
                      </td>

                      {/* Teacher Name */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="flex-shrink-0 h-8 w-8 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-bold text-xs">
                            {entry.teacherName?.charAt(0)?.toUpperCase() || 'T'}
                          </div>
                          <div className="text-sm font-semibold text-gray-900">
                            {entry.teacherName}
                          </div>
                        </div>
                      </td>

                      {/* Teacher ID */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-xs text-gray-600 font-mono">
                          {entry.teacherId}
                        </div>
                      </td>

                      {/* Subject */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-xs text-gray-600">
                          {entry.subject || 'N/A'}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          {!isDisabled || isEditingRow ? (
                            <>
                              <label className="flex items-center gap-1 cursor-pointer group">
                                <input
                                  type="radio"
                                  name={`status-${entry.teacherMongoId}`}
                                  value="present"
                                  checked={entry.status === "present"}
                                  onChange={() => handleChange(index, "status", "present")}
                                  className="w-3.5 h-3.5 text-green-600 focus:ring-green-500 cursor-pointer"
                                />
                                <div className="flex items-center gap-1 group-hover:bg-green-50 px-1.5 py-0.5 rounded transition-colors">
                                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                                  <span className="text-xs font-medium text-green-700">P</span>
                                </div>
                              </label>
                              <label className="flex items-center gap-1 cursor-pointer group">
                                <input
                                  type="radio"
                                  name={`status-${entry.teacherMongoId}`}
                                  value="absent"
                                  checked={entry.status === "absent"}
                                  onChange={() => handleChange(index, "status", "absent")}
                                  className="w-3.5 h-3.5 text-red-600 focus:ring-red-500 cursor-pointer"
                                />
                                <div className="flex items-center gap-1 group-hover:bg-red-50 px-1.5 py-0.5 rounded transition-colors">
                                  <XCircle className="w-3.5 h-3.5 text-red-500" />
                                  <span className="text-xs font-medium text-red-700">A</span>
                                </div>
                              </label>
                            </>
                          ) : (
                            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(entry.status)}`}>
                              {getStatusIcon(entry.status)}
                              <span>{entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Reason */}
                      <td className="px-4 py-3">
                        {entry.status === "absent" && (!isDisabled || isEditingRow) ? (
                          <input
                            type="text"
                            placeholder="Reason..."
                            value={entry.reason}
                            onChange={(e) => handleChange(index, "reason", e.target.value)}
                            className="w-full max-w-xs border border-gray-300 px-2 py-1 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          />
                        ) : entry.existingRecord?.reason ? (
                          <div className="text-xs text-gray-600 max-w-xs truncate" title={entry.existingRecord.reason}>
                            {entry.existingRecord.reason}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400">-</div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        {isEditingRow ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(entry.teacherMongoId)}
                              disabled={submitLoading}
                              className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors font-medium flex items-center gap-1"
                            >
                              <CheckCircle className="w-3 h-3" />
                              {submitLoading ? "..." : "Save"}
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : isDisabled ? (
                          <button
                            type="button"
                            onClick={() => handleEdit(entry.teacherMongoId)}
                            className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium flex items-center gap-1 mx-auto"
                          >
                            <Edit className="w-3 h-3" />
                            Edit
                          </button>
                        ) : (
                          <div className="text-xs text-gray-400">-</div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer - Info & Submit */}
          {formData.length > 0 && (
            <div className="bg-gray-50 border-t border-gray-200">
              <div className="px-4 py-2.5 flex items-center justify-between text-xs text-gray-600 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <span>Total: <strong className="text-gray-900">{totalTeachers}</strong></span>
                  <span>Submitted: <strong className="text-green-600">{submittedCount}</strong></span>
                  <span>Pending: <strong className="text-orange-600">{pendingCount}</strong></span>
                </div>
                {isEditing && (
                  <div className="flex items-center gap-1.5 text-yellow-700 bg-yellow-50 px-2 py-1 rounded text-xs font-medium">
                    <AlertCircle className="w-3 h-3" />
                    <span>Edit Mode</span>
                  </div>
                )}
              </div>
              
              {/* Submit Button Section */}
              <div className="px-4 py-3 flex justify-end bg-white">
                {pendingCount > 0 ? (
                  <button
                    type="submit"
                    disabled={submitLoading || isEditing}
                    className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-2 ${
                      submitLoading || isEditing
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-gradient-to-r from-primary to-primary-dark text-white hover:shadow-lg hover:scale-105'
                    }`}
                  >
                    {submitLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Submit ({pendingCount})</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg shadow-md text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-semibold">All submitted</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </form>
        </>
      )}
        </motion.div>
      )}

        {attendanceTab === 'download' && (
          <motion.div
            key="download"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
              <Download className="w-6 h-6" />
              Download Attendance Summary
            </h3>

            {/* Download Options Tabs */}
            <div className="space-y-4">
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Select Report Type</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setDownloadType('daily')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      downloadType === 'daily'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Daily
                  </button>
                  <button
                    type="button"
                    onClick={() => setDownloadType('monthly')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      downloadType === 'monthly'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setDownloadType('specific-month')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      downloadType === 'specific-month'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Specific Month
                  </button>
                  <button
                    type="button"
                    onClick={() => setDownloadType('yearly')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      downloadType === 'yearly'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Yearly
                  </button>
                </div>
              </div>

              {/* Date Selection for Daily */}
              {downloadType === 'daily' && (
                <div className="mb-4 flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">Select Date:</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    max={format(new Date(), "yyyy-MM-dd")}
                  />
                </div>
              )}

              {/* Date Selection for Specific Month */}
              {downloadType === 'specific-month' && (
                <div className="mb-4 flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">Select Month:</label>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    max={format(new Date(), "yyyy-MM")}
                  />
                </div>
              )}

              {/* Show current month for Monthly */}
              {downloadType === 'monthly' && (
                <div className="mb-4 flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">Month:</label>
                  <span className="text-sm text-gray-600 font-medium">
                    {format(new Date(), "MMMM yyyy")}
                  </span>
                </div>
              )}

              {downloadType === 'yearly' && (
                <div className="mb-4 flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">Select Year:</label>
                  <input
                    type="number"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    min="2020"
                    max={format(new Date(), "yyyy")}
                    className="border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent w-32"
                  />
                </div>
              )}

              {/* Download Button */}
              <button
                type="button"
                onClick={handleDownload}
                disabled={summaryLoading}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-5 h-5" />
                {summaryLoading ? 'Loading...' : `Download ${downloadType === 'daily' ? 'Daily' : downloadType === 'yearly' ? 'Yearly' : 'Monthly'} Summary`}
              </button>

              {/* Info Box */}
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> The downloaded Excel file will contain:
                  {downloadType === 'daily' && ' Daily attendance records with summary statistics and individual teacher details.'}
                  {downloadType === 'monthly' && ' Monthly attendance summary with teacher-wise breakdown and attendance rates.'}
                  {downloadType === 'specific-month' && ' Selected month attendance summary with teacher-wise breakdown and attendance rates.'}
                  {downloadType === 'yearly' && ' Yearly attendance summary with monthly breakdown and overall statistics.'}
                </p>
              </div>
            </div>
          </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeacherAttendanceManagement;
