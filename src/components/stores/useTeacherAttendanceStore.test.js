// Test file for Teacher Attendance Store
// This file demonstrates how to use the store in components

import useTeacherAttendanceStore from './useTeacherAttendanceStore';

// Example usage in a React component
export const ExampleUsage = () => {
  const {
    // State
    allTeachersAttendance,
    teacherAttendanceHistory,
    loading,
    adminLoading,
    teacherLoading,
    error,
    adminError,
    teacherError,
    
    // Admin functions
    markTeacherAttendance,
    getAllTeachersAttendance,
    updateTeacherAttendance,
    deleteTeacherAttendance,
    bulkMarkTeacherAttendance,
    getTeachersWithoutAttendance,
    getMonthlyAttendanceReport,
    getAttendanceSummary,
    getAttendanceStatistics,
    
    // Teacher functions
    getTeacherAttendanceHistory,
    getTeacherAttendanceSummary,
    getTodayAttendanceStatus,
    
    // Utility functions
    setFilters,
    clearFilters,
    clearAllData,
    clearErrors,
    getStatusColor,
    getStatusLabel,
    formatDate,
    getCurrentDate,
    getCurrentMonthYear
  } = useTeacherAttendanceStore();

  // Example: Mark teacher attendance
  const handleMarkAttendance = async () => {
    const result = await markTeacherAttendance({
      teacherId: 'teacher123',
      status: 'present',
      reason: 'Regular attendance',
      notes: 'All good',
      date: getCurrentDate()
    });
    
    if (result.success) {
      console.log('Attendance marked successfully:', result.data);
    } else {
      console.error('Failed to mark attendance:', result.error);
    }
  };

  // Example: Get all teachers attendance
  const handleGetAllAttendance = async () => {
    const result = await getAllTeachersAttendance({
      page: 1,
      limit: 30
    });
    
    if (result.success) {
      console.log('Attendance data:', result.data);
      console.log('Pagination:', result.pagination);
    } else {
      console.error('Failed to fetch attendance:', result.error);
    }
  };

  // Example: Update attendance
  const handleUpdateAttendance = async (attendanceId) => {
    const result = await updateTeacherAttendance(attendanceId, {
      status: 'absent',
      reason: 'Sick leave',
      modificationReason: 'Updated due to illness'
    });
    
    if (result.success) {
      console.log('Attendance updated successfully:', result.data);
    } else {
      console.error('Failed to update attendance:', result.error);
    }
  };

  // Example: Bulk mark attendance
  const handleBulkMarkAttendance = async () => {
    const attendanceData = [
      {
        teacherId: 'teacher1',
        status: 'present',
        reason: 'Regular attendance'
      },
      {
        teacherId: 'teacher2',
        status: 'absent',
        reason: 'Sick leave'
      }
    ];
    
    const result = await bulkMarkTeacherAttendance(attendanceData);
    
    if (result.success) {
      console.log('Bulk marking results:', result.data);
    } else {
      console.error('Failed to bulk mark attendance:', result.error);
    }
  };

  // Example: Get teacher's own attendance
  const handleGetTeacherAttendance = async () => {
    const result = await getTeacherAttendanceHistory({
      page: 1,
      limit: 30
    });
    
    if (result.success) {
      console.log('Teacher attendance history:', result.data);
    } else {
      console.error('Failed to fetch teacher attendance:', result.error);
    }
  };

  // Example: Get monthly report
  const handleGetMonthlyReport = async () => {
    const { month, year } = getCurrentMonthYear();
    const result = await getMonthlyAttendanceReport(year, month);
    
    if (result.success) {
      console.log('Monthly report:', result.data);
    } else {
      console.error('Failed to fetch monthly report:', result.error);
    }
  };

  // Example: Set filters
  const handleSetFilters = () => {
    setFilters({
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      status: 'present'
    });
  };

  return {
    // Return the functions for use in components
    handleMarkAttendance,
    handleGetAllAttendance,
    handleUpdateAttendance,
    handleBulkMarkAttendance,
    handleGetTeacherAttendance,
    handleGetMonthlyReport,
    handleSetFilters,
    
    // Return state for display
    allTeachersAttendance,
    teacherAttendanceHistory,
    loading,
    adminLoading,
    teacherLoading,
    error,
    adminError,
    teacherError
  };
};

// Example: Using the store in a component
export const AttendanceComponent = () => {
  const {
    allTeachersAttendance,
    adminLoading,
    adminError,
    markTeacherAttendance,
    getAllTeachersAttendance,
    getStatusColor,
    getStatusLabel,
    formatDate
  } = useTeacherAttendanceStore();

  // Load data on component mount
  React.useEffect(() => {
    getAllTeachersAttendance();
  }, []);

  if (adminLoading) {
    return <div>Loading...</div>;
  }

  if (adminError) {
    return <div>Error: {adminError}</div>;
  }

  return (
    <div>
      <h2>Teacher Attendance</h2>
      {allTeachersAttendance.map((attendance) => (
        <div key={attendance._id} style={{ color: getStatusColor(attendance.status) }}>
          <p>Teacher: {attendance.teacherName}</p>
          <p>Subject: {attendance.subject}</p>
          <p>Date: {formatDate(attendance.date)}</p>
          <p>Status: {getStatusLabel(attendance.status)}</p>
          <p>Reason: {attendance.reason}</p>
          {attendance.isModified && (
            <p>Modified: {formatDate(attendance.modifiedAt)}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default ExampleUsage;
