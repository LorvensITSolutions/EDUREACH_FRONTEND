import React, { useEffect, useState } from "react";
import { useAttendanceTeacherStore } from "../stores/useAttendanceTeacherStore";
import { useMarkAttendanceStore } from "../stores/useMarkAttendanceStore";
import { format } from "date-fns";
import { CheckCircle, XCircle, Clock, Users, Calendar, TrendingUp, TrendingDown, Edit, AlertCircle, ArrowUp } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import axios from "../lib/axios";
import { getCurrentAcademicYear, getPreviousAcademicYear } from "../../utils/academicYear";

export const MarkAttendance = () => {
  const {
    assignedStudents,
    fetchAssignedStudentsWithAttendance,
    attendanceRecords,
    assignedClasses: backendAssignedClasses,
    loading: fetchLoading,
  } = useAttendanceTeacherStore();
  const {
    markAttendance,
    loading: submitLoading,
    successMessage,
    error,
    clearMessages,
  } = useMarkAttendanceStore();

  const [formData, setFormData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [selectedClass, setSelectedClass] = useState("total");
  const [availableClasses, setAvailableClasses] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [dailySummary, setDailySummary] = useState({
    totalStudents: 0,
    presents: 0,
    absents: 0,
    attendancePercentage: 0
  });

  // Debug: Log dailySummary changes
  useEffect(() => {
    console.log('Daily Summary State Updated:', dailySummary);
  }, [dailySummary]);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [isHoliday, setIsHoliday] = useState(false);
  const [holidayInfo, setHolidayInfo] = useState(null);

  // Derive academic year from the currently selected date (June–May window)
  const getAcademicYearFromDate = (dateStr) => {
    if (!dateStr) return getCurrentAcademicYear();
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return getCurrentAcademicYear();

    const year = date.getFullYear();
    const month = date.getMonth(); // 0-11

    // If month is June (5) or later, academic year is year-(year+1)
    // Otherwise, it's (year-1)-year
    if (month >= 5) {
      return `${year}-${year + 1}`;
    }
    return `${year - 1}-${year}`;
  };

  const selectedAcademicYear = getAcademicYearFromDate(selectedDate);

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

  // Fetch daily attendance summary
  const fetchDailySummary = async (date, className = null) => {
    if (!date) return;
    
    setSummaryLoading(true);
    try {
      const params = new URLSearchParams({ date });
      // Only add class filter if a specific class is selected (not null, not empty, not 'all', not 'total')
      if (className && className !== 'all' && className !== '' && className !== 'total') {
        params.append('class', className);
      }
      
      const response = await axios.get(`/attendance/daily-summary?${params}`);
      console.log('Daily Summary API Response:', response.data);
      
      // Handle different response structures
      const summaryData = response.data.data || response.data;
      console.log('Processed Summary Data:', summaryData);
      
      setDailySummary({
        totalStudents: summaryData.totalStudents || 0,
        presents: summaryData.presents || 0,
        absents: summaryData.absents || 0,
        attendancePercentage: summaryData.attendancePercentage || 0
      });
    } catch (error) {
      console.error('Error fetching daily summary:', error);
      // Set default values if API fails
      setDailySummary({
        totalStudents: 0,
        presents: 0,
        absents: 0,
        attendancePercentage: 0
      });
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedStudentsWithAttendance(selectedDate);
    // Always fetch summary for all classes by default, only filter when class is selected
    fetchDailySummary(selectedDate, selectedClass);
  }, [selectedDate, selectedClass]);

  // Helper function to determine student's class for a specific academic year based on promotion history
  const getStudentClassForAcademicYear = (student, targetAcademicYear) => {
    const promotionHistory = student.promotionHistory || [];
    
    // If student has a currentAcademicYear that is AFTER the target year
    // and there is no promotion history record for the target year,
    // then this student doesn't belong to the target academic year at all.
    if (student.currentAcademicYear && targetAcademicYear) {
      const [targetStart] = targetAcademicYear.split("-").map((y) => parseInt(y));
      const [studentStart] = student.currentAcademicYear
        .split("-")
        .map((y) => parseInt(y));

      const hasTargetYearRecord = promotionHistory.some(
        (p) => p.academicYear === targetAcademicYear
      );

      if (!Number.isNaN(targetStart) && !Number.isNaN(studentStart)) {
        if (studentStart > targetStart && !hasTargetYearRecord) {
          // Example: target 2025-2026, student currentAcademicYear 2026-2027 and
          // no promotion record for 2025-2026 → exclude from this year's views
          return null;
        }
      }
    }
    
    // Check if there's a revert record for this academic year (takes precedence)
    const revertRecord = promotionHistory.find(
      p => p.academicYear === targetAcademicYear && p.promotionType === 'reverted'
    );
    
    // Check if student was promoted IN this academic year (and not reverted)
    const promotionInThisYear = promotionHistory.find(
      p => p.academicYear === targetAcademicYear && 
           p.promotionType === 'promoted' && 
           !p.reverted
    );
    
    if (revertRecord) {
      return {
        displayClass: revertRecord.toClass,
        displaySection: revertRecord.toSection,
        isPromoted: false
      };
    }
    
    if (promotionInThisYear) {
      // IMPORTANT: If student was promoted IN this academic year, they were in their FROM class during this year
      // So for attendance purposes, we show them in their OLD class (fromClass) for this academic year
      return {
        displayClass: promotionInThisYear.fromClass,
        displaySection: promotionInThisYear.fromSection,
        isPromoted: true,
        promotedTo: `${promotionInThisYear.toClass}-${promotionInThisYear.toSection}`,
        promotionYear: targetAcademicYear
      };
    }
    
    // Check if student was promoted in the PREVIOUS academic year (affects this year)
    const previousAcademicYear = getPreviousAcademicYear(targetAcademicYear);
    const promotionInPreviousYear = promotionHistory.find(
      p => p.academicYear === previousAcademicYear && 
           p.promotionType === 'promoted' && 
           !p.reverted
    );
    
    if (promotionInPreviousYear) {
      // Student was promoted in previous year - they are now in their NEW class (toClass) for this year
      return {
        displayClass: promotionInPreviousYear.toClass,
        displaySection: promotionInPreviousYear.toSection,
        isPromoted: true,
        promotedFrom: `${promotionInPreviousYear.fromClass}-${promotionInPreviousYear.fromSection}`,
        promotionYear: previousAcademicYear
      };
    }
    
    // No promotion affecting this year - use current class
    return {
      displayClass: student.class,
      displaySection: student.section,
      isPromoted: false
    };
  };

  // Extract available classes - ONLY show assigned classes from backend
  useEffect(() => {
    // Only use assigned classes from backend (teacher's actual assignments)
    if (backendAssignedClasses && backendAssignedClasses.length > 0) {
      const currentAcademicYear = getCurrentAcademicYear();
      
      // Sort classes: numeric classes first, then alphabetical
      const sortedClasses = [...backendAssignedClasses].sort((a, b) => {
        const [aClass, aSection] = a.split('-');
        const [bClass, bSection] = b.split('-');
        const aNum = parseInt(aClass);
        const bNum = parseInt(bClass);
        
        // If both are numeric, sort by number
        if (!isNaN(aNum) && !isNaN(bNum)) {
          if (aNum !== bNum) return aNum - bNum;
          return aSection.localeCompare(bSection);
        }
        // If only one is numeric, numeric comes first
        if (!isNaN(aNum)) return -1;
        if (!isNaN(bNum)) return 1;
        // Both non-numeric, sort alphabetically
        if (aClass !== bClass) return aClass.localeCompare(bClass);
        return aSection.localeCompare(bSection);
      });
      
      setAvailableClasses(sortedClasses);
      
      // Keep "total" as default, don't auto-select first class
      if (selectedClass === "" && sortedClasses.length > 0) {
        setSelectedClass("total");
      }
    } else if (assignedStudents.length > 0) {
      // Fallback: if backend doesn't provide assignedClasses, extract from students
      // But this should not happen if backend is working correctly
      const currentAcademicYear = getCurrentAcademicYear();
      const classSet = new Set();
      
      assignedStudents.forEach(student => {
        const classInfo = getStudentClassForAcademicYear(student, currentAcademicYear);
        const classKey = `${classInfo.displayClass}-${classInfo.displaySection}`;
        classSet.add(classKey);
      });
      
      const classes = Array.from(classSet).sort((a, b) => {
        const [aClass, aSection] = a.split('-');
        const [bClass, bSection] = b.split('-');
        const aNum = parseInt(aClass);
        const bNum = parseInt(bClass);
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
          if (aNum !== bNum) return aNum - bNum;
          return aSection.localeCompare(bSection);
        }
        if (!isNaN(aNum)) return -1;
        if (!isNaN(bNum)) return 1;
        if (aClass !== bClass) return aClass.localeCompare(bClass);
        return aSection.localeCompare(bSection);
      });
      
      setAvailableClasses(classes);
    }
  }, [assignedStudents, selectedClass, backendAssignedClasses]);

  useEffect(() => {
    if (!selectedClass || selectedClass === "total") {
      // Clear form data when "total" is selected - no individual students to show
      setFormData([]);
      return;
    }
    
    // Filter students by selected class (using ONLY academic year-aware class)
    const currentAcademicYear = selectedAcademicYear;
    const filteredStudents = assignedStudents.filter(student => {
      const classInfo = getStudentClassForAcademicYear(student, currentAcademicYear);
      if (!classInfo) return false;
      const classKey = `${classInfo.displayClass}-${classInfo.displaySection}`;
      // Only match the academic year-aware class, not the database class
      // This ensures students appear only in the class they were actually in during this academic year
      return classKey === selectedClass;
    });
    
    // The backend already filters attendance by date, so we just need to check if student has attendance record
    const submittedIds = attendanceRecords.map((rec) => rec.student._id);

    setFormData(
      filteredStudents.map((student) => {
        const existingRecord = attendanceRecords.find(
          (rec) => rec.student._id === student._id
        );
        
        return {
          studentId: student._id,
          status: existingRecord ? existingRecord.status : "present",
          reason: existingRecord ? existingRecord.reason : "",
          disabled: submittedIds.includes(student._id),
          existingRecord: existingRecord || null,
        };
      })
    );
  }, [assignedStudents, attendanceRecords, selectedDate, selectedClass]);

  const handleChange = (index, field, value) => {
    const updated = [...formData];
    updated[index][field] = value;
    setFormData(updated);
  };

  const handleEdit = (studentId) => {
    setIsEditing(true);
    setEditingStudentId(studentId);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingStudentId(null);
    // Reset form data to original state
    fetchAssignedStudentsWithAttendance(selectedDate);
  };

  const handleSaveEdit = async (studentId) => {
    const studentData = formData.find(entry => entry.studentId === studentId);
    if (!studentData) return;

    try {
      await markAttendance([{ ...studentData, date: selectedDate }]);
      setIsEditing(false);
      setEditingStudentId(null);
      fetchAssignedStudentsWithAttendance(selectedDate);
      fetchDailySummary(selectedDate, selectedClass); // Refresh daily summary
      toast.success("Attendance updated successfully!");
    } catch (error) {
      toast.error("Failed to update attendance. Please try again.");
      console.error("Edit attendance error:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    // Check if date is a holiday
    if (isHoliday) {
      toast.error("Cannot mark attendance on a holiday. Please select a different date.");
      return;
    }

    const withDate = formData
      .filter((entry) => !entry.disabled)
      .map((entry) => ({ ...entry, date: selectedDate }));

    if (withDate.length === 0) {
      toast.error("No attendance to submit");
      return;
    }

    try {
      const result = await markAttendance(withDate);
      fetchAssignedStudentsWithAttendance(selectedDate);
      fetchDailySummary(selectedDate, selectedClass); // Refresh daily summary
      
      // Show warning if some dates were skipped due to holidays
      if (result?.skippedHolidays && result.skippedHolidays.length > 0) {
        toast.error(`Attendance cannot be marked for ${result.skippedHolidays.length} date(s) as they are holidays.`, {
          duration: 5000
        });
      } else {
        toast.success(`Attendance submitted for ${withDate.length} students!`);
      }
    } catch (error) {
      toast.error("Failed to submit attendance. Please try again.");
      console.error("Submit attendance error:", error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "present":
        return <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />;
      case "absent":
        return <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />;
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

  const submittedCount = formData.filter(f => f.disabled).length;
  const totalStudents = formData.length;
  const pendingCount = totalStudents - submittedCount;

  // Get filtered students for the selected class (academic year-aware)
  const currentAcademicYear = selectedAcademicYear;
  const filteredStudents = assignedStudents.filter(student => {
    if (!selectedClass || selectedClass === 'total') return false;
    const classInfo = getStudentClassForAcademicYear(student, currentAcademicYear);
    if (!classInfo) return false;
    const classKey = `${classInfo.displayClass}-${classInfo.displaySection}`;
    // Only match the academic year-aware class, not the database class
    // This ensures students appear only in the class they were actually in during this academic year
    return classKey === selectedClass;
  });

  // When a specific class is selected, derive summary numbers from the same filtered students
  const isSpecificClass = selectedClass && selectedClass !== 'total';

  const actualTotalStudents = isSpecificClass
    ? filteredStudents.length
    : dailySummary.totalStudents;

  const actualPresents = isSpecificClass
    ? filteredStudents.filter(student => {
        const record = attendanceRecords.find(rec => rec.student._id === student._id);
        return record && record.status === 'present';
      }).length
    : dailySummary.presents;

  const actualAbsents = isSpecificClass
    ? filteredStudents.filter(student => {
        const record = attendanceRecords.find(rec => rec.student._id === student._id);
        return record && record.status === 'absent';
      }).length
    : dailySummary.absents;

  const actualAttendancePercentage =
    actualTotalStudents > 0
      ? Math.round((actualPresents / actualTotalStudents) * 100)
      : 0;

  return (
    <div className="p-2 sm:p-3 md:p-4 lg:p-1 max-w-6xl mx-auto">
      <div className="mb-4 sm:mb-5 md:mb-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 text-primary flex items-center gap-1.5 sm:gap-2">
          <Calendar className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 flex-shrink-0" />
          <span>Mark Attendance</span>
        </h2>
        <p className="text-sm sm:text-base text-gray-600">Mark daily attendance for your assigned students</p>
      </div>

      {/* Date Selection */}
      <div className="bg-white rounded-lg shadow-sm border p-3 sm:p-4 mb-4 sm:mb-5 md:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <label className="font-semibold text-sm sm:text-base text-gray-700 flex items-center gap-1.5 sm:gap-2">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span>Select Date:</span>
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-300 px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base rounded-md focus:ring-2 focus:ring-primary focus:border-transparent w-full sm:w-auto"
            max={format(new Date(), "yyyy-MM-dd")}
          />
        </div>
      </div>

      {/* Class Selection */}
      <div className="bg-white rounded-lg shadow-sm border p-3 sm:p-4 mb-4 sm:mb-5 md:mb-6">
        <div className="flex flex-row items-center gap-2 sm:gap-4">
          <label className="font-semibold text-sm sm:text-base text-gray-700 flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span>Select Class:</span>
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="border border-gray-300 px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base rounded-md focus:ring-2 focus:ring-primary focus:border-transparent flex-1 min-w-0 sm:min-w-[200px]"
          >
            <option value="total">Total Students (All Classes)</option>
            {availableClasses.map((className) => {
              // Count how many students are in this class (academic year-aware)
              const currentAcademicYear = selectedAcademicYear;
              const studentsInClass = assignedStudents.filter(student => {
                const classInfo = getStudentClassForAcademicYear(student, currentAcademicYear);
                if (!classInfo) return false;
                const classKey = `${classInfo.displayClass}-${classInfo.displaySection}`;
                // Only match the academic year-aware class, not the database class
                // This ensures accurate student counts per class
                return classKey === className;
              });
              
              // Check promotion status for this class
              const promotedStudents = studentsInClass.filter(student => {
                const classInfo = getStudentClassForAcademicYear(student, currentAcademicYear);
                if (!classInfo) return false;
                // If student was promoted IN the current academic year, they were in this class before promotion
                // Check if this class matches their fromClass (the class they were in before promotion)
                if (classInfo.isPromoted && classInfo.promotionYear === currentAcademicYear) {
                  const classKey = `${classInfo.displayClass}-${classInfo.displaySection}`;
                  return classKey === className; // They were in this class before promotion
                }
                return false;
              });
              
              const hasPromotedStudents = promotedStudents.length > 0;
              const isAssignedClass = backendAssignedClasses?.includes(className) || false;
              
              // Show class even if no students currently (if it's an assigned class)
              const displayCount = studentsInClass.length > 0 ? studentsInClass.length : (isAssignedClass ? 0 : 0);
              
              return (
                <option key={className} value={className}>
                  Class {className} {displayCount > 0 ? `(${displayCount} students)` : isAssignedClass ? '(Assigned - No students)' : ''}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Holiday Warning Box - Display instead of summary and statistics */}
      {isHoliday && (
        <motion.div
          className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-yellow-300 shadow-lg mb-4 sm:mb-5 md:mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
              <AlertCircle className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-yellow-900 mb-1">
                {holidayInfo?.name || 'Sunday'} - Holiday
              </h3>
              <p className="text-sm sm:text-base text-yellow-800 mb-2">
                {format(new Date(selectedDate), "EEEE, MMMM do, yyyy")}
              </p>
              <p className="text-xs sm:text-sm text-yellow-700">
                Attendance cannot be marked on holidays. Please select a different date.
              </p>
              {holidayInfo?.description && (
                <div className="mt-3 pt-3 border-t border-yellow-300">
                  <p className="text-xs sm:text-sm text-yellow-800 font-medium mb-1">Description:</p>
                  <p className="text-xs sm:text-sm text-yellow-700">{holidayInfo.description}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Daily Summary Header - Only show when NOT a holiday */}
      {!isHoliday && (
        <motion.div
          className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-primary/20 shadow-lg mb-4 sm:mb-5 md:mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-primary to-primary-dark rounded-lg sm:rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                <Calendar className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-primary">Daily Attendance Summary</h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-0.5 break-words">
                  {format(new Date(selectedDate), "EEEE, MMMM do, yyyy")}
                </p>
                {selectedClass && selectedClass !== '' && selectedClass !== 'total' && (
                  <p className="text-xs sm:text-sm text-primary font-medium mt-0.5">
                    Filtered for: Class {selectedClass}
                  </p>
                )}
                {selectedClass === 'total' && (
                  <p className="text-xs sm:text-sm text-primary font-medium mt-0.5">
                    Showing all assigned classes ({availableClasses.length} classes)
                  </p>
                )}
                {(!selectedClass || selectedClass === '') && availableClasses.length > 0 && (
                  <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
                    Showing all assigned classes ({availableClasses.length} classes)
                  </p>
                )}
              </div>
            </div>
            <div className="text-left sm:text-right flex-shrink-0">
              <div className="text-2xl sm:text-3xl md:text-4xl font-black text-primary">
                {summaryLoading ? (
                  <div className="animate-pulse bg-primary/20 h-8 sm:h-9 md:h-10 w-16 sm:w-18 md:w-20 rounded"></div>
                ) : (
                  `${actualAttendancePercentage}%`
                )}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 font-medium">Overall Rate</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Enhanced Statistics Cards - Only show when NOT a holiday */}
      {!isHoliday && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-5 md:mb-6">
        {/* Total Students Card */}
        <motion.div
          className="bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800 text-white rounded-lg p-2.5 sm:p-3 md:p-4 shadow-lg relative overflow-hidden border border-slate-500/20"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
          <div className="relative flex items-center justify-between">
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-white/15 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-md border border-white/10 flex-shrink-0">
              <Users className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />
            </div>
            <div className="text-right min-w-0 flex-1">
              <div className="text-lg sm:text-xl md:text-2xl font-bold drop-shadow-sm truncate">
                {summaryLoading ? (
                  <div className="animate-pulse bg-white/20 h-5 sm:h-6 md:h-7 w-8 sm:w-10 md:w-12 rounded"></div>
                ) : (
                  actualTotalStudents
                )}
              </div>
              <div className="text-white/80 text-xs font-medium">Total</div>
            </div>
          </div>
        </motion.div>

        {/* Presents Card */}
        <motion.div
          className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 text-white rounded-lg p-2.5 sm:p-3 md:p-4 shadow-lg relative overflow-hidden border border-emerald-400/20"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="relative flex items-center justify-between">
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-md border border-white/20 flex-shrink-0">
              <CheckCircle className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />
            </div>
            <div className="text-right min-w-0 flex-1">
              <div className="text-lg sm:text-xl md:text-2xl font-bold drop-shadow-sm truncate">
                {summaryLoading ? (
                  <div className="animate-pulse bg-white/20 h-5 sm:h-6 md:h-7 w-8 sm:w-10 md:w-12 rounded"></div>
                ) : (
                  actualPresents
                )}
              </div>
              <div className="text-white/90 text-xs font-medium">Present</div>
            </div>
          </div>
        </motion.div>

        {/* Absents Card */}
        <motion.div
          className="bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-600 text-white rounded-lg p-2.5 sm:p-3 md:p-4 shadow-lg relative overflow-hidden border border-orange-400/20"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="relative flex items-center justify-between">
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-md border border-white/20 flex-shrink-0">
              <XCircle className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />
            </div>
            <div className="text-right min-w-0 flex-1">
              <div className="text-lg sm:text-xl md:text-2xl font-bold drop-shadow-sm truncate">
                {summaryLoading ? (
                  <div className="animate-pulse bg-white/20 h-5 sm:h-6 md:h-7 w-8 sm:w-10 md:w-12 rounded"></div>
                ) : (
                  actualAbsents
                )}
              </div>
              <div className="text-white/90 text-xs font-medium">Absent</div>
            </div>
          </div>
        </motion.div>

        {/* Attendance Percentage Card */}
        <motion.div
          className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white rounded-lg p-2.5 sm:p-3 md:p-4 shadow-lg relative overflow-hidden border border-purple-400/20"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="relative flex items-center justify-between">
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-md border border-white/20 flex-shrink-0">
              {actualAttendancePercentage >= 90 ? (
                <TrendingUp className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />
              ) : (
                <TrendingDown className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />
              )}
            </div>
            <div className="text-right min-w-0 flex-1">
              <div className="text-lg sm:text-xl md:text-2xl font-bold drop-shadow-sm truncate">
                {summaryLoading ? (
                  <div className="animate-pulse bg-white/20 h-5 sm:h-6 md:h-7 w-10 sm:w-12 md:w-14 rounded"></div>
                ) : (
                  `${actualAttendancePercentage}%`
                )}
              </div>
              <div className="text-white/90 text-xs font-medium">Rate</div>
            </div>
          </div>
        </motion.div>
      </div>
      )}

      {/* Loading State for Summary - Only show when NOT a holiday */}
      {!isHoliday && summaryLoading && (
        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg border border-white/50 mb-4 sm:mb-5 md:mb-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <span className="text-xs sm:text-sm md:text-base text-gray-600 font-medium">Loading daily attendance summary...</span>
          </div>
        </motion.div>
      )}

      {/* Loading State */}
      {fetchLoading && (
        <div className="flex items-center justify-center py-6 sm:py-8">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-sm sm:text-base text-gray-600">Loading students...</span>
        </div>
      )}

      {/* Success/Error Messages - Only show when NOT a holiday */}
      {!isHoliday && successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-3 sm:px-4 py-2 sm:py-3 rounded-md mb-3 sm:mb-4 text-sm sm:text-base">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="break-words">{successMessage}</span>
          </div>
        </div>
      )}

      {!isHoliday && error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-3 sm:px-4 py-2 sm:py-3 rounded-md mb-3 sm:mb-4 text-sm sm:text-base">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="break-words">{error}</span>
          </div>
        </div>
      )}

      {/* Show message when "Total Students" is selected - Only show when NOT a holiday */}
      {!isHoliday && selectedClass === 'total' && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-3 sm:px-4 py-2 sm:py-3 rounded-md mb-3 sm:mb-4 text-sm sm:text-base">
          <div className="flex items-center gap-2 flex-wrap">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span className="font-medium">Summary view: All assigned classes</span>
            <span className="text-xs sm:text-sm">- Individual student list is hidden</span>
          </div>
        </div>
      )}

      {/* Show message when no class selected - Only show when NOT a holiday */}
      {!isHoliday && !selectedClass && availableClasses.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-3 sm:px-4 py-2 sm:py-3 rounded-md mb-3 sm:mb-4 text-sm sm:text-base">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span>Please select a class to view students</span>
          </div>
        </div>
      )}

      {/* Show message when no students in selected class - Only show when NOT a holiday */}
      {!isHoliday && selectedClass && selectedClass !== 'total' && formData.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 sm:px-4 py-2 sm:py-3 rounded-md mb-3 sm:mb-4 text-sm sm:text-base">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span>No students found in Class {selectedClass}</span>
          </div>
        </div>
      )}

      {/* Professional Table Structure - Only show when a specific class is selected and NOT a holiday */}
      {!isHoliday && selectedClass && selectedClass !== 'total' && (
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="bg-gradient-to-r from-primary to-primary-dark text-white px-3 sm:px-4 py-2 sm:py-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                <h3 className="text-sm sm:text-base font-bold flex items-center gap-1.5 sm:gap-2">
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>Student Attendance Records</span>
                </h3>
                <div className="text-xs font-medium">
                  {pendingCount > 0 ? (
                    <span className="bg-white/20 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
                      {pendingCount} Pending
                    </span>
                  ) : (
                    <span className="bg-green-500/20 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full flex items-center gap-1 sm:gap-1.5 whitespace-nowrap">
                      <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                      <span>All Submitted</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto -mx-2 sm:mx-0 px-2 sm:px-0">
              <table className="w-full min-w-[700px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">#</th>
                    <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Student Name</th>
                    <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden sm:table-cell">ID</th>
                    <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Class-Section</th>
                    <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden md:table-cell">Reason</th>
                    <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {formData.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-3 sm:px-4 py-6 sm:py-8 text-center text-gray-500">
                        <Users className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm sm:text-base">No students found in Class {selectedClass}</p>
                      </td>
                    </tr>
                  ) : (
                    formData.map((entry, index) => {
                      const student = filteredStudents.find((s) => s._id === entry.studentId);
                      const isDisabled = entry.disabled;
                      const isEditingRow = isEditing && editingStudentId === entry.studentId;
                      
                      if (!student) {
                        return null;
                      }

                      return (
                        <tr
                          key={entry.studentId}
                          className={`hover:bg-gray-50 transition-colors ${
                            isEditingRow ? "bg-yellow-50" : ""
                          } ${isDisabled && !isEditingRow ? "bg-gray-50 opacity-75" : ""}`}
                        >
                          {/* Serial Number */}
                          <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                            {index + 1}
                          </td>

                          {/* Student Name */}
                          <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3">
                            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs sm:text-sm font-semibold flex-shrink-0">
                                {student.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-xs sm:text-sm text-gray-800 font-medium truncate max-w-[120px] sm:max-w-none">{student.name}</span>
                            </div>
                          </td>

                          {/* Student ID */}
                          <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-600 font-mono hidden sm:table-cell">
                            {student.studentId}
                          </td>

                          {/* Class-Section with Promotion Status */}
                          <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                            {(() => {
                              const classInfo = getStudentClassForAcademicYear(student, getCurrentAcademicYear());
                              // const isDifferent = classInfo.displayClass !== student.class || classInfo.displaySection !== student.section;
                              
                              return (
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                  <span className="text-gray-600 whitespace-nowrap">
                                    {classInfo.displayClass} - {classInfo.displaySection}
                                  </span>
                                  {classInfo.isPromoted && (
                                    <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold w-fit">
                                      <ArrowUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                      <span className="hidden sm:inline">Promoted</span>
                                      <span className="sm:hidden">P</span>
                                    </span>
                                  )}
                                  {/* {isDifferent && (
                                    <span className="text-xs text-gray-400 hidden md:inline">
                                      (DB: {student.class}-{student.section})
                                    </span>
                                  )} */}
                                </div>
                              );
                            })()}
                          </td>

                          {/* Status */}
                          <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3">
                              {!isDisabled || isEditingRow ? (
                                <>
                                  <label className="flex items-center gap-1 cursor-pointer">
                                    <input
                                      type="radio"
                                      name={`status-${entry.studentId}`}
                                      value="present"
                                      checked={entry.status === "present"}
                                      onChange={() => handleChange(index, "status", "present")}
                                      className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-600 focus:ring-green-500"
                                      disabled={isDisabled && !isEditingRow}
                                    />
                                    <span className="text-xs font-medium text-green-700">P</span>
                                  </label>
                                  <label className="flex items-center gap-1 cursor-pointer">
                                    <input
                                      type="radio"
                                      name={`status-${entry.studentId}`}
                                      value="absent"
                                      checked={entry.status === "absent"}
                                      onChange={() => handleChange(index, "status", "absent")}
                                      className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-600 focus:ring-red-500"
                                      disabled={isDisabled && !isEditingRow}
                                    />
                                    <span className="text-xs font-medium text-red-700">A</span>
                                  </label>
                                </>
                              ) : (
                                <div className={`inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-semibold ${
                                  entry.status === 'present' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  <span className="hidden sm:inline">{getStatusIcon(entry.status)}</span>
                                  <span>{entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}</span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Reason */}
                          <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 hidden md:table-cell">
                            {entry.status === "absent" && (!isDisabled || isEditingRow) ? (
                              <input
                                type="text"
                                placeholder="Enter reason..."
                                value={entry.reason}
                                onChange={(e) => handleChange(index, "reason", e.target.value)}
                                className="w-full max-w-xs border border-gray-300 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                required={entry.status === "absent" && !isDisabled}
                              />
                            ) : entry.existingRecord?.reason ? (
                              <div className="text-xs sm:text-sm text-gray-600 max-w-xs truncate" title={entry.existingRecord.reason}>
                                {entry.existingRecord.reason}
                              </div>
                            ) : (
                              <div className="text-xs sm:text-sm text-gray-400">-</div>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap text-center">
                            {isEditingRow ? (
                              <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleSaveEdit(entry.studentId)}
                                  disabled={submitLoading}
                                  className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors font-medium flex items-center gap-1 w-full sm:w-auto justify-center"
                                >
                                  <CheckCircle className="w-3 h-3 flex-shrink-0" />
                                  <span>{submitLoading ? "Saving..." : "Save"}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={handleCancelEdit}
                                  className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors font-medium w-full sm:w-auto"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : isDisabled ? (
                              <button
                                type="button"
                                onClick={() => handleEdit(entry.studentId)}
                                className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center gap-1 mx-auto"
                              >
                                <Edit className="w-3 h-3 flex-shrink-0" />
                                <span className="hidden sm:inline">Edit</span>
                                <span className="sm:hidden">E</span>
                              </button>
                            ) : (
                              <div className="text-xs text-gray-400">-</div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer - Info & Submit */}
            <div className="bg-gray-50 px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-t border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm text-gray-600">
                <span>Total: <strong className="text-gray-900">{totalStudents}</strong></span>
                <span>Submitted: <strong className="text-green-600">{submittedCount}</strong></span>
                <span>Pending: <strong className="text-orange-600">{pendingCount}</strong></span>
                {isEditing && (
                  <div className="flex items-center gap-1.5 sm:gap-2 text-yellow-700 bg-yellow-50 px-2 sm:px-3 py-0.5 sm:py-1 rounded-md">
                    <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="text-xs font-medium">Edit Mode Active</span>
                  </div>
                )}
              </div>
              {pendingCount > 0 ? (
                <button
                  type="submit"
                  disabled={submitLoading || isEditing}
                  className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm w-full sm:w-auto ${
                    submitLoading || isEditing
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-gradient-to-r from-primary to-primary-dark text-white hover:shadow-xl hover:scale-105'
                  }`}
                >
                  {submitLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="whitespace-nowrap">Submit Attendance ({pendingCount})</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-md text-xs sm:text-sm w-full sm:w-auto">
                  <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="font-semibold">All submitted</span>
                </div>
              )}
            </div>
          </div>
        </form>
      )}
    </div>
  );
};