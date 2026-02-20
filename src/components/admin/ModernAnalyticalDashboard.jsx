import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  GraduationCap, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Clock,
  AlertCircle,
  CheckCircle,
  Eye,
  Download,
  RefreshCw,
  Play,
  Pause,
  Grid,
  List,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Zap,
  BarChart3,
  PieChart,
  LineChart,
  Calendar,
  UserCheck,
  CreditCard,
  Banknote,
  Receipt,
  AlertTriangle,
  Percent,
  Award,
  Star,
  Settings,
  Bell,
  Search,
  Filter,
  Maximize2,
  Minimize2,
  RotateCcw,
  School,
  BookOpen,
  FileText,
  MessageSquare,
  Smartphone,
  Monitor,
  Tablet,
  Wifi,
  Battery,
  Signal
} from 'lucide-react';
import { useEnhancedDashboardStore } from '../stores/useEnhancedDashboardStore';
import { useTranslation } from 'react-i18next';
import {
  GradientLineChart,
  RoundedBarChart,
  StackedBarChart,
  DonutChart,
  RadialProgressChart,
  DualComboChart,
  TopPerformersChart,
  PolarAreaChart
} from './charts/ModernCharts';

// Modern Color Palette
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

// Modern Metric Card Component
const ModernMetricCard = ({ title, value, change, icon: Icon, color, trend, subtitle, loading = false, className = "", delay = 0, isRealTime = false, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  if (loading) {
    return (
      <motion.div
        className={`bg-white rounded-2xl shadow-lg p-6 border border-gray-100 ${className}`}
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
      className={`bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer group relative overflow-hidden ${className}`}
      whileHover={{ scale: 1.02, y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      onClick={onClick}
    >
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br from-${color}-50 to-${color}-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
      
      {/* Real-time indicator */}
      {isRealTime && (
        <motion.div
          className="absolute top-3 right-3 w-2 h-2 bg-green-500 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      
      <div className="relative z-10">
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
      </div>
    </motion.div>
  );
};

// Modern Chart Container Component
const ModernChartContainer = ({ title, children, className = "", loading = false, actions = true, delay = 0, isRealTime = false, description }) => {
  if (loading) {
    return (
      <motion.div
        className={`bg-white rounded-2xl shadow-lg p-6 border border-gray-100 ${className}`}
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
      className={`bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg">
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {description && (
              <p className="text-sm text-gray-500">{description}</p>
            )}
          </div>
          {isRealTime && (
            <motion.div
              className="w-2 h-2 bg-green-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </div>
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

// Modern Alerts Panel Component
const ModernAlertsPanel = ({ alerts, loading, className = "" }) => {
  if (loading) {
    return (
      <motion.div
        className={`bg-white rounded-2xl shadow-lg p-6 border border-gray-100 ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-50 border-red-200 text-red-800';
      case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'medium': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'low': return <Bell className="w-5 h-5 text-blue-600" />;
      default: return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <motion.div
      className={`bg-white rounded-2xl shadow-lg p-6 border border-gray-100 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-red-100 to-red-200 rounded-lg">
            <Bell className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Live Alerts</h3>
            <p className="text-sm text-gray-500">Real-time notifications</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <motion.div
            className="w-2 h-2 bg-red-500 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-sm text-gray-500">Live</span>
        </div>
      </div>
      
      <div className="space-y-3">
        {alerts.length > 0 ? alerts.slice(0, 5).map((alert, index) => (
          <motion.div
            key={alert.timestamp}
            className={`p-4 rounded-lg border-l-4 ${getSeverityColor(alert.severity)}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ x: 5 }}
          >
            <div className="flex items-start space-x-3">
              <motion.div
                className="flex-shrink-0 mt-0.5"
                whileHover={{ rotate: 5 }}
              >
                {getSeverityIcon(alert.severity)}
              </motion.div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm">{alert.title}</h4>
                <p className="text-xs mt-1 opacity-80">{alert.message}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs opacity-60">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    alert.severity === 'high' ? 'bg-red-100 text-red-700' :
                    alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {alert.severity.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )) : (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">All systems running smoothly</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Main Modern Dashboard Component
const ModernAnalyticalDashboard = () => {
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedMetric, setSelectedMetric] = useState(null);
  
  const {
    loading,
    error,
    dashboardData,
    realTimeData,
    incomeExpenseData,
    attendanceInspectionData,
    annualFeeSummary,
    teacherPerformanceData,
    realTimeAlerts,
    performanceTrends,
    autoRefresh,
    lastUpdated,
    fetchAllDashboardData,
    fetchRealTimeUpdates,
    startAutoRefresh,
    stopAutoRefresh,
    toggleAutoRefresh,
    clearError,
    getComputedKPIs,
    getChartData,
    getRecentActivities,
    getPerformanceMetrics,
    getAlertsData
  } = useEnhancedDashboardStore();

  // Load data on component mount
  useEffect(() => {
    console.log("Loading modern analytical dashboard data...");
    fetchAllDashboardData();
  }, []);

  // Start auto-refresh
  useEffect(() => {
    startAutoRefresh();
    return () => stopAutoRefresh();
  }, []);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllDashboardData();
    setRefreshing(false);
  };

  // Get computed data
  const kpis = getComputedKPIs();
  const chartData = getChartData();
  const recentActivities = getRecentActivities();
  const performanceMetrics = getPerformanceMetrics();
  const alertsData = getAlertsData();

  // Sample data for demonstration
  const sampleData = {
    studentGrowth: [
      { month: 'Jan', students: 120, teachers: 15 },
      { month: 'Feb', students: 135, teachers: 16 },
      { month: 'Mar', students: 142, teachers: 17 },
      { month: 'Apr', students: 158, teachers: 18 },
      { month: 'May', students: 165, teachers: 19 },
      { month: 'Jun', students: 172, teachers: 20 }
    ],
    attendanceBreakdown: [
      { name: 'Grade 10', attendance: 95, students: 45 },
      { name: 'Grade 11', attendance: 88, students: 38 },
      { name: 'Grade 12', attendance: 92, students: 42 },
      { name: 'Grade 9', attendance: 89, students: 35 }
    ],
    feeCollection: [
      { month: 'Jan', paid: 120000, partial: 30000, unpaid: 20000 },
      { month: 'Feb', paid: 135000, partial: 25000, unpaid: 15000 },
      { month: 'Mar', paid: 142000, partial: 20000, unpaid: 10000 },
      { month: 'Apr', paid: 158000, partial: 15000, unpaid: 5000 },
      { month: 'May', paid: 165000, partial: 10000, unpaid: 3000 },
      { month: 'Jun', paid: 172000, partial: 5000, unpaid: 1000 }
    ],
    collectionSummary: [
      { name: 'Paid', value: 75, color: COLORS.success },
      { name: 'Partial', value: 15, color: COLORS.warning },
      { name: 'Unpaid', value: 10, color: COLORS.danger }
    ],
    performanceRadial: [
      { name: 'Collection Rate', value: 85, fill: COLORS.success },
      { name: 'Attendance Rate', value: 92, fill: COLORS.primary },
      { name: 'Teacher Performance', value: 88, fill: COLORS.accent }
    ],
    incomeExpense: [
      { month: 'Jan', income: 120000, expense: 80000, profit: 40000 },
      { month: 'Feb', income: 135000, expense: 85000, profit: 50000 },
      { month: 'Mar', income: 142000, expense: 90000, profit: 52000 },
      { month: 'Apr', income: 158000, expense: 95000, profit: 63000 },
      { month: 'May', income: 165000, expense: 100000, profit: 65000 },
      { month: 'Jun', income: 172000, expense: 105000, profit: 67000 }
    ],
    topPerformers: [
      { name: 'Sarah Johnson', score: 98, avatar: 'SJ', class: 'Grade 10A' },
      { name: 'Michael Chen', score: 95, avatar: 'MC', class: 'Grade 11B' },
      { name: 'Emily Davis', score: 92, avatar: 'ED', class: 'Grade 12A' },
      { name: 'David Wilson', score: 89, avatar: 'DW', class: 'Grade 10B' },
      { name: 'Lisa Brown', score: 87, avatar: 'LB', class: 'Grade 11A' }
    ],
    userDistribution: [
      { name: 'Active Students', value: 450, fill: COLORS.success },
      { name: 'Inactive Students', value: 50, fill: COLORS.danger },
      { name: 'Active Teachers', value: 45, fill: COLORS.primary },
      { name: 'Inactive Teachers', value: 5, fill: COLORS.warning }
    ]
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
            onClick={() => { clearError(); fetchAllDashboardData(); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 p-4 sm:p-6">
      {/* Header */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <motion.h1 
              className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              Modern Analytical Dashboard
            </motion.h1>
            <motion.p 
              className="text-gray-600 text-base sm:text-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              Advanced insights with modern data visualization
            </motion.p>
            {lastUpdated && (
              <motion.p 
                className="text-xs text-gray-500 mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Last updated: {lastUpdated.toLocaleTimeString()}
              </motion.p>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <motion.button
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200 ${
                autoRefresh ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}
              onClick={toggleAutoRefresh}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {autoRefresh ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>Auto Refresh</span>
            </motion.button>
            <motion.button
              className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200"
              onClick={handleRefresh}
              disabled={refreshing}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </motion.button>
            <motion.button
              className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200"
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
        className="space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {/* Key Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          <ModernMetricCard
            title="Total Students"
            value={kpis.totalStudents || 500}
            subtitle="Enrolled"
            icon={Users}
            color="blue"
            loading={loading}
            trend="up"
            change="+12%"
            delay={0.1}
            isRealTime={true}
            onClick={() => setSelectedMetric('students')}
          />
          <ModernMetricCard
            title="Active Teachers"
            value={kpis.totalTeachers || 45}
            subtitle="Staff Members"
            icon={GraduationCap}
            color="green"
            loading={loading}
            trend="up"
            change="+5%"
            delay={0.2}
            isRealTime={true}
            onClick={() => setSelectedMetric('teachers')}
          />
          <ModernMetricCard
            title="Fee Collection"
            value={kpis.totalFeeCollected || 1500000}
            prefix="₹"
            subtitle="This Year"
            icon={DollarSign}
            color="purple"
            loading={loading}
            trend="up"
            change="+18%"
            delay={0.3}
            isRealTime={true}
            onClick={() => setSelectedMetric('fees')}
          />
          <ModernMetricCard
            title="Collection Rate"
            value={kpis.collectionEfficiency || 85}
            suffix="%"
            subtitle="Success Rate"
            icon={Percent}
            color="cyan"
            loading={loading}
            trend="up"
            change="+3%"
            delay={0.4}
            isRealTime={true}
            onClick={() => setSelectedMetric('collection')}
          />
        </div>

        {/* Alerts Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ModernAlertsPanel 
            alerts={alertsData.alerts} 
            loading={loading} 
            className="lg:col-span-1"
          />
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <ModernMetricCard
              title="High Priority Alerts"
              value={alertsData.summary.highPriority || 2}
              subtitle="Requires Attention"
              icon={AlertTriangle}
              color="red"
              loading={loading}
              delay={0.9}
              isRealTime={true}
            />
            <ModernMetricCard
              title="System Health"
              value={alertsData.summary.totalAlerts === 0 ? 100 : Math.max(0, 100 - (alertsData.summary.highPriority * 20))}
              suffix="%"
              subtitle="Overall Status"
              icon={Activity}
              color="green"
              loading={loading}
              delay={1.0}
              isRealTime={true}
            />
          </div>
        </div>

        {/* Modern Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 📈 Gradient Line Chart - Student Growth */}
          <ModernChartContainer 
            title="Student & Teacher Growth" 
            description="Growth trends over 6 months"
            loading={loading} 
            delay={1.1} 
            isRealTime={true}
          >
            <GradientLineChart data={sampleData.studentGrowth} loading={loading} />
          </ModernChartContainer>

          {/* 📊 Rounded Bar Chart - Attendance */}
          <ModernChartContainer 
            title="Class-wise Attendance" 
            description="Attendance rates by grade"
            loading={loading} 
            delay={1.2} 
            isRealTime={true}
          >
            <RoundedBarChart data={sampleData.attendanceBreakdown} loading={loading} />
          </ModernChartContainer>
        </div>

        {/* Additional Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 📊 Stacked Bar Chart - Fee Collection */}
          <ModernChartContainer 
            title="Fee Collection Analysis" 
            description="Paid, partial, and unpaid fees by month"
            loading={loading} 
            delay={1.3} 
            isRealTime={true}
          >
            <StackedBarChart data={sampleData.feeCollection} loading={loading} />
          </ModernChartContainer>

          {/* 🟢 Donut Chart - Collection Summary */}
          <ModernChartContainer 
            title="Collection Summary" 
            description="Overall fee collection status"
            loading={loading} 
            delay={1.4} 
            isRealTime={true}
          >
            <DonutChart 
              data={sampleData.collectionSummary} 
              loading={loading}
              centerValue="85%"
              centerLabel="Collection Rate"
            />
          </ModernChartContainer>
        </div>

        {/* Performance Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 📉 Radial Progress Chart */}
          <ModernChartContainer 
            title="Performance Metrics" 
            description="Key performance indicators"
            loading={loading} 
            delay={1.5} 
            isRealTime={true}
          >
            <RadialProgressChart data={sampleData.performanceRadial} loading={loading} />
          </ModernChartContainer>

          {/* 💰 Dual Combo Chart - Income vs Expense */}
          <ModernChartContainer 
            title="Income vs Expense Analysis" 
            description="Financial performance with profit trends"
            loading={loading} 
            delay={1.6} 
            isRealTime={true}
          >
            <DualComboChart data={sampleData.incomeExpense} loading={loading} />
          </ModernChartContainer>
        </div>

        {/* Top Performers and User Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 🧾 Top Performers Chart */}
          <ModernChartContainer 
            title="Top Performing Students" 
            description="Highest scoring students by grade"
            loading={loading} 
            delay={1.7} 
            isRealTime={true}
          >
            <TopPerformersChart data={sampleData.topPerformers} loading={loading} />
          </ModernChartContainer>

          {/* 🔵 Polar Area Chart - User Distribution */}
          <ModernChartContainer 
            title="User Distribution" 
            description="Active vs inactive users breakdown"
            loading={loading} 
            delay={1.8} 
            isRealTime={true}
          >
            <PolarAreaChart data={sampleData.userDistribution} loading={loading} />
          </ModernChartContainer>
        </div>

        {/* Recent Activities */}
        <ModernChartContainer title="Recent Activities" loading={loading} delay={1.9}>
          <div className="space-y-4">
            {recentActivities.events.slice(0, 5).map((event, index) => (
              <motion.div
                key={event._id}
                className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 5 }}
              >
                <motion.div 
                  className="p-2 bg-blue-100 rounded-lg flex-shrink-0"
                  whileHover={{ rotate: 5 }}
                >
                  <Calendar className="w-5 h-5 text-blue-600" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">{event.title}</h4>
                  <p className="text-sm text-gray-600 truncate">{event.location} • {new Date(event.date).toLocaleDateString()}</p>
                </div>
                <div className="text-sm text-gray-500 flex-shrink-0">
                  {event.category}
                </div>
              </motion.div>
            ))}
          </div>
        </ModernChartContainer>
      </motion.div>
    </div>
  );
};

export default ModernAnalyticalDashboard;
