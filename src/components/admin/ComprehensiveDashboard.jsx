import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  GraduationCap, 
  UserCheck, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Activity,
  BookOpen,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  RefreshCw,
  Download,
  BarChart3,
  PieChart,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Award,
  Target,
  Zap,
  MapPin,
  CreditCard,
  Banknote,
  Receipt,
  AlertTriangle,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Percent,
  Calendar as CalendarIcon,
  UserPlus,
  UserMinus,
  DollarSign as DollarIcon,
  PieChart as PieChartIcon,
  BarChart3 as BarChartIcon,
  LineChart as LineChartIcon,
  Smartphone,
  Monitor,
  Tablet,
  Wifi,
  WifiOff,
  Battery,
  Signal,
  School,
  BookOpen as BookIcon,
  FileText,
  MessageSquare,
  Settings,
  Bell,
  Search,
  Menu,
  Grid,
  List,
  Maximize2,
  Minimize2,
  Cake,
  UserX,
  Building,
  Home,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useDashboardStore } from '../stores/useDashboardStore';
import { useTranslation } from 'react-i18next';
import { 
  LineChart as RechartsLineChart, 
  BarChart as RechartsBarChart, 
  PieChart as RechartsPieChart,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  Legend,
  Area,
  AreaChart,
  ComposedChart,
  Bar,
  Line,
  RadialBarChart,
  RadialBar,
  ScatterChart,
  Scatter,
  Pie
} from 'recharts';

// Enhanced color palette
const COLORS = {
  primary: '#3B82F6',
  secondary: '#10B981',
  accent: '#F59E0B',
  danger: '#EF4444',
  warning: '#F97316',
  success: '#22C55E',
  info: '#06B6D4',
  purple: '#8B5CF6',
  pink: '#EC4899',
  indigo: '#6366F1',
  teal: '#14B8A6',
  cyan: '#06B6D4',
  emerald: '#10B981',
  lime: '#84CC16',
  amber: '#F59E0B',
  orange: '#F97316',
  red: '#EF4444',
  rose: '#F43F5E',
  slate: '#64748B',
  brown: '#8B4513',
  gray: '#6B7280'
};

const chartColors = [
  COLORS.primary,
  COLORS.secondary,
  COLORS.accent,
  COLORS.danger,
  COLORS.warning,
  COLORS.success,
  COLORS.info,
  COLORS.purple,
  COLORS.pink,
  COLORS.indigo
];

// Enhanced Animated Counter Component
const AnimatedCounter = ({ value, duration = 2000, prefix = "", suffix = "", className = "" }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById(`counter-${value}`);
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, [value]);

  useEffect(() => {
    if (!isVisible) return;

    let startTime;
    const startValue = 0;
    const endValue = value;
    const startTimestamp = performance.now();

    const updateCount = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const currentValue = Math.floor(progress * (endValue - startValue) + startValue);
      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      }
    };

    requestAnimationFrame(updateCount);
  }, [value, duration, isVisible]);

  return (
    <span id={`counter-${value}`} className={`text-3xl font-bold text-gray-900 ${className}`}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

// Enhanced Metric Card Component
const MetricCard = ({ title, value, change, icon: Icon, color, trend, subtitle, loading = false, className = "", delay = 0, children }) => {
  const [isHovered, setIsHovered] = useState(false);

  if (loading) {
    return (
      <motion.div
        className={`bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100 ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
      >
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer group ${className}`}
      whileHover={{ scale: 1.02, y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-4">
        <motion.div 
          className={`p-3 rounded-xl bg-gradient-to-br from-${color}-100 to-${color}-200 group-hover:from-${color}-200 group-hover:to-${color}-300 transition-all duration-300`}
          whileHover={{ rotate: 5 }}
        >
          <Icon className={`w-6 h-6 text-${color}-600 group-hover:text-${color}-700 transition-colors`} />
        </motion.div>
        {trend && (
          <motion.div
            className={`flex items-center space-x-1 px-2 py-1 rounded-full text-sm font-medium ${
              trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
            animate={{ scale: isHovered ? 1.1 : 1 }}
          >
            {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span>{change}</span>
          </motion.div>
        )}
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className="flex items-baseline space-x-2">
          <AnimatedCounter value={value} className="text-2xl sm:text-3xl" />
          {subtitle && (
            <span className="text-sm text-gray-500">{subtitle}</span>
          )}
        </div>
        {children}
      </div>
    </motion.div>
  );
};

// Enhanced Chart Container Component
const ChartContainer = ({ title, children, className = "", loading = false, actions = true, delay = 0 }) => {
  if (loading) {
    return (
      <motion.div
        className={`bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100 ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
      >
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {actions && (
          <div className="flex items-center space-x-2">
            <motion.button 
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Eye className="w-4 h-4" />
            </motion.button>
            <motion.button 
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Download className="w-4 h-4" />
            </motion.button>
          </div>
        )}
      </div>
      {children}
    </motion.div>
  );
};

// Students by Class Chart Component
const StudentsByClassChart = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsBarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip formatter={(value) => [`${value} students`, 'Count']} />
        <Bar dataKey="count" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

// Income vs Expense Chart Component
const IncomeExpenseChart = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsBarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip formatter={(value, name) => [`₹${value.toLocaleString()}`, name === 'income' ? 'Income' : 'Expense']} />
        <Legend />
        <Bar dataKey="income" fill={COLORS.success} name="Income" />
        <Bar dataKey="expense" fill={COLORS.danger} name="Expense" />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

// Attendance Inspection Chart Component
const AttendanceInspectionChart = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsBarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip formatter={(value, name) => [`${value}`, name === 'students' ? 'Students' : 'Teachers']} />
        <Legend />
        <Bar dataKey="students" fill={COLORS.primary} name="Student" />
        <Bar dataKey="teachers" fill={COLORS.danger} name="Employee" />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

// Income vs Expense Doughnut Chart Component
const IncomeExpenseDoughnutChart = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  const chartData = [
    { name: 'Income', value: data.income || 0, fill: COLORS.success },
    { name: 'Expense', value: data.expense || 0, fill: COLORS.danger }
  ];
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsPieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={120}
          paddingAngle={5}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']} />
        <Legend />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
};

// Annual Fee Summary Chart Component
const AnnualFeeSummaryChart = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsLineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip formatter={(value, name) => [`₹${value.toLocaleString()}`, name === 'totalCollected' ? 'Total' : name === 'totalCollected' ? 'Collected' : 'Remaining']} />
        <Legend />
        <Line type="monotone" dataKey="totalCollected" stroke={COLORS.orange} name="Total" strokeWidth={3} />
        <Line type="monotone" dataKey="totalCollected" stroke={COLORS.success} name="Collected" strokeWidth={3} />
        <Line type="monotone" dataKey="totalCollected" stroke={COLORS.danger} name="Remaining" strokeWidth={3} />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};

// Main Comprehensive Dashboard Component
const ComprehensiveDashboard = () => {
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear());

  const {
    // State
    loading,
    error,
    dashboardData,
    incomeExpenseData,
    attendanceInspectionData,
    annualFeeSummary,
    
    // Methods
    fetchAllDashboardData,
    clearError
  } = useDashboardStore();

  // Load data on component mount
  useEffect(() => {
    console.log("Loading comprehensive dashboard data...");
    fetchAllDashboardData(academicYear, 10);
  }, [academicYear]);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllDashboardData(academicYear, 10);
    setRefreshing(false);
  };

  if (error) {
    return (
      <motion.div
        className="flex items-center justify-center min-h-96 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => { clearError(); fetchAllDashboardData(academicYear, 10); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 p-3 sm:p-6">
      {/* Header */}
      <motion.div 
        className="mb-6 sm:mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <motion.h1 
              className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              Comprehensive School Dashboard
            </motion.h1>
            <motion.p 
              className="text-gray-600 text-sm sm:text-base"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              Real-time insights into your school's performance and operations
            </motion.p>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value={2024}>2024-2025</option>
              <option value={2023}>2023-2024</option>
              <option value={2022}>2022-2023</option>
            </select>
            <motion.button
              className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200 text-sm sm:text-base"
              onClick={handleRefresh}
              disabled={refreshing}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Main Dashboard Content */}
      <motion.div
        className="space-y-6 sm:space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {/* Key Performance Indicators Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
          <MetricCard
            title="Total Strength"
            value={dashboardData.totalStudents}
            subtitle={`Boys: ${dashboardData.studentsByClass.reduce((sum, item) => sum + (item.boys || 0), 0)}, Girls: ${dashboardData.studentsByClass.reduce((sum, item) => sum + (item.girls || 0), 0)}`}
            icon={UserCheckIcon}
            color="blue"
            loading={loading}
            trend="up"
            change="+12%"
            delay={0.1}
          />
          <MetricCard
            title="Total Present"
            value={dashboardData.attendanceSummary.totalPresent}
            subtitle={`Boys: 0, Girls: 0`}
            icon={UserCheckIcon}
            color="green"
            loading={loading}
            trend="up"
            change="+5%"
            delay={0.2}
          />
          <MetricCard
            title="Total Absent"
            value={dashboardData.attendanceSummary.totalAbsent}
            subtitle={`Boys: 0, Girls: 0`}
            icon={UserX}
            color="red"
            loading={loading}
            trend="down"
            change="-3%"
            delay={0.3}
          />
          <MetricCard
            title="Attendance Not Marked"
            value={dashboardData.attendanceSummary.notMarked}
            subtitle={`Boys: ${dashboardData.studentsByClass.reduce((sum, item) => sum + (item.boys || 0), 0)}, Girls: ${dashboardData.studentsByClass.reduce((sum, item) => sum + (item.girls || 0), 0)}`}
            icon={AlertTriangle}
            color="orange"
            loading={loading}
            delay={0.4}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Students by Class */}
          <ChartContainer title="Class Wise Student Strength" loading={loading} delay={0.5}>
            <div className="mb-4">
              <div className="text-center">
                <span className="text-lg font-semibold text-gray-700">
                  Total Students - {dashboardData.totalStudents}
                </span>
              </div>
            </div>
            <StudentsByClassChart data={dashboardData.studentsByClass} loading={loading} />
          </ChartContainer>

          {/* Income vs Expense */}
          <ChartContainer title="Weekend Income Vs Expense (10 Days)" loading={loading} delay={0.6}>
            <IncomeExpenseChart data={incomeExpenseData} loading={loading} />
          </ChartContainer>
        </div>

        {/* Summary Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <MetricCard
            title="Total Active Students"
            value={dashboardData.totalStudents}
            subtitle="TOTAL ACTIVE"
            icon={GraduationCap}
            color="brown"
            loading={loading}
            delay={0.7}
          />
          <MetricCard
            title="Total New Students"
            value={dashboardData.totalAdmissions}
            subtitle="NEW ADMISSIONS"
            icon={UserPlus}
            color="green"
            loading={loading}
            delay={0.8}
          />
          <MetricCard
            title="Total Promoted Students"
            value={dashboardData.totalStudents - dashboardData.totalAdmissions}
            subtitle="PREVIOUS ADMISSIONS"
            icon={UserCheckIcon}
            color="gray"
            loading={loading}
            delay={0.9}
          />
        </div>

        {/* Additional Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Income vs Expense Doughnut */}
          <ChartContainer title="Income Vs Expense Of September" loading={loading} delay={1.0}>
            <IncomeExpenseDoughnutChart 
              data={{
                income: dashboardData.financialSummary.monthlyIncome,
                expense: 0 // You can add expense tracking
              }} 
              loading={loading} 
            />
          </ChartContainer>

          {/* Annual Fee Summary */}
          <ChartContainer title="Annual Fee Summary" loading={loading} delay={1.1}>
            <div className="mb-4 text-center">
              <div className="text-sm text-gray-600">
                Total Dues-{annualFeeSummary.totals.totalDues}, Total Collected-{annualFeeSummary.totals.totalCollected}, Total Remaining-{annualFeeSummary.totals.totalRemaining}
              </div>
            </div>
            <AnnualFeeSummaryChart data={annualFeeSummary.monthlyData} loading={loading} />
          </ChartContainer>
        </div>

        {/* Financial Summary Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <MetricCard
            title="Today's Income/Expense"
            subtitle={`Income: ₹${dashboardData.financialSummary.todayIncome.toLocaleString()}, Expense: ₹0.00`}
            value={dashboardData.financialSummary.todayIncome}
            prefix="₹"
            subtitle="BALANCE: ₹0.00"
            icon={DollarSign}
            color="green"
            loading={loading}
            delay={1.2}
          />
          <MetricCard
            title="Monthly Income/Expense"
            subtitle={`Income: ₹${dashboardData.financialSummary.monthlyIncome.toLocaleString()}, Expense: ₹0.00`}
            value={dashboardData.financialSummary.monthlyIncome}
            prefix="₹"
            subtitle="BALANCE: ₹0.00"
            icon={DollarSign}
            color="blue"
            loading={loading}
            delay={1.3}
          />
          <MetricCard
            title="Income/Expense as on Date"
            subtitle={`Income: ₹${dashboardData.financialSummary.totalCollected.toLocaleString()}, Expense: ₹3,500.00`}
            value={dashboardData.financialSummary.totalCollected}
            prefix="₹"
            subtitle="BALANCE: ₹1,66,000.00"
            icon={DollarSign}
            color="purple"
            loading={loading}
            delay={1.4}
          />
        </div>

        {/* Bottom Row - Birthdays and Staff Counts */}
        <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 sm:gap-6">
          {/* Today's Birthdays */}
          <ChartContainer title={`Today's Students Birthdays (${dashboardData.todayStudentBirthdays})`} loading={loading} delay={1.5}>
            <div className="text-center py-8">
              <Cake className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
              <p className="text-gray-600">Is Today</p>
            </div>
          </ChartContainer>

          <ChartContainer title={`Today's Staff Birthdays (${dashboardData.todayStaffBirthdays})`} loading={loading} delay={1.6}>
            <div className="text-center py-8">
              <Cake className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
              <p className="text-gray-600">Is Today</p>
            </div>
          </ChartContainer>

          {/* Staff Counts */}
          <MetricCard
            title="Employee"
            value={dashboardData.totalEmployees}
            icon={Users}
            color="blue"
            loading={loading}
            delay={1.7}
          />
          <MetricCard
            title="Teachers"
            value={dashboardData.teacherSummary.teachers}
            icon={Monitor}
            color="green"
            loading={loading}
            delay={1.8}
          />
          <MetricCard
            title="Other Staff"
            value={dashboardData.teacherSummary.otherStaff}
            icon={GraduationCap}
            color="purple"
            loading={loading}
            delay={1.9}
          />
          <MetricCard
            title="Parents"
            value={dashboardData.totalParents}
            icon={Users}
            color="orange"
            loading={loading}
            delay={2.0}
          />
        </div>

        {/* Attendance Inspection Chart */}
        <ChartContainer title="Weekend Attendance Inspection" loading={loading} delay={2.1}>
          <AttendanceInspectionChart data={attendanceInspectionData} loading={loading} />
        </ChartContainer>
      </motion.div>
    </div>
  );
};

export default ComprehensiveDashboard;
