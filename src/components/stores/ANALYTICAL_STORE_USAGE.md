# 📊 Analytical Store Usage Guide

## Overview
The `useAnalyticalStore` is a comprehensive Zustand store that manages all analytical data for the admin dashboards. It provides methods to fetch, filter, and manage data from the analytics API endpoints.

## 🚀 Quick Start

```javascript
import { useAnalyticalStore } from './stores/useAnalyticalStore';

function DashboardComponent() {
  const {
    // State
    loading,
    error,
    studentsByClass,
    feeCollectionRates,
    dashboardSummary,
    
    // Methods
    fetchAllAnalytics,
    fetchStudentsByClass,
    fetchFeeCollectionRates,
    updateFilters,
    getComputedAnalytics
  } = useAnalyticalStore();

  useEffect(() => {
    fetchAllAnalytics();
  }, []);

  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {/* Your dashboard components */}
    </div>
  );
}
```

## 📋 Available State

### Student Analytics
- `studentsByClass` - Class-wise student distribution
- `studentsBySection` - Section-wise distribution within classes
- `admissionTrends` - Monthly admission trends
- `attendancePatterns` - Daily attendance patterns
- `attendanceSummary` - Class-wise attendance rates

### Financial Analytics
- `feeCollectionRates` - Monthly fee collection data
- `outstandingPayments` - Students with pending payments
- `paymentMethodsAnalysis` - Online vs offline payment analysis
- `feeStructureByClass` - Class-wise fee breakdowns
- `lateFeeAnalytics` - Late payment patterns and trends

### Academic Performance
- `assignmentCompletionRates` - Assignment submission and evaluation rates
- `teacherWorkload` - Teacher assignment workload and pending evaluations

### Real-time KPIs
- `activeStudentsCount` - Active vs inactive students
- `pendingAdmissionsCount` - Admission status breakdown
- `upcomingEvents` - Upcoming events with RSVP data
- `dashboardSummary` - Overall dashboard metrics

### Utility State
- `loading` - Loading state for API calls
- `error` - Error messages
- `filters` - Current filter settings

## 🔧 Available Methods

### Individual Data Fetching

#### Student Analytics
```javascript
// Fetch students by class
await fetchStudentsByClass();

// Fetch students by section (with optional class filter)
await fetchStudentsBySection('Grade 10');

// Fetch admission trends (with optional year and status filters)
await fetchAdmissionTrends(2024, 'accepted');

// Fetch attendance patterns (with date range and class filters)
await fetchAttendancePatterns('2024-01-01', '2024-12-31', 'Grade 10');

// Fetch attendance summary (with date range)
await fetchAttendanceSummary('2024-01-01', '2024-12-31');
```

#### Financial Analytics
```javascript
// Fetch fee collection rates (with optional year and class filters)
await fetchFeeCollectionRates(2024, 'Grade 10');

// Fetch outstanding payments (with optional class and limit filters)
await fetchOutstandingPayments('Grade 10', 100);

// Fetch payment methods analysis (with optional year and class filters)
await fetchPaymentMethodsAnalysis(2024, 'Grade 10');

// Fetch fee structure by class (with optional academic year)
await fetchFeeStructureByClass('2024-25');

// Fetch late fee analytics (with optional year and class filters)
await fetchLateFeeAnalytics(2024, 'Grade 10');
```

#### Academic Performance
```javascript
// Fetch assignment completion rates (with optional class and section filters)
await fetchAssignmentCompletionRates('Grade 10', 'A');

// Fetch teacher workload
await fetchTeacherWorkload();
```

#### Real-time KPIs
```javascript
// Fetch active students count (with optional class filter)
await fetchActiveStudentsCount('Grade 10');

// Fetch pending admissions count
await fetchPendingAdmissionsCount();

// Fetch upcoming events (with optional limit and category filters)
await fetchUpcomingEvents(10, 'Academic');

// Fetch dashboard summary
await fetchDashboardSummary();
```

### Bulk Data Fetching

```javascript
// Fetch all student analytics data
await fetchAllStudentAnalytics({
  year: 2024,
  class: 'Grade 10',
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  status: 'accepted'
});

// Fetch all financial analytics data
await fetchAllFinancialAnalytics({
  year: 2024,
  class: 'Grade 10',
  academicYear: '2024-25',
  limit: 100
});

// Fetch all academic performance data
await fetchAllAcademicPerformance({
  class: 'Grade 10',
  section: 'A'
});

// Fetch all real-time KPIs data
await fetchAllRealTimeKPIs({
  class: 'Grade 10',
  limit: 10,
  category: 'Academic'
});

// Fetch all analytics data at once
await fetchAllAnalytics({
  year: 2024,
  class: 'Grade 10',
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  academicYear: '2024-25',
  limit: 100,
  category: 'Academic',
  status: 'accepted'
});
```

### Filter Management

```javascript
// Update specific filters
updateFilters({
  year: 2024,
  class: 'Grade 10',
  section: 'A'
});

// Reset all filters to default values
resetFilters();
```

### Utility Methods

```javascript
// Clear error state
clearError();

// Reset entire store
resetAnalyticalStore();

// Get computed analytics (calculated values)
const computed = getComputedAnalytics();
console.log(computed.totalStudents); // Total students count
console.log(computed.totalOutstanding); // Total outstanding amount
console.log(computed.totalCollected); // Total collected amount
```

## 🎯 Usage Examples

### 1. Dashboard Overview Component

```javascript
import { useAnalyticalStore } from './stores/useAnalyticalStore';

function DashboardOverview() {
  const {
    dashboardSummary,
    activeStudentsCount,
    pendingAdmissionsCount,
    loading,
    fetchAllRealTimeKPIs
  } = useAnalyticalStore();

  useEffect(() => {
    fetchAllRealTimeKPIs();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3>Total Students</h3>
        <p className="text-2xl font-bold">{dashboardSummary.totalStudents}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3>Active Students</h3>
        <p className="text-2xl font-bold">{activeStudentsCount.activeStudents}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3>Pending Admissions</h3>
        <p className="text-2xl font-bold">{pendingAdmissionsCount.totalPending}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3>Upcoming Events</h3>
        <p className="text-2xl font-bold">{dashboardSummary.upcomingEvents}</p>
      </div>
    </div>
  );
}
```

### 2. Financial Analytics Component

```javascript
import { useAnalyticalStore } from './stores/useAnalyticalStore';
import { LineChart, BarChart } from 'recharts';

function FinancialAnalytics() {
  const {
    feeCollectionRates,
    outstandingPayments,
    paymentMethodsAnalysis,
    loading,
    fetchAllFinancialAnalytics,
    updateFilters,
    filters
  } = useAnalyticalStore();

  useEffect(() => {
    fetchAllFinancialAnalytics({ year: 2024 });
  }, []);

  const handleYearChange = (year) => {
    updateFilters({ year });
    fetchAllFinancialAnalytics({ year });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <select 
          value={filters.year} 
          onChange={(e) => handleYearChange(e.target.value)}
        >
          <option value={2024}>2024</option>
          <option value={2023}>2023</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3>Fee Collection Trends</h3>
          <LineChart data={feeCollectionRates}>
            {/* Chart configuration */}
          </LineChart>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3>Payment Methods</h3>
          <BarChart data={paymentMethodsAnalysis}>
            {/* Chart configuration */}
          </BarChart>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3>Outstanding Payments</h3>
        <table className="w-full">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Class</th>
              <th>Outstanding Amount</th>
              <th>Last Payment</th>
            </tr>
          </thead>
          <tbody>
            {outstandingPayments.map((payment) => (
              <tr key={payment._id}>
                <td>{payment.studentName}</td>
                <td>{payment.studentClass}</td>
                <td>₹{payment.totalOutstanding}</td>
                <td>{new Date(payment.lastPaymentDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

### 3. Student Analytics Component

```javascript
import { useAnalyticalStore } from './stores/useAnalyticalStore';
import { PieChart, BarChart } from 'recharts';

function StudentAnalytics() {
  const {
    studentsByClass,
    admissionTrends,
    attendanceSummary,
    loading,
    fetchAllStudentAnalytics,
    updateFilters,
    filters
  } = useAnalyticalStore();

  useEffect(() => {
    fetchAllStudentAnalytics({ year: 2024 });
  }, []);

  const handleClassFilter = (className) => {
    updateFilters({ class: className });
    fetchAllStudentAnalytics({ year: 2024, class: className });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <select 
          value={filters.class} 
          onChange={(e) => handleClassFilter(e.target.value)}
        >
          <option value="">All Classes</option>
          <option value="Grade 10">Grade 10</option>
          <option value="Grade 11">Grade 11</option>
          <option value="Grade 12">Grade 12</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3>Students by Class</h3>
          <PieChart data={studentsByClass}>
            {/* Chart configuration */}
          </PieChart>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3>Admission Trends</h3>
          <BarChart data={admissionTrends}>
            {/* Chart configuration */}
          </BarChart>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3>Attendance Summary</h3>
          <BarChart data={attendanceSummary}>
            {/* Chart configuration */}
          </BarChart>
        </div>
      </div>
    </div>
  );
}
```

## 🔄 Error Handling

The store includes comprehensive error handling:

```javascript
const { error, clearError } = useAnalyticalStore();

// Check for errors
if (error) {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      Error: {error}
      <button onClick={clearError} className="ml-2 text-red-500">
        Dismiss
      </button>
    </div>
  );
}
```

## 📊 Data Structure Examples

### Students by Class
```javascript
[
  { _id: "Grade 10", count: 150 },
  { _id: "Grade 11", count: 120 },
  { _id: "Grade 12", count: 100 }
]
```

### Fee Collection Rates
```javascript
[
  { month: "Jan", totalCollected: 50000, paymentCount: 100 },
  { month: "Feb", totalCollected: 45000, paymentCount: 90 },
  // ...
]
```

### Outstanding Payments
```javascript
[
  {
    _id: "student_id",
    studentName: "John Doe",
    studentClass: "Grade 10",
    studentSection: "A",
    parentName: "Jane Doe",
    parentEmail: "jane@example.com",
    parentPhone: "1234567890",
    totalOutstanding: 5000,
    paymentCount: 2,
    lastPaymentDate: "2024-01-15T00:00:00.000Z"
  }
]
```

## 🎯 Best Practices

1. **Use bulk fetching methods** when you need multiple related datasets
2. **Implement proper loading states** to improve user experience
3. **Handle errors gracefully** with user-friendly messages
4. **Use filters efficiently** to avoid unnecessary API calls
5. **Reset store when needed** to prevent memory leaks
6. **Use computed analytics** for calculated values instead of manual calculations

## 🔧 Customization

You can easily extend the store by adding new methods or state:

```javascript
// Add custom computed values
const customAnalytics = useAnalyticalStore((state) => ({
  averageAttendance: state.attendanceSummary.reduce((sum, item) => 
    sum + item.attendanceRate, 0) / state.attendanceSummary.length,
  totalRevenue: state.feeCollectionRates.reduce((sum, item) => 
    sum + item.totalCollected, 0)
}));
```

This analytical store provides a robust foundation for building comprehensive admin dashboards with real-time data, filtering capabilities, and error handling! 🚀

