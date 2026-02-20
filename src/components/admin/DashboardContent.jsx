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
  Minimize2
} from 'lucide-react';
import { useAnalyticalStore } from '../stores/useAnalyticalStore';
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
  Scatter
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
  slate: '#64748B'
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
const MetricCard = ({ title, value, change, icon: Icon, color, trend, subtitle, loading = false, className = "", delay = 0 }) => {
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

// Mobile Detection Hook
const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

// Students by Class Chart Component
const StudentsByClassChart = ({ data, loading }) => {
  // Use actual data if available, otherwise fallback to sample data
  const chartData = data && data.length > 0 ? data : [
    { name: 'Grade 10', count: 45, value: 45 },
    { name: 'Grade 11', count: 38, value: 38 },
    { name: 'Grade 12', count: 42, value: 42 },
    { name: 'Grade 9', count: 35, value: 35 }
  ];
  
  console.log("StudentsByClassChart - data received:", data);
  console.log("StudentsByClassChart - chartData to render:", chartData);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  try {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <RechartsPieChart
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
          ))}
          <Tooltip formatter={(value) => [`${value} students`, 'Count']} />
        </RechartsPieChart>
      </ResponsiveContainer>
    );
  } catch (error) {
    console.error("Error rendering StudentsByClassChart:", error);
    return (
      <div className="w-full h-64 bg-blue-50 border-2 border-blue-200 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 mb-2">Students by Class</div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {chartData.map((item, index) => (
              <div key={index} className={`p-2 rounded ${
                index === 0 ? 'bg-blue-100' :
                index === 1 ? 'bg-green-100' :
                index === 2 ? 'bg-yellow-100' :
                'bg-purple-100'
              }`}>
                {item.name}: {item.count}
              </div>
            ))}
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Chart will be displayed here
          </div>
        </div>
      </div>
    );
  }
};

// Enhanced Filter Panel Component
const FilterPanel = ({ filters, onFilterChange, onReset }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useMobile();

  return (
    <div className="relative">
      <motion.button
        className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200 text-sm sm:text-base"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Filter className="w-4 h-4" />
        <span className="hidden sm:inline">Filters</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ArrowDownRight className="w-4 h-4" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`absolute top-12 left-0 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-10 ${
              isMobile ? 'w-72' : 'min-w-80'
            }`}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <select
                    value={filters.year}
                    onChange={(e) => onFilterChange({ year: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value={2024}>2024</option>
                    <option value={2023}>2023</option>
                    <option value={2022}>2022</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                  <select
                    value={filters.class}
                    onChange={(e) => onFilterChange({ class: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="">All Classes</option>
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={onReset}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Apply
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Main Dashboard Component
const DashboardContent = () => {
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const isMobile = useMobile();

  const {
    // State
    loading,
    error,
    dashboardSummary,
    activeStudentsCount,
    pendingAdmissionsCount,
    studentsByClass,
    feeCollectionRates,
    outstandingPayments,
    paymentMethodsAnalysis,
    admissionTrends,
    attendanceSummary,
    upcomingEvents,
    filters,
    
    // Methods
    fetchAllAnalytics,
    fetchAllRealTimeKPIs,
    updateFilters,
    resetFilters,
    getComputedAnalytics,
    clearError
  } = useAnalyticalStore();

  // Load data on component mount
  useEffect(() => {
    console.log("Loading analytics data...");
    fetchAllAnalytics();
  }, []);

  // Debug data when it changes
  useEffect(() => {
    console.log("=== Dashboard Data Debug ===");
    console.log("studentsByClass:", studentsByClass);
    console.log("feeCollectionRates:", feeCollectionRates);
    console.log("outstandingPayments:", outstandingPayments);
    console.log("paymentMethodsAnalysis:", paymentMethodsAnalysis);
    console.log("admissionTrends:", admissionTrends);
    console.log("dashboardSummary:", dashboardSummary);
    console.log("loading:", loading);
    console.log("error:", error);
  }, [studentsByClass, feeCollectionRates, outstandingPayments, paymentMethodsAnalysis, admissionTrends, dashboardSummary, loading, error]);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllAnalytics();
    setRefreshing(false);
  };

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    updateFilters(newFilters);
    fetchAllAnalytics({ ...filters, ...newFilters });
  };

  // Get computed analytics
  const computed = getComputedAnalytics();

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
            onClick={() => { clearError(); fetchAllAnalytics(); }}
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
              Comprehensive Analytics Dashboard
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
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={resetFilters}
            />
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
            <motion.button
              className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200 text-sm sm:text-base"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
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
        {/* Key Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
          <MetricCard
            title="Total Students"
            value={computed.totalStudents}
            subtitle={`${computed.academicYear} Academic Year`}
            icon={Users}
            color="blue"
            loading={loading}
            trend="up"
            change="+12%"
            delay={0.1}
          />
          <MetricCard
            title="Active Teachers"
            value={computed.totalTeachers}
            subtitle="Staff Members"
            icon={GraduationCap}
            color="green"
            loading={loading}
            trend="up"
            change="+5%"
            delay={0.2}
          />
          <MetricCard
            title="Fee Collection"
            value={computed.totalCollected}
            prefix="₹"
            subtitle="This Year"
            icon={DollarSign}
            color="purple"
            loading={loading}
            trend="up"
            change="+18%"
            delay={0.3}
          />
          <MetricCard
            title="Pending Offline"
            value={computed.pendingOfflinePayments}
            subtitle="Verification Required"
            icon={Receipt}
            color="orange"
            loading={loading}
            trend="down"
            change="-3%"
            delay={0.4}
          />
        </div>

        {/* Secondary Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
          <MetricCard
            title="Active Students"
            value={computed.activeStudents}
            subtitle="Currently Active"
            icon={Activity}
            color="emerald"
            loading={loading}
            delay={0.5}
          />
          <MetricCard
            title="Outstanding Amount"
            value={computed.totalOutstanding}
            prefix="₹"
            subtitle="Pending Payments"
            icon={AlertCircle}
            color="red"
            loading={loading}
            delay={0.6}
          />
          <MetricCard
            title="Collection Rate"
            value={computed.collectionEfficiency}
            suffix="%"
            subtitle="Success Rate"
            icon={Percent}
            color="cyan"
            loading={loading}
            delay={0.7}
          />
          <MetricCard
            title="Upcoming Events"
            value={computed.upcomingEvents}
            subtitle="This Month"
            icon={Calendar}
            color="indigo"
            loading={loading}
            delay={0.8}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Students by Class */}
          <ChartContainer title="Students by Class Distribution" loading={loading} delay={0.9}>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <StudentsByClassChart data={studentsByClass} loading={loading} />
            )}
          </ChartContainer>

          {/* Fee Collection Trends */}
          <ChartContainer title="Fee Collection Trends" loading={loading} delay={1.0}>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsLineChart data={feeCollectionRates}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount Collected']} />
                <Line
                  type="monotone"
                  dataKey="totalCollected"
                  stroke={COLORS.primary}
                  strokeWidth={3}
                  dot={{ fill: COLORS.primary, strokeWidth: 2, r: 6 }}
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Additional Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Admission Trends */}
          <ChartContainer title="Admission Trends" loading={loading} delay={1.1}>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart data={admissionTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill={COLORS.secondary} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* Payment Methods */}
          <ChartContainer title="Payment Methods Analysis" loading={loading} delay={1.2}>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart
                data={paymentMethodsAnalysis}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="totalAmount"
              >
                {paymentMethodsAnalysis.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                ))}
                <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Outstanding Payments Table */}
        <ChartContainer title="Outstanding Payments" loading={loading} delay={1.3}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-700 text-sm">Student</th>
                  <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-700 text-sm">Class</th>
                  <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-700 text-sm">Parent</th>
                  <th className="text-right py-3 px-2 sm:px-4 font-medium text-gray-700 text-sm">Outstanding</th>
                  <th className="text-right py-3 px-2 sm:px-4 font-medium text-gray-700 text-sm">Late Fee</th>
                  <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-700 text-sm">Days Overdue</th>
                </tr>
              </thead>
              <tbody>
                {outstandingPayments.slice(0, 10).map((payment, index) => (
                  <motion.tr
                    key={payment._id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td className="py-3 px-2 sm:px-4">
                      <div className="font-medium text-gray-900 text-sm">{payment.studentName}</div>
                      <div className="text-xs text-gray-500">{payment.studentSection}</div>
                    </td>
                    <td className="py-3 px-2 sm:px-4 text-gray-600 text-sm">{payment.studentClass}</td>
                    <td className="py-3 px-2 sm:px-4">
                      <div className="text-gray-900 text-sm">{payment.parentName}</div>
                      <div className="text-xs text-gray-500">{payment.parentEmail}</div>
                    </td>
                    <td className="py-3 px-2 sm:px-4 text-right font-medium text-red-600 text-sm">
                      ₹{payment.totalOutstanding.toLocaleString()}
                    </td>
                    <td className="py-3 px-2 sm:px-4 text-right text-orange-600 text-sm">
                      ₹{payment.lateFee?.toLocaleString() || 0}
                    </td>
                    <td className="py-3 px-2 sm:px-4 text-gray-600 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        payment.overdueDays > 30 ? 'bg-red-100 text-red-800' :
                        payment.overdueDays > 7 ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payment.overdueDays || 0} days
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartContainer>

        {/* Recent Events */}
        <ChartContainer title="Recent Events & Activities" loading={loading} delay={1.4}>
          <div className="space-y-3 sm:space-y-4">
            {upcomingEvents.slice(0, 5).map((event, index) => (
              <motion.div
                key={event._id}
                className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 5 }}
              >
                <motion.div 
                  className="p-2 bg-blue-100 rounded-lg flex-shrink-0"
                  whileHover={{ rotate: 5 }}
                >
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">{event.title}</h4>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">{event.location} • {new Date(event.date).toLocaleDateString()}</p>
                </div>
                <div className="text-xs sm:text-sm text-gray-500 flex-shrink-0">
                  {event.category}
                </div>
              </motion.div>
            ))}
          </div>
        </ChartContainer>
      </motion.div>
    </div>
  );
};

export default DashboardContent;