import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  ComposedChart
} from 'recharts';
import {
  Users,
  Calendar,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  BookOpen,
  Award,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  RefreshCw
} from 'lucide-react';
import { useTeacherAnalyticsStore } from '../stores/useTeacherAnalyticsStore';
import { getCurrentAcademicYear, getAcademicYearOptions } from '../../utils/academicYear';
import toast from 'react-hot-toast';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const TeacherAnalyticsDashboard = () => {
  const {
    analyticsData,
    loading,
    error,
    fetchTeacherAnalytics,
    refreshData
  } = useTeacherAnalyticsStore();

  const [selectedAcademicYear, setSelectedAcademicYear] = useState(getCurrentAcademicYear());
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSection, setSelectedSection] = useState('all');
  const [activeChart, setActiveChart] = useState('attendance');
  const [academicYearOptions, setAcademicYearOptions] = useState([]);
  const [attendanceFilters, setAttendanceFilters] = useState({
    class: 'all',
    section: 'all',
    academicYear: getCurrentAcademicYear()
  });

  useEffect(() => {
    // Initialize academic year options
    setAcademicYearOptions(getAcademicYearOptions(2, 2));
  }, []);

  useEffect(() => {
    fetchTeacherAnalytics({ 
      academicYear: selectedAcademicYear, 
      class: selectedClass,
      section: selectedSection 
    });
    
    // Also update attendance filters to match main filters
    setAttendanceFilters({
      academicYear: selectedAcademicYear,
      class: selectedClass,
      section: selectedSection
    });
  }, [selectedAcademicYear, selectedClass, selectedSection]);

  const handleRefresh = async () => {
    await refreshData();
    toast.success('Analytics data refreshed!');
  };

  const handleAttendanceFilterChange = (filterType, value) => {
    const newFilters = {
      ...attendanceFilters,
      [filterType]: value
    };
    
    setAttendanceFilters(newFilters);
    
    // Automatically apply filters when they change
    fetchTeacherAnalytics({
      academicYear: newFilters.academicYear,
      class: newFilters.class,
      section: newFilters.section
    });
  };


  const resetAttendanceFilters = () => {
    const currentYear = getCurrentAcademicYear();
    const resetFilters = {
      class: 'all',
      section: 'all',
      academicYear: currentYear
    };
    
    setAttendanceFilters(resetFilters);
    
    // Also update main filters
    setSelectedAcademicYear(currentYear);
    setSelectedClass('all');
    setSelectedSection('all');
    
    fetchTeacherAnalytics({
      academicYear: currentYear,
      class: 'all',
      section: 'all'
    });
  };

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'blue' }) => (
    <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              {trendValue}% from last period
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const ChartCard = ({ title, children, className = "", showAttendanceFilters = false }) => (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center space-x-2">
          {/* <button
            onClick={() => setActiveChart('attendance')}
            className={`px-3 py-1 rounded-md text-sm ${
              activeChart === 'attendance' ? 'bg-blue-100 text-blue-700' : 'text-gray-500'
            }`}
          >
            Attendance
          </button> */}
        </div>
      </div>
      
      {/* Attendance Filters */}
      {showAttendanceFilters && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-sm font-medium text-gray-700">Attendance Filters (Auto-Apply)</h4>
              <p className="text-xs text-gray-500">Filters apply automatically when changed. Data is filtered by Academic Year.</p>
            </div>
            {/* <button
              onClick={resetAttendanceFilters}
              className="px-3 py-1 bg-gray-500 text-white text-xs rounded-md hover:bg-gray-600 transition-colors"
            >
              Reset to All
            </button> */}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Academic Year Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Academic Year</label>
              <select
                value={attendanceFilters.academicYear}
                onChange={(e) => handleAttendanceFilterChange('academicYear', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {academicYearOptions.map(year => (
                  <option key={year} value={year}>
                    {year} {year === getCurrentAcademicYear() ? '(Current)' : ''}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Class Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Class</label>
              <select
                value={attendanceFilters.class}
                onChange={(e) => handleAttendanceFilterChange('class', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Classes</option>
                {overview?.assignedClasses?.map(cls => (
                  <option key={cls} value={cls}>Class {cls}</option>
                ))}
              </select>
            </div>
            
            {/* Section Filter */}
            {/* <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Section</label>
              <select
                value={attendanceFilters.section}
                onChange={(e) => handleAttendanceFilterChange('section', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={attendanceFilters.class === 'all'}
              >
                <option value="all">All Sections</option>
                {attendanceFilters.class !== 'all' && overview?.assignedClasses?.includes(attendanceFilters.class) && (
                  <>
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                    <option value="D">Section D</option>
                  </>
                )}
              </select>
            </div> */}
          </div>
          
          {/* Active Filters Display */}
          <div className="mt-3 flex flex-wrap gap-2">
            {attendanceFilters.academicYear !== getCurrentAcademicYear() && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                Academic Year: {attendanceFilters.academicYear}
              </span>
            )}
            {attendanceFilters.class !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                Class: {attendanceFilters.class}
              </span>
            )}
            {attendanceFilters.section !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                Section: {attendanceFilters.section}
              </span>
            )}
          </div>
        </div>
      )}
      
      {children}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
        <div className="flex items-center gap-2">
          <XCircle className="w-5 h-5" />
          Error loading analytics: {error}
        </div>
      </div>
    );
  }

  // Check if there's no data
  if (!analyticsData || analyticsData.overview?.totalStudents === 0) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Analytics Data Available</h2>
          <p className="text-gray-600 mb-6">
            You don't have any assigned classes or students yet. Contact your administrator to get assigned to classes.
          </p>
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md max-w-md mx-auto">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span className="font-medium">No assigned classes found</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const {
    overview,
    attendanceData,
    classPerformance,
    studentProgress,
    assignmentStats,
    attendanceTrends,
    classComparison
  } = analyticsData || {};

  // Debug logging
  console.log('Teacher Analytics Data:', analyticsData);
  console.log('Class Performance Data:', classPerformance);
  console.log('Current Filters:', { selectedAcademicYear, selectedClass, selectedSection });

  return (
    <div className="p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Teacher Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Comprehensive insights into your teaching performance</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
          <select
            value={selectedAcademicYear}
            onChange={(e) => setSelectedAcademicYear(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-auto"
          >
            {academicYearOptions.map(year => (
              <option key={year} value={year}>
                {year} {year === getCurrentAcademicYear() ? '(Current)' : ''}
              </option>
            ))}
          </select>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-auto"
          >
            <option value="all">All Classes</option>
            {overview?.assignedClasses?.map(cls => (
              <option key={cls} value={cls}>Class {cls}</option>
            ))}
          </select>
          <button
            onClick={handleRefresh}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors w-full sm:w-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <StatCard
          title="Total Students"
          value={overview?.totalStudents || 0}
          icon={Users}
         
          color="blue"
        />
        <StatCard
          title="Average Attendance"
          value={`${overview?.averageAttendance || 0}%`}
          icon={CheckCircle}
         
          color="green"
        />
        <StatCard
          title="Assignments Created"
          value={overview?.assignmentsCreated || 0}
          icon={BookOpen}
       
          color="purple"
        />
        <StatCard
          title="Pending Evaluations"
          value={overview?.pendingEvaluations || 0}
          icon={Clock}
         
          color="orange"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        {/* Attendance Trends */}
        <ChartCard title="Attendance Trends" showAttendanceFilters={true}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={attendanceTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                label={{ value: 'Number of Students', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value, name) => [`${value} students`, name]}
                labelFormatter={(label) => `Date: ${label}`}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="present"
                stackId="1"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.6}
                name="Present"
              />
              <Area
                type="monotone"
                dataKey="absent"
                stackId="1"
                stroke="#EF4444"
                fill="#EF4444"
                fillOpacity={0.6}
                name="Absent"
              />
            </AreaChart>
          </ResponsiveContainer>
          
          {/* Filter Summary */}
          {/* <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-blue-800">
                <span className="font-medium">Showing:</span> 
                {attendanceFilters.period !== '30' && ` ${attendanceFilters.period} days`}
                {attendanceFilters.class !== 'all' && ` • Class ${attendanceFilters.class}`}
                {attendanceFilters.section !== 'all' && ` • Section ${attendanceFilters.section}`}
                {attendanceFilters.class === 'all' && attendanceFilters.section === 'all' && attendanceFilters.period === '30' && ' Total Students (All Classes)'}
                {attendanceFilters.class === 'all' && attendanceFilters.section === 'all' && attendanceFilters.period !== '30' && ' Total Students (All Classes)'}
              </div>
              <div className="text-xs text-blue-600">
                {attendanceTrends?.length || 0} data points
              </div>
            </div>
          </div> */}
        </ChartCard>

         {/* Class Performance */}
         <ChartCard title="Class Performance Comparison">
           {classPerformance && classPerformance.length > 0 ? (
             <div className="w-full h-[450px] flex items-center justify-center p-2">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart 
                   data={classPerformance} 
                   key={`${selectedClass}-${selectedSection}-${selectedAcademicYear}`}
                   margin={{ top: 30, right: 40, left: 30, bottom: 80 }}
                 >
                   <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" />
                   <XAxis 
                     dataKey="class" 
                     tick={{ fontSize: 14, fontWeight: 'bold' }}
                     angle={-45}
                     textAnchor="end"
                     height={100}
                     interval={0}
                     axisLine={{ stroke: '#374151', strokeWidth: 2 }}
                     tickLine={{ stroke: '#374151', strokeWidth: 2 }}
                   />
                   <YAxis 
                     label={{ 
                       value: 'Attendance Rate (%)', 
                       angle: -90, 
                       position: 'insideLeft',
                       style: { 
                         textAnchor: 'middle',
                         fontSize: '14px',
                         fontWeight: 'bold',
                         fill: '#374151'
                       }
                     }}
                     domain={[0, 100]}
                     tick={{ fontSize: 12, fontWeight: 'bold' }}
                     width={90}
                     axisLine={{ stroke: '#374151', strokeWidth: 2 }}
                     tickLine={{ stroke: '#374151', strokeWidth: 2 }}
                   />
                   <Tooltip 
                     formatter={(value, name) => [`${value}%`, name]}
                     labelFormatter={(label) => `Class: ${label}`}
                     contentStyle={{
                       backgroundColor: 'white',
                       border: '2px solid #00796B',
                       borderRadius: '12px',
                       boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.2)',
                       fontSize: '14px',
                       fontWeight: 'bold'
                     }}
                   />
                   <Legend 
                     verticalAlign="top" 
                     height={50}
                     wrapperStyle={{ 
                       paddingBottom: '15px',
                       fontSize: '14px',
                       fontWeight: 'bold'
                     }}
                   />
                   <Bar 
                     dataKey="attendanceRate" 
                     fill="url(#attendanceGradient)" 
                     name="Attendance Rate"
                     radius={[8, 8, 0, 0]}
                     maxBarSize={120}
                     stroke="#00796B"
                     strokeWidth={2}
                   />
                   <defs>
                     <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="0%" stopColor="#00796B" />
                       <stop offset="50%" stopColor="#00695C" />
                       <stop offset="100%" stopColor="#004D40" />
                     </linearGradient>
                   </defs>
                 </BarChart>
               </ResponsiveContainer>
             </div>
           ) : (
             <div className="flex items-center justify-center h-[450px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
               <div className="text-center">
                 <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                 <p className="text-gray-500 font-medium text-lg">No Performance Data Available</p>
                 <p className="text-sm text-gray-400">
                   {selectedClass !== 'all' ? `No data found for Class ${selectedClass}` : 'No class performance data available'}
                 </p>
               </div>
             </div>
           )}
         </ChartCard>

        {/* Student Progress Distribution */}
        <ChartCard title="Student Progress Distribution">
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={studentProgress}
                cx="50%"
                cy="45%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {studentProgress?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name) => [`${value} students`, name]}
                labelFormatter={(label) => `Category: ${label}`}
              />
              <Legend 
                verticalAlign="bottom" 
                height={100}
                layout="horizontal"
                align="center"
                wrapperStyle={{
                  paddingTop: '10px',
                  fontSize: '12px',
                  maxWidth: '100%',
                  overflow: 'visible',
                  flexWrap: 'wrap',
                  justifyContent: 'center'
                }}
                formatter={(value, entry) => (
                  <span style={{ 
                    color: entry.color,
                    fontSize: '12px',
                    display: 'inline-block',
                    marginRight: '12px',
                    marginBottom: '4px',
                    whiteSpace: 'nowrap'
                  }}>
                    {value}: {entry.payload.value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Assignment Statistics */}
        <ChartCard title="Assignment Statistics">
          <div className="w-full h-[400px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart 
                data={assignmentStats}
                margin={{ top: 20, right: 30, left: 30, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 14, fontWeight: 'bold' }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                  axisLine={{ stroke: '#374151', strokeWidth: 2 }}
                  tickLine={{ stroke: '#374151', strokeWidth: 2 }}
                />
                <YAxis 
                  yAxisId="left" 
                  label={{ 
                    value: 'Assignment Count', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { 
                      textAnchor: 'middle',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      fill: '#374151'
                    }
                  }}
                  tick={{ fontSize: 12, fontWeight: 'bold' }}
                  width={60}
                  axisLine={{ stroke: '#374151', strokeWidth: 2 }}
                  tickLine={{ stroke: '#374151', strokeWidth: 2 }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  label={{ 
                    value: 'Completion Rate (%)', 
                    angle: 90, 
                    position: 'insideRight',
                    style: { 
                      textAnchor: 'middle',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      fill: '#374151'
                    }
                  }}
                  tick={{ fontSize: 12, fontWeight: 'bold' }}
                  width={60}
                  axisLine={{ stroke: '#374151', strokeWidth: 2 }}
                  tickLine={{ stroke: '#374151', strokeWidth: 2 }}
                />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'Completion Rate %') {
                      return [`${value}%`, name];
                    }
                    return [`${value}`, name];
                  }}
                  labelFormatter={(label) => `Month: ${label}`}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '2px solid #00796B',
                    borderRadius: '12px',
                    boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.2)',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={50}
                  wrapperStyle={{ 
                    paddingBottom: '15px',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                />
                <Bar 
                  yAxisId="left" 
                  dataKey="created" 
                  fill="url(#assignmentGradient)" 
                  name="Assignments Created"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={60}
                  stroke="#00796B"
                  strokeWidth={2}
                />
                <Bar 
                  yAxisId="left" 
                  dataKey="submitted" 
                  fill="url(#submissionGradient)" 
                  name="Submissions Received"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={60}
                  stroke="#10B981"
                  strokeWidth={2}
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="completionRate" 
                  stroke="#EF4444" 
                  strokeWidth={4}
                  name="Completion Rate %"
                  dot={{ fill: '#EF4444', strokeWidth: 3, r: 6 }}
                />
                <defs>
                  <linearGradient id="assignmentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00796B" />
                    <stop offset="50%" stopColor="#00695C" />
                    <stop offset="100%" stopColor="#004D40" />
                  </linearGradient>
                  <linearGradient id="submissionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="50%" stopColor="#059669" />
                    <stop offset="100%" stopColor="#047857" />
                  </linearGradient>
                </defs>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {/* Top Performing Students */}
        <div className="bg-white rounded-lg shadow-sm border p-3 sm:p-4 lg:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Students</h3>
          <div className="space-y-3">
            {overview?.topStudents?.map((student, index) => (
              <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <p className="text-sm text-gray-600">Class {student.class}-{student.section}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">{student.attendanceRate}%</p>
                  <p className="text-xs text-gray-500">Attendance</p>
                </div>
              </div>
            ))}
          </div>
        </div>



      </div>

  
    </div>
  );
};
