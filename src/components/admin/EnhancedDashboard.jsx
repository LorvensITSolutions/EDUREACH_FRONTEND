import React, { useEffect, useState, useRef, createContext, useContext } from 'react';
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
  Building2,
  Receipt,
  AlertTriangle,
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
  Play,
  Pause,
  RotateCcw,
  Zap as ZapIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Users as UsersIcon,
  GraduationCap as GraduationCapIcon,
  DollarSign as DollarSignIcon,
  Calendar as CalendarIconAlt,
  Activity as ActivityIcon,
  AlertCircle as AlertCircleIcon,
  CheckCircle as CheckCircleIcon,
  Clock as ClockIcon,
  BarChart3 as BarChart3Icon,
  PieChart as PieChartIconAlt,
  LineChart as LineChartIconAlt
} from 'lucide-react';
import { useEnhancedDashboardStore } from '../stores/useEnhancedDashboardStore';
import { useTranslation } from 'react-i18next';
import { getCurrentAcademicYear, getAcademicYearOptions } from '../../utils/academicYear';

// Mock Redux to prevent Recharts errors
// This must be done before any Recharts imports

// Create a comprehensive Redux mock that Recharts expects
const mockReduxState = {
  recharts: {
    activeIndex: 0,
    tooltip: {
      activeIndex: 0,
      activePayload: [],
      activeLabel: ''
    }
  }
};

// Mock useAppSelector with proper destructuring support
const mockUseAppSelector = (selector) => {
  console.log('Mock useAppSelector called with:', selector);

  if (typeof selector === 'function') {
    try {
      const result = selector(mockReduxState);
      console.log('Mock selector result:', result);
      return result;
    } catch (error) {
      console.warn('Mock selector error:', error);
      return { activeIndex: 0 };
    }
  }

  // If no selector provided, return the expected structure
  return { activeIndex: 0 };
};

const mockUseAppDispatch = () => () => { };

// Make Redux mocks available globally BEFORE Recharts loads
if (typeof window !== 'undefined') {
  console.log('Setting up Redux mocks on window');

  // Override useAppSelector globally
  window.useAppSelector = mockUseAppSelector;

  // Also create a mock store
  window.__REDUX_STORE__ = {
    getState: () => mockReduxState,
    subscribe: () => () => { },
    dispatch: () => { },
    replaceReducer: () => { }
  };

  // Mock React-Redux hooks as well
  window.useSelector = mockUseAppSelector;
  window.useDispatch = mockUseAppDispatch;

  // Try to patch the module system
  if (typeof global !== 'undefined') {
    global.useAppSelector = mockUseAppSelector;
    global.useSelector = mockUseAppSelector;
    global.useDispatch = mockUseAppDispatch;
  }

  // Also try to patch at the top level
  if (typeof self !== 'undefined') {
    self.useAppSelector = mockUseAppSelector;
    self.useSelector = mockUseAppSelector;
    self.useDispatch = mockUseAppDispatch;
  }

  console.log('Redux mocks set up successfully');
}
import {
  LineChart as RechartsLineChart,
  BarChart as RechartsBarChart,
  PieChart as RechartsPieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
  Area,
  AreaChart,
  Bar,
  Line,
  RadialBarChart,
  RadialBar,
  ScatterChart,
  Scatter,
  LabelList
} from 'recharts';

// Enhanced color palette with modern gradients
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
  // Modern gradient colors
  gradient: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    success: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    warning: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    info: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    purple: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    dark: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)'
  }
};

const chartColors = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#6366F1', '#14B8A6', '#06B6D4', '#84CC16'
];

const gradientChartColors = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
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

// Enhanced Metric Card Component with Modern Design
const MetricCard = ({ title, value, change, icon: Icon, color, trend, subtitle, loading = false, className = "", delay = 0, isRealTime = false, percentage = null }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Color mapping for better gradients
  const colorMap = {
    blue: { bg: 'from-blue-50 to-blue-100', icon: 'text-blue-600', hover: 'from-blue-100 to-blue-200', gradient: COLORS.gradient.primary },
    green: { bg: 'from-green-50 to-green-100', icon: 'text-green-600', hover: 'from-green-100 to-green-200', gradient: COLORS.gradient.success },
    purple: { bg: 'from-purple-50 to-purple-100', icon: 'text-purple-600', hover: 'from-purple-100 to-purple-200', gradient: COLORS.gradient.purple },
    orange: { bg: 'from-orange-50 to-orange-100', icon: 'text-orange-600', hover: 'from-orange-100 to-orange-200', gradient: COLORS.gradient.warning },
    emerald: { bg: 'from-emerald-50 to-emerald-100', icon: 'text-emerald-600', hover: 'from-emerald-100 to-emerald-200', gradient: COLORS.gradient.success },
    indigo: { bg: 'from-indigo-50 to-indigo-100', icon: 'text-indigo-600', hover: 'from-indigo-100 to-indigo-200', gradient: COLORS.gradient.info },
    pink: { bg: 'from-pink-50 to-pink-100', icon: 'text-pink-600', hover: 'from-pink-100 to-pink-200', gradient: COLORS.gradient.warning }
  };

  const colorConfig = colorMap[color] || colorMap.blue;

  if (loading) {
    return (
      <motion.div
        className={`bg-white rounded-3xl shadow-xl p-6 border border-gray-100 backdrop-blur-sm ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
      >
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded-lg w-3/4 mb-3"></div>
          <div className="h-10 bg-gray-200 rounded-lg w-1/2 mb-3"></div>
          <div className="h-3 bg-gray-200 rounded-lg w-1/3"></div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl md:rounded-3xl shadow-xl p-3 sm:p-4 md:p-6 border border-gray-100/50 hover:shadow-2xl transition-all duration-500 cursor-pointer group relative overflow-hidden ${className}`}
      whileHover={{ scale: 1.02, y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: "easeOut" }}
      style={{
        background: isHovered ? 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)' : 'rgba(255,255,255,0.8)'
      }}
    >
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
        style={{ background: colorConfig.gradient }}
        initial={{ scale: 0 }}
        animate={{ scale: isHovered ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      />

      {/* Real-time indicator */}
      {isRealTime && (
        <motion.div
          className="absolute top-2 right-2 sm:top-3 sm:right-3 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full shadow-lg"
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6">
          <motion.div
            className={`p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br ${colorConfig.bg} group-hover:${colorConfig.hover} transition-all duration-300 shadow-lg`}
            whileHover={{ rotate: 8, scale: 1.1 }}
            transition={{ duration: 0.3 }}
          >
            <Icon className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 ${colorConfig.icon} group-hover:scale-110 transition-transform duration-300`} />
          </motion.div>
          {trend && (
            <motion.div
              className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-md ${trend === 'up' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
                }`}
              animate={{ scale: isHovered ? 1.1 : 1 }}
              transition={{ duration: 0.2 }}
            >
              {trend === 'up' ? <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" /> : <ArrowDownRight className="w-3 h-3 sm:w-4 sm:h-4" />}
              <span className="hidden sm:inline">{change}</span>
            </motion.div>
          )}
        </div>

        <div className="space-y-1.5 sm:space-y-2 md:space-y-3">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">{title}</h3>
          <div className="flex items-baseline space-x-2 sm:space-x-3 flex-wrap">
            <AnimatedCounter value={value} className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent" />
            {percentage !== null && (
              <span className="text-sm sm:text-base md:text-lg font-semibold text-gray-500">({percentage}%)</span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-gray-500 font-medium line-clamp-1">{subtitle}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Enhanced Chart Container Component with Modern Design
const ChartContainer = ({ title, children, className = "", loading = false, actions = true, delay = 0, isRealTime = false }) => {
  if (loading) {
    return (
      <motion.div
        className={`bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-gray-100/50 ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
      >
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded-lg w-1/3 mb-6"></div>
          <div className="h-80 bg-gray-200 rounded-2xl"></div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl md:rounded-3xl shadow-xl p-3 sm:p-4 md:p-6 border border-gray-100/50 hover:shadow-2xl transition-all duration-500 group relative overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ delay, duration: 0.6, ease: "easeOut" }}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-blue-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            <motion.div
              className="w-1.5 sm:w-2 h-6 sm:h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full flex-shrink-0"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: delay + 0.2, duration: 0.5 }}
            />
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 truncate">{title}</h3>
      
          </div>
      
        </div>
        <div className="relative overflow-x-auto">
          {children}
        </div>
      </div>
    </motion.div>
  );
};

// Enhanced Alerts Panel Component - Removed

// Teacher Performance Chart Component
const TeacherPerformanceChart = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const chartData = data?.teacherPerformanceMetrics || [];

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="teacherName" />
          <YAxis />
          {/* <Tooltip active={true} formatter={(value, name) => [`${value.toFixed(1)}%`, name === 'attendanceRate' ? 'Attendance Rate' : 'Performance Score']} /> */}
          <Legend />
          <Bar dataKey="attendanceRate" fill={COLORS.success} name="Attendance Rate" />
          <Bar dataKey="performanceScore" fill={COLORS.primary} name="Performance Score" />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Performance Trends Chart Component
const PerformanceTrendsChart = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const chartData = data?.attendanceTrends || [];

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="monthName" />
          <YAxis />
          {/* <Tooltip active={true} formatter={(value, name) => [`${value.toFixed(1)}%`, name === 'attendanceRate' ? 'Attendance Rate' : 'Punctuality Rate']} /> */}
          <Legend />
          <Line
            type="monotone"
            dataKey="attendanceRate"
            stroke={COLORS.success}
            strokeWidth={3}
            dot={{ fill: COLORS.success, strokeWidth: 2, r: 6 }}
            name="Attendance Rate"
          />
          <Line
            type="monotone"
            dataKey="punctualityRate"
            stroke={COLORS.warning}
            strokeWidth={3}
            dot={{ fill: COLORS.warning, strokeWidth: 2, r: 6 }}
            name="Punctuality Rate"
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Enhanced Students by Class Chart Component with Modern Design
const StudentsByClassChart = ({ data, loading }) => {


  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-gray-500 text-sm">Loading student data...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 text-gray-500">
        <div className="text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-semibold">No students available</p>
          <p className="text-sm mt-2">Student data will appear here once students are enrolled</p>
        </div>
      </div>
    );
  }

  const chartData = data;
  console.log("StudentsByClassChart - Final chart data:", chartData);

  // Calculate total for percentage display
  const totalStudents = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-2xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700">Total Students</p>
              <p className="text-2xl font-bold text-blue-900">{totalStudents.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-2xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-green-700">Active Classes</p>
              <p className="text-2xl font-bold text-green-900">{chartData.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Pie Chart */}
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              stroke="#fff"
              strokeWidth={2}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={chartColors[index % chartColors.length]}
                  stroke="#fff"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            {/* <Tooltip 
              active={true}
              formatter={(value, name, props) => {
                const percentage = ((value / totalStudents) * 100).toFixed(1);
                return [`${value} students (${percentage}%)`, 'Count'];
              }}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                fontSize: '14px',
                fontWeight: '500'
              }}
            /> */}
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>

      {/* Class Details */}
      <div className="space-y-3">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Class Breakdown</h4>
        <div className="grid grid-cols-1 gap-3">
          {chartData.map((item, index) => {
            const percentage = ((item.value / totalStudents) * 100).toFixed(1);
            return (
              <motion.div
                key={index}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl hover:shadow-md transition-all duration-200"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 5 }}
              >
                <div className="flex items-center space-x-4">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: chartColors[index % chartColors.length] }}
                  />
                  <span className="text-sm font-semibold text-gray-800">{item.name}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">{percentage}%</span>
                  <span className="text-lg font-bold text-gray-900">{item.value}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Enhanced Payment Methods Pie Chart Component
const PaymentMethodsChart = ({ data, loading }) => {
  console.log("PaymentMethodsChart - Received data:", data);
  console.log("PaymentMethodsChart - Loading:", loading);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-gray-500 text-sm">Loading payment methods data...</p>
        </div>
      </div>
    );
  }

  // Enhanced color scheme with gradients
  const COLORS = {
    online: '#10B981',      // Green
    cash: '#F59E0B',        // Orange
    cheque: '#3B82F6',      // Blue
    bank_transfer: '#8B5CF6', // Purple
    card: '#EC4899',        // Pink
    upi: '#06B6D4'          // Cyan
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      online: 'Online Payment',
      cash: 'Cash',
      cheque: 'Cheque',
      bank_transfer: 'Bank Transfer',
      card: 'Card Payment',
      upi: 'UPI Payment'
    };
    return labels[method] || method;
  };

  const getPaymentMethodIcon = (method) => {
    const icons = {
      online: CreditCard,
      cash: Banknote,
      cheque: FileText,
      bank_transfer: Building2,
      card: CreditCard,
      upi: Smartphone
    };
    return icons[method] || CreditCard;
  };

  // Check if there's real payment data
  if (!data || !data.paymentMethods || data.paymentMethods.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 text-gray-500">
        <div className="text-center">
          <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-semibold">No payment methods data available</p>
          <p className="text-sm mt-2">Payment data will appear here once students make payments</p>
        </div>
      </div>
    );
  }

  const chartData = data.paymentMethods;
  const totalPayments = chartData.reduce((sum, item) => sum + item.count, 0);

  console.log("PaymentMethodsChart - Final chart data:", chartData);
  console.log("PaymentMethodsChart - Total payments:", totalPayments);

  return (
    <div className="space-y-6">
      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {chartData.map((item, index) => {
          const IconComponent = getPaymentMethodIcon(item.method);
          const percentage = totalPayments > 0 ? Math.round((item.count / totalPayments) * 100) : 0;

          return (
            <motion.div
              key={index}
              className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center space-x-4">
                <div
                  className="p-4 rounded-2xl shadow-md"
                  style={{ backgroundColor: `${COLORS[item.method]}20` }}
                >
                  <IconComponent
                    className="w-8 h-8"
                    style={{ color: COLORS[item.method] }}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                    {getPaymentMethodLabel(item.method)}
                  </p>
                  <p className="text-3xl font-bold mt-1" style={{ color: COLORS[item.method] }}>
                    {item.count}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: COLORS[item.method]
                        }}
                      ></div>
                    </div>
                    <span className="text-xs font-semibold text-gray-500">
                      {percentage}%
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Custom CSS Donut Chart */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 rounded-3xl">
        <div className="w-full h-96 flex items-center justify-center">
          <div className="relative w-80 h-80">
            {/* Custom SVG Donut Chart */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
              <defs>
                <linearGradient id="onlineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="cashGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#D97706" />
                </linearGradient>
                <linearGradient id="chequeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#2563EB" />
                </linearGradient>
                <linearGradient id="bankGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#7C3AED" />
                </linearGradient>
              </defs>

              {/* Background Circle */}
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="20"
              />

              {/* Chart Segments */}
              {chartData.map((item, index) => {
                const percentage = (item.count / totalPayments) * 100;
                const circumference = 2 * Math.PI * 80;
                const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
                const strokeDashoffset = index === 0 ? 0 :
                  chartData.slice(0, index).reduce((sum, prev) => sum + (prev.count / totalPayments) * circumference, 0);

                return (
                  <motion.circle
                    key={index}
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke={`url(#${item.method}Gradient)`}
                    strokeWidth="20"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={-strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                    initial={{ strokeDasharray: `0 ${circumference}` }}
                    animate={{ strokeDasharray: strokeDasharray }}
                    transition={{ delay: index * 0.2, duration: 1 }}
                    style={{
                      strokeDasharray: strokeDasharray,
                      strokeDashoffset: -strokeDashoffset
                    }}
                  />
                );
              })}
            </svg>

            {/* Center Content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-800 mb-1">
                  {totalPayments}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  Total Payments
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Legend */}
        <div className="flex flex-wrap justify-center gap-6 mt-8">
          {chartData.map((item, index) => {
            const percentage = Math.round((item.count / totalPayments) * 100);
            return (
              <div key={index} className="flex items-center space-x-3">
                <div
                  className="w-4 h-4 rounded-full shadow-sm"
                  style={{ backgroundColor: COLORS[item.method] }}
                />
                <div className="text-sm">
                  <span className="font-semibold text-gray-800">
                    {getPaymentMethodLabel(item.method)}
                  </span>
                  <div className="text-xs text-gray-600">
                    {item.count} payments ({percentage}%)
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Enhanced Breakdown Section */}
      <div className="space-y-4">
        <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <BarChart3 className="w-6 h-6 mr-2 text-blue-600" />
          Payment Methods Breakdown
        </h4>
        <div className="space-y-3">
          {chartData.map((item, index) => {
            const percentage = totalPayments > 0 ? Math.round((item.count / totalPayments) * 100) : 0;
            const IconComponent = getPaymentMethodIcon(item.method);

            return (
              <motion.div
                key={index}
                className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 5 }}
              >
                <div className="flex items-center space-x-4">
                  <div
                    className="p-3 rounded-xl shadow-sm"
                    style={{ backgroundColor: `${COLORS[item.method]}20` }}
                  >
                    <IconComponent
                      className="w-6 h-6"
                      style={{ color: COLORS[item.method] }}
                    />
                  </div>
                  <div>
                    <span className="text-base font-semibold text-gray-800">
                      {getPaymentMethodLabel(item.method)}
                    </span>
                    <div className="w-40 bg-gray-200 rounded-full h-3 mt-2">
                      <div
                        className="h-3 rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: COLORS[item.method]
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold" style={{ color: COLORS[item.method] }}>
                    {item.count}
                  </span>
                  <p className="text-sm text-gray-500 font-semibold">{percentage}%</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Enhanced Income vs Expense Chart Component with Modern Design
const FeeCollectionStatusChart = ({ data, loading }) => {
  console.log("FeeCollectionStatusChart - Received data:", data);
  console.log("FeeCollectionStatusChart - Loading:", loading);

  // State for filters
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);
  
  // State to track applied filters (what's actually being used for filtering)
  const [appliedClass, setAppliedClass] = useState('');
  const [appliedSection, setAppliedSection] = useState('');
  
  // Use refs to track applied filters (persists across re-renders)
  const appliedClassRef = useRef('');
  const appliedSectionRef = useRef('');
  
  // State for Class-Section Fee Breakdown table
  const [feeBreakdownSearch, setFeeBreakdownSearch] = useState('');
  const [feeBreakdownSortBy, setFeeBreakdownSortBy] = useState('class'); // 'class', 'section', 'students', 'fee', 'total'
  const [feeBreakdownSortOrder, setFeeBreakdownSortOrder] = useState('asc'); // 'asc' or 'desc'
  const [feeBreakdownGroupBy, setFeeBreakdownGroupBy] = useState(false); // Group by class
  const [feeBreakdownCurrentPage, setFeeBreakdownCurrentPage] = useState(1);
  const [feeBreakdownItemsPerPage, setFeeBreakdownItemsPerPage] = useState(10);
  const [feeBreakdownCollapsed, setFeeBreakdownCollapsed] = useState(false);
  
  // State for Payment Summary by Class-Section table
  const [paymentSummarySearch, setPaymentSummarySearch] = useState('');
  const [paymentSummarySortBy, setPaymentSummarySortBy] = useState('class'); // 'class', 'section', 'totalPaid', 'paymentCount', 'days'
  const [paymentSummarySortOrder, setPaymentSummarySortOrder] = useState('desc'); // 'asc' or 'desc'
  const [paymentSummaryGroupBy, setPaymentSummaryGroupBy] = useState(false); // Group by class
  const [paymentSummaryCurrentPage, setPaymentSummaryCurrentPage] = useState(1);
  const [paymentSummaryItemsPerPage, setPaymentSummaryItemsPerPage] = useState(10);
  const [paymentSummaryCollapsed, setPaymentSummaryCollapsed] = useState(false);

  // Get store methods
  const { refetchFeeCollectionWithFilters } = useEnhancedDashboardStore();

  // Debounced filter application
  const applyFilters = async (e) => {
    // Prevent any form submission or page refresh
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Store current filter values to ensure they persist
    const currentClass = selectedClass;
    const currentSection = selectedSection;
    
    console.log("Applying filters - Class:", currentClass, "Section:", currentSection);
    
    setIsApplyingFilters(true);
    try {
      const filters = {
        class: currentClass || undefined,
        section: currentSection || undefined
      };
      console.log("Sending filters to API:", filters);
      // Only update fee collection data, not the entire dashboard
      await refetchFeeCollectionWithFilters(filters);
      
      // Store applied filters in refs and state
      appliedClassRef.current = currentClass;
      appliedSectionRef.current = currentSection;
      
      // Update both the selected state (for dropdowns) and applied state (for display)
      setSelectedClass(currentClass);
      setSelectedSection(currentSection);
      setAppliedClass(currentClass);
      setAppliedSection(currentSection);
      
      console.log("Filters applied and state updated - Class:", currentClass, "Section:", currentSection);
    } catch (error) {
      console.error("Error applying filters:", error);
    } finally {
      setIsApplyingFilters(false);
    }
  };

  // Debug: Log state changes to track if state is being reset
  useEffect(() => {
    console.log("Filter state updated - Class:", selectedClass, "Section:", selectedSection);
  }, [selectedClass, selectedSection]);

  // Optional: Auto-apply filters with debounce (uncomment if you prefer automatic filtering)
  // useEffect(() => {
  //   const timeoutId = setTimeout(() => {
  //     if (selectedClass || selectedSection) {
  //       applyFilters();
  //     }
  //   }, 1000); // 1 second debounce
  //   
  //   return () => clearTimeout(timeoutId);
  // }, [selectedClass, selectedSection]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-gray-500 text-sm">Loading fee collection data...</p>
        </div>
      </div>
    );
  }

  if (!data || !data.chartData || data.chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 text-gray-500">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">💰</span>
          </div>
          <p className="text-lg font-semibold">No fee collection data available</p>
          <p className="text-sm mt-2">Fee data will appear here once students make payments</p>
        </div>
      </div>
    );
  }

  const chartData = data.chartData || [];
  const summary = data.summary || {
    totalAmountDue: 0,
    totalAmountPaid: 0,
    outstandingAmount: 0,
    collectionRate: 0
  };

  // Sort classes: Nursery first, then LKG, then numeric (1, 2, 3...)
  const sortClasses = (classes) => {
    if (!classes || classes.length === 0) return [];
    
    // Define the order for special classes
    const classOrder = {
      'Nursery': 1,
      'LKG': 2,
      'UKG': 3, // In case UKG exists
    };
    
    return [...classes].sort((a, b) => {
      // Get order values (undefined if not in special list)
      const aOrder = classOrder[a];
      const bOrder = classOrder[b];
      
      // If both are special classes, use their defined order
      if (aOrder !== undefined && bOrder !== undefined) {
        return aOrder - bOrder;
      }
      
      // If only a is special, it comes first
      if (aOrder !== undefined) {
        return -1;
      }
      
      // If only b is special, it comes first
      if (bOrder !== undefined) {
        return 1;
      }
      
      // Check if both are numeric
      const aNum = parseInt(a);
      const bNum = parseInt(b);
      const aIsNum = !isNaN(aNum) && a.toString() === aNum.toString();
      const bIsNum = !isNaN(bNum) && b.toString() === bNum.toString();
      
      // If both are numeric, sort numerically
      if (aIsNum && bIsNum) {
        return aNum - bNum;
      }
      
      // If only a is numeric, it comes after special classes but before other text
      if (aIsNum && !bIsNum) {
        return -1;
      }
      
      // If only b is numeric, it comes after special classes but before other text
      if (!aIsNum && bIsNum) {
        return 1;
      }
      
      // If both are non-numeric and not special, sort alphabetically
      return a.localeCompare(b);
    });
  };

  // Get filter options from backend data and sort classes
  const filterOptions = data.filterOptions || { classes: [], sections: [] };
  const sortedClasses = sortClasses(filterOptions.classes || []);


  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Fee Collection Filters - Mobile Optimized */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
        <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">Fee Collection Filters</h4>
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Filter Controls - Stack on mobile */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-center">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2 flex-1">
              <label className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap sm:min-w-[50px]">Class:</label>
              <select
                className="flex-1 min-w-0 px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={selectedClass || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedClass(value);
                  console.log("Class filter changed:", value);
                }}
              >
                <option value="">All Classes</option>
                {sortedClasses && sortedClasses.length > 0 ? (
                  sortedClasses.map((className) => (
                    <option key={className} value={className}>Class {className}</option>
                  ))
                ) : (
                  <option value="" disabled>No classes available</option>
                )}
              </select>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2 flex-1">
              <label className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap sm:min-w-[70px]">Section:</label>
              <select
                className="flex-1 min-w-0 px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={selectedSection || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedSection(value);
                  console.log("Section filter changed:", value);
                }}
              >
                <option value="">All Sections</option>
                {filterOptions.sections && filterOptions.sections.length > 0 ? (
                  filterOptions.sections.map((section) => (
                    <option key={section} value={section}>Section {section}</option>
                  ))
                ) : (
                  <option value="" disabled>No sections available</option>
                )}
              </select>
            </div>
          </div>
          
          {/* Action Buttons - Stack on mobile */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
            <button
              type="button"
              onClick={(e) => applyFilters(e)}
              disabled={isApplyingFilters}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${isApplyingFilters
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-md'
                }`}
            >
              {isApplyingFilters ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent"></div>
                  <span>Applying...</span>
                </div>
              ) : (
                'Apply Filters'
              )}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedClass('');
                setSelectedSection('');
                setAppliedClass('');
                setAppliedSection('');
                appliedClassRef.current = '';
                appliedSectionRef.current = '';
                applyFilters(e);
              }}
              disabled={isApplyingFilters}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium bg-gray-500 text-white hover:bg-gray-600 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear Filters
            </button>
          </div>
          
          {/* Current Filter Display - Mobile Optimized */}
 
        </div>
      </div>

      {/* Fee Collection Summary Cards - Mobile Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-2 sm:p-3 rounded-lg sm:rounded-xl">
          <div className="flex items-center space-x-2">
            <div className="p-1 sm:p-1.5 bg-blue-500 rounded-md flex-shrink-0">
              <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-blue-700 mb-0.5">Total Amount</p>
              <p className="text-sm sm:text-base font-bold text-blue-900 break-words leading-tight">
                ₹{summary.totalAmountDue.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-2 sm:p-3 rounded-lg sm:rounded-xl">
          <div className="flex items-center space-x-2">
            <div className="p-1 sm:p-1.5 bg-green-500 rounded-md flex-shrink-0">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-green-700 mb-0.5">Amount Paid</p>
              <p className="text-sm sm:text-base font-bold text-green-900 break-words leading-tight">
                ₹{summary.totalAmountPaid.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
        <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${summary.outstandingAmount <= 0 ? 'bg-gradient-to-r from-emerald-50 to-emerald-100' : 'bg-gradient-to-r from-orange-50 to-orange-100'}`}>
          <div className="flex items-center space-x-2">
            <div className={`p-1 sm:p-1.5 rounded-md flex-shrink-0 ${summary.outstandingAmount <= 0 ? 'bg-emerald-500' : 'bg-orange-500'}`}>
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-semibold ${summary.outstandingAmount <= 0 ? 'text-emerald-700' : 'text-orange-700'} mb-0.5`}>
                {summary.outstandingAmount <= 0 ? 'Collection Rate' : 'Due Amount'}
              </p>
              <p className={`text-sm sm:text-base font-bold ${summary.outstandingAmount <= 0 ? 'text-emerald-900' : 'text-orange-900'} break-words leading-tight`}>
                {summary.outstandingAmount <= 0 ? `${summary.collectionRate}%` : `₹${summary.outstandingAmount.toLocaleString('en-IN')}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Class-Section Fee Breakdown */}
      {data.classSectionDetails && data.classSectionDetails.length > 0 && (() => {
        // Filter and sort logic
        const filteredData = data.classSectionDetails.filter(detail => {
          const searchLower = feeBreakdownSearch.toLowerCase();
          return (
            detail.class.toString().toLowerCase().includes(searchLower) ||
            detail.section.toString().toLowerCase().includes(searchLower) ||
            `${detail.class}-${detail.section}`.toLowerCase().includes(searchLower)
          );
        });

        const sortedData = [...filteredData].sort((a, b) => {
          let aVal, bVal;
          switch (feeBreakdownSortBy) {
            case 'class':
              aVal = a.class;
              bVal = b.class;
              break;
            case 'section':
              aVal = a.section;
              bVal = b.section;
              break;
            case 'students':
              aVal = a.studentCount;
              bVal = b.studentCount;
              break;
            case 'fee':
              aVal = a.feePerStudent;
              bVal = b.feePerStudent;
              break;
            case 'total':
              aVal = a.totalAmount;
              bVal = b.totalAmount;
              break;
            default:
              return 0;
          }
          
          if (typeof aVal === 'string') {
            return feeBreakdownSortOrder === 'asc' 
              ? aVal.localeCompare(bVal)
              : bVal.localeCompare(aVal);
          }
          return feeBreakdownSortOrder === 'asc' ? aVal - bVal : bVal - aVal;
        });

        // Group by class if enabled
        const groupedData = feeBreakdownGroupBy
          ? sortedData.reduce((acc, detail) => {
              if (!acc[detail.class]) {
                acc[detail.class] = [];
              }
              acc[detail.class].push(detail);
              return acc;
            }, {})
          : null;

        // Pagination
        const totalPages = feeBreakdownGroupBy 
          ? Math.ceil(Object.keys(groupedData || {}).length / feeBreakdownItemsPerPage)
          : Math.ceil(sortedData.length / feeBreakdownItemsPerPage);
        const startIndex = (feeBreakdownCurrentPage - 1) * feeBreakdownItemsPerPage;
        const endIndex = startIndex + feeBreakdownItemsPerPage;

        const handleSort = (column) => {
          if (feeBreakdownSortBy === column) {
            setFeeBreakdownSortOrder(feeBreakdownSortOrder === 'asc' ? 'desc' : 'asc');
          } else {
            setFeeBreakdownSortBy(column);
            setFeeBreakdownSortOrder('asc');
          }
          setFeeBreakdownCurrentPage(1);
        };

        const SortIcon = ({ column }) => {
          if (feeBreakdownSortBy !== column) return null;
          return feeBreakdownSortOrder === 'asc' 
            ? <ArrowUpRight className="w-3 h-3 inline ml-1" />
            : <ArrowDownRight className="w-3 h-3 inline ml-1" />;
        };

        return (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
            <div className="flex flex-col gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <h4 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 truncate">
                    Class-Section Fee Breakdown
                    <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-normal text-gray-600">
                      ({filteredData.length} {filteredData.length === 1 ? 'section' : 'sections'})
                    </span>
                  </h4>
                </div>
                <button
                  onClick={() => setFeeBreakdownCollapsed(!feeBreakdownCollapsed)}
                  className="p-1.5 rounded-lg hover:bg-indigo-100 transition-colors flex-shrink-0"
                  title={feeBreakdownCollapsed ? "Expand table" : "Collapse table"}
                >
                  {feeBreakdownCollapsed ? (
                    <Maximize2 className="w-4 h-4 text-indigo-600" />
                  ) : (
                    <Minimize2 className="w-4 h-4 text-indigo-600" />
                  )}
                </button>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2">
                {/* Search */}
                <div className="relative flex-1 sm:flex-none sm:min-w-[200px]">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search class/section..."
                    value={feeBreakdownSearch}
                    onChange={(e) => {
                      setFeeBreakdownSearch(e.target.value);
                      setFeeBreakdownCurrentPage(1);
                    }}
                    className="w-full pl-8 pr-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                {/* Group Toggle */}
                <button
                  onClick={() => {
                    setFeeBreakdownGroupBy(!feeBreakdownGroupBy);
                    setFeeBreakdownCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg transition-all whitespace-nowrap ${
                    feeBreakdownGroupBy
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Grid className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                  <span className="hidden sm:inline">Group by Class</span>
                  <span className="sm:hidden">Group</span>
                </button>
              </div>
            </div>

            {/* Table View - Mobile Responsive */}
            {!feeBreakdownCollapsed && (
              <div className="bg-white rounded-xl shadow-sm border border-indigo-100 overflow-hidden">
                <div className="overflow-x-auto -mx-2 sm:mx-0">
                  <div className="inline-block min-w-full align-middle">
                    <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-indigo-50 border-b border-indigo-200">
                      <tr>
                        <th
                          className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-indigo-700 uppercase cursor-pointer hover:bg-indigo-100 transition-colors whitespace-nowrap"
                          onClick={() => handleSort('class')}
                        >
                          Class <SortIcon column="class" />
                        </th>
                        <th
                          className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-indigo-700 uppercase cursor-pointer hover:bg-indigo-100 transition-colors whitespace-nowrap"
                          onClick={() => handleSort('section')}
                        >
                          Section <SortIcon column="section" />
                        </th>
                        <th
                          className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-right text-xs font-semibold text-indigo-700 uppercase cursor-pointer hover:bg-indigo-100 transition-colors whitespace-nowrap"
                          onClick={() => handleSort('students')}
                        >
                          Students <SortIcon column="students" />
                        </th>
                        <th
                          className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-right text-xs font-semibold text-indigo-700 uppercase cursor-pointer hover:bg-indigo-100 transition-colors whitespace-nowrap"
                          onClick={() => handleSort('fee')}
                        >
                          <span className="hidden sm:inline">Fee/Student</span>
                          <span className="sm:hidden">Fee</span>
                          <SortIcon column="fee" />
                        </th>
                        <th
                          className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-right text-xs font-semibold text-indigo-700 uppercase cursor-pointer hover:bg-indigo-100 transition-colors whitespace-nowrap"
                          onClick={() => handleSort('total')}
                        >
                          <span className="hidden sm:inline">Total Amount</span>
                          <span className="sm:hidden">Total</span>
                          <SortIcon column="total" />
                        </th>
                      </tr>
                    </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredData.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-4 py-8 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-400">
                            <Search className="w-12 h-12 mb-2 opacity-50" />
                            <p className="text-sm font-medium">No matching class-sections found</p>
                            <p className="text-xs mt-1">Try adjusting your search criteria</p>
                          </div>
                        </td>
                      </tr>
                    ) : feeBreakdownGroupBy ? (
                      // Grouped view
                      Object.entries(groupedData || {})
                        .slice(startIndex, endIndex)
                        .map(([classNum, sections]) => (
                          <React.Fragment key={classNum}>
                            <tr className="bg-indigo-50/50">
                              <td colSpan="5" className="px-4 py-2">
                                <span className="font-bold text-indigo-700">Class {classNum}</span>
                                <span className="ml-2 text-sm text-gray-600">
                                  ({sections.length} {sections.length === 1 ? 'section' : 'sections'})
                                </span>
                              </td>
                            </tr>
                            {sections.map((detail, idx) => (
                              <motion.tr
                                key={`${classNum}-${detail.section}-${idx}`}
                                className="hover:bg-indigo-50/30 transition-colors"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: idx * 0.05 }}
                              >
                                <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-600"></td>
                                <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3">
                                  <span className="text-xs sm:text-sm font-medium text-gray-800">
                                    {detail.section}
                                  </span>
                                </td>
                                <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm text-gray-700">
                                  {detail.studentCount}
                                </td>
                                <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-blue-600 whitespace-nowrap">
                                  ₹{detail.feePerStudent.toLocaleString()}
                                </td>
                                <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-bold text-indigo-700 whitespace-nowrap">
                                  ₹{detail.totalAmount.toLocaleString()}
                                </td>
                              </motion.tr>
                            ))}
                            <tr className="bg-indigo-100/30">
                              <td colSpan="2" className="px-4 py-2 text-sm font-semibold text-indigo-800">
                                Class {classNum} Total:
                              </td>
                              <td className="px-4 py-2 text-right text-sm font-semibold text-indigo-800">
                                {sections.reduce((sum, s) => sum + s.studentCount, 0)}
                              </td>
                              <td className="px-4 py-2"></td>
                              <td className="px-4 py-2 text-right text-sm font-bold text-indigo-800">
                                ₹{sections.reduce((sum, s) => sum + s.totalAmount, 0).toLocaleString()}
                              </td>
                            </tr>
                          </React.Fragment>
                        ))
                    ) : (
                      // Flat table view
                      sortedData.slice(startIndex, endIndex).map((detail, index) => (
                        <motion.tr
                          key={`${detail.class}-${detail.section}-${index}`}
                          className="hover:bg-indigo-50/30 transition-colors"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-800">
                            {detail.class}
                          </td>
                          <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-800">
                            {detail.section}
                          </td>
                          <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm text-gray-700">
                            {detail.studentCount}
                          </td>
                          <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-blue-600 whitespace-nowrap">
                            ₹{detail.feePerStudent.toLocaleString()}
                          </td>
                          <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-bold text-indigo-700 whitespace-nowrap">
                            ₹{detail.totalAmount.toLocaleString()}
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                    </table>
                  </div>
                </div>

                {/* Pagination - Mobile Responsive */}
                {totalPages > 1 && (
                <div className="px-2 sm:px-4 py-2 sm:py-3 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-2">
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">Items per page:</span>
                    <select
                      value={feeBreakdownItemsPerPage}
                      onChange={(e) => {
                        setFeeBreakdownItemsPerPage(Number(e.target.value));
                        setFeeBreakdownCurrentPage(1);
                      }}
                      className="px-2 py-1 text-xs sm:text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 justify-center sm:justify-end">
                    <button
                      onClick={() => setFeeBreakdownCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={feeBreakdownCurrentPage === 1}
                      className="px-2 sm:px-3 py-1 text-xs sm:text-sm rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                      Page {feeBreakdownCurrentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setFeeBreakdownCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={feeBreakdownCurrentPage === totalPages}
                      className="px-2 sm:px-3 py-1 text-xs sm:text-sm rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
                )}
              </div>
            )}
          </div>
        );
      })()}

      {/* Payment Summary by Class-Section */}
      {chartData && chartData.length > 0 && (() => {
        // Process chartData to create summary
        const paymentSummaryData = Object.values(
          chartData
            .filter(item => item.amountPaid > 0)
            .reduce((acc, item) => {
              const key = `${item.class}-${item.section}`;
              if (!acc[key]) {
                acc[key] = {
                  class: item.class,
                  section: item.section,
                  totalPaid: 0,
                  paymentCount: 0,
                  days: new Set()
                };
              }
              acc[key].totalPaid += item.amountPaid;
              acc[key].paymentCount += item.paymentCount;
              acc[key].days.add(item.day);
              return acc;
            }, {})
        ).map(summary => ({
          ...summary,
          daysCount: summary.days.size
        }));

        if (paymentSummaryData.length === 0) {
          return (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-2xl">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Payment Summary by Class-Section</h4>
              <div className="text-center py-8 text-gray-500 bg-white rounded-xl">
                <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">No payments found for the selected period</p>
              </div>
            </div>
          );
        }

        // Filter and sort logic
        const filteredData = paymentSummaryData.filter(summary => {
          const searchLower = paymentSummarySearch.toLowerCase();
          return (
            summary.class.toString().toLowerCase().includes(searchLower) ||
            summary.section.toString().toLowerCase().includes(searchLower) ||
            `${summary.class}-${summary.section}`.toLowerCase().includes(searchLower)
          );
        });

        const sortedData = [...filteredData].sort((a, b) => {
          let aVal, bVal;
          switch (paymentSummarySortBy) {
            case 'class':
              aVal = a.class;
              bVal = b.class;
              break;
            case 'section':
              aVal = a.section;
              bVal = b.section;
              break;
            case 'totalPaid':
              aVal = a.totalPaid;
              bVal = b.totalPaid;
              break;
            case 'paymentCount':
              aVal = a.paymentCount;
              bVal = b.paymentCount;
              break;
            case 'days':
              aVal = a.daysCount;
              bVal = b.daysCount;
              break;
            default:
              return 0;
          }
          
          if (typeof aVal === 'string') {
            return paymentSummarySortOrder === 'asc' 
              ? aVal.localeCompare(bVal)
              : bVal.localeCompare(aVal);
          }
          return paymentSummarySortOrder === 'asc' ? aVal - bVal : bVal - aVal;
        });

        // Group by class if enabled
        const groupedData = paymentSummaryGroupBy
          ? sortedData.reduce((acc, summary) => {
              if (!acc[summary.class]) {
                acc[summary.class] = [];
              }
              acc[summary.class].push(summary);
              return acc;
            }, {})
          : null;

        // Pagination
        const totalPages = paymentSummaryGroupBy 
          ? Math.ceil(Object.keys(groupedData || {}).length / paymentSummaryItemsPerPage)
          : Math.ceil(sortedData.length / paymentSummaryItemsPerPage);
        const startIndex = (paymentSummaryCurrentPage - 1) * paymentSummaryItemsPerPage;
        const endIndex = startIndex + paymentSummaryItemsPerPage;

        const handlePaymentSort = (column) => {
          if (paymentSummarySortBy === column) {
            setPaymentSummarySortOrder(paymentSummarySortOrder === 'asc' ? 'desc' : 'asc');
          } else {
            setPaymentSummarySortBy(column);
            setPaymentSummarySortOrder('desc'); // Default to desc for amounts
          }
          setPaymentSummaryCurrentPage(1);
        };

        const PaymentSortIcon = ({ column }) => {
          if (paymentSummarySortBy !== column) return null;
          return paymentSummarySortOrder === 'asc' 
            ? <ArrowUpRight className="w-3 h-3 inline ml-1" />
            : <ArrowDownRight className="w-3 h-3 inline ml-1" />;
        };

        return (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
            <div className="flex flex-col gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <h4 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 truncate">
                    Payment Summary by Class-Section
                    <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-normal text-gray-600">
                      ({filteredData.length} {filteredData.length === 1 ? 'section' : 'sections'})
                    </span>
                  </h4>
                </div>
                <button
                  onClick={() => setPaymentSummaryCollapsed(!paymentSummaryCollapsed)}
                  className="p-1.5 rounded-lg hover:bg-purple-100 transition-colors flex-shrink-0"
                  title={paymentSummaryCollapsed ? "Expand table" : "Collapse table"}
                >
                  {paymentSummaryCollapsed ? (
                    <Maximize2 className="w-4 h-4 text-purple-600" />
                  ) : (
                    <Minimize2 className="w-4 h-4 text-purple-600" />
                  )}
                </button>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2">
                {/* Search */}
                <div className="relative flex-1 sm:flex-none sm:min-w-[200px]">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search class/section..."
                    value={paymentSummarySearch}
                    onChange={(e) => {
                      setPaymentSummarySearch(e.target.value);
                      setPaymentSummaryCurrentPage(1);
                    }}
                    className="w-full pl-8 pr-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                {/* Group Toggle */}
                <button
                  onClick={() => {
                    setPaymentSummaryGroupBy(!paymentSummaryGroupBy);
                    setPaymentSummaryCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg transition-all whitespace-nowrap ${
                    paymentSummaryGroupBy
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Grid className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                  <span className="hidden sm:inline">Group by Class</span>
                  <span className="sm:hidden">Group</span>
                </button>
              </div>
            </div>

            {/* Table View - Mobile Responsive */}
            {!paymentSummaryCollapsed && (
              <div className="bg-white rounded-xl shadow-sm border border-purple-100 overflow-hidden">
                <div className="overflow-x-auto -mx-2 sm:mx-0">
                  <div className="inline-block min-w-full align-middle">
                    <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-purple-50 border-b border-purple-200">
                      <tr>
                        <th
                          className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-purple-700 uppercase cursor-pointer hover:bg-purple-100 transition-colors whitespace-nowrap"
                          onClick={() => handlePaymentSort('class')}
                        >
                          Class <PaymentSortIcon column="class" />
                        </th>
                        <th
                          className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-purple-700 uppercase cursor-pointer hover:bg-purple-100 transition-colors whitespace-nowrap"
                          onClick={() => handlePaymentSort('section')}
                        >
                          Section <PaymentSortIcon column="section" />
                        </th>
                        <th
                          className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-right text-xs font-semibold text-purple-700 uppercase cursor-pointer hover:bg-purple-100 transition-colors whitespace-nowrap"
                          onClick={() => handlePaymentSort('totalPaid')}
                        >
                          <span className="hidden sm:inline">Total Paid</span>
                          <span className="sm:hidden">Paid</span>
                          <PaymentSortIcon column="totalPaid" />
                        </th>
                        <th
                          className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-right text-xs font-semibold text-purple-700 uppercase cursor-pointer hover:bg-purple-100 transition-colors whitespace-nowrap"
                          onClick={() => handlePaymentSort('paymentCount')}
                        >
                          Payments <PaymentSortIcon column="paymentCount" />
                        </th>
                        <th
                          className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-right text-xs font-semibold text-purple-700 uppercase cursor-pointer hover:bg-purple-100 transition-colors whitespace-nowrap"
                          onClick={() => handlePaymentSort('days')}
                        >
                          <span className="hidden sm:inline">Active Days</span>
                          <span className="sm:hidden">Days</span>
                          <PaymentSortIcon column="days" />
                        </th>
                      </tr>
                    </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredData.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-4 py-8 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-400">
                            <Search className="w-12 h-12 mb-2 opacity-50" />
                            <p className="text-sm font-medium">No matching payments found</p>
                            <p className="text-xs mt-1">Try adjusting your search criteria</p>
                          </div>
                        </td>
                      </tr>
                    ) : paymentSummaryGroupBy ? (
                      // Grouped view
                      Object.entries(groupedData || {})
                        .slice(startIndex, endIndex)
                        .map(([classNum, summaries]) => (
                          <React.Fragment key={classNum}>
                            <tr className="bg-purple-50/50">
                              <td colSpan="5" className="px-4 py-2">
                                <span className="font-bold text-purple-700">Class {classNum}</span>
                                <span className="ml-2 text-sm text-gray-600">
                                  ({summaries.length} {summaries.length === 1 ? 'section' : 'sections'})
                                </span>
                              </td>
                            </tr>
                            {summaries.map((summary, idx) => (
                              <motion.tr
                                key={`${classNum}-${summary.section}-${idx}`}
                                className="hover:bg-purple-50/30 transition-colors"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: idx * 0.05 }}
                              >
                                <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-600"></td>
                                <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3">
                                  <span className="text-xs sm:text-sm font-medium text-gray-800">
                                    {summary.section}
                                  </span>
                                </td>
                                <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-bold text-green-600 whitespace-nowrap">
                                  ₹{summary.totalPaid.toLocaleString()}
                                </td>
                                <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-blue-600">
                                  {summary.paymentCount}
                                </td>
                                <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm text-gray-700 whitespace-nowrap">
                                  {summary.daysCount} {summary.daysCount === 1 ? 'day' : 'days'}
                                </td>
                              </motion.tr>
                            ))}
                            <tr className="bg-purple-100/30">
                              <td colSpan="2" className="px-4 py-2 text-sm font-semibold text-purple-800">
                                Class {classNum} Total:
                              </td>
                              <td className="px-4 py-2 text-right text-sm font-bold text-purple-800">
                                ₹{summaries.reduce((sum, s) => sum + s.totalPaid, 0).toLocaleString()}
                              </td>
                              <td className="px-4 py-2 text-right text-sm font-semibold text-purple-800">
                                {summaries.reduce((sum, s) => sum + s.paymentCount, 0)}
                              </td>
                              <td className="px-4 py-2"></td>
                            </tr>
                          </React.Fragment>
                        ))
                    ) : (
                      // Flat table view
                      sortedData.slice(startIndex, endIndex).map((summary, index) => (
                        <motion.tr
                          key={`${summary.class}-${summary.section}-${index}`}
                          className="hover:bg-purple-50/30 transition-colors"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-800">
                            {summary.class}
                          </td>
                          <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-800">
                            {summary.section}
                          </td>
                          <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-bold text-green-600 whitespace-nowrap">
                            ₹{summary.totalPaid.toLocaleString()}
                          </td>
                          <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-blue-600">
                            {summary.paymentCount}
                          </td>
                          <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm text-gray-700 whitespace-nowrap">
                            {summary.daysCount} {summary.daysCount === 1 ? 'day' : 'days'}
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                    </table>
                  </div>
                </div>

                {/* Pagination - Mobile Responsive */}
                {totalPages > 1 && (
                  <div className="px-2 sm:px-4 py-2 sm:py-3 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-2">
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">Items per page:</span>
                    <select
                      value={paymentSummaryItemsPerPage}
                      onChange={(e) => {
                        setPaymentSummaryItemsPerPage(Number(e.target.value));
                        setPaymentSummaryCurrentPage(1);
                      }}
                      className="px-2 py-1 text-xs sm:text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 justify-center sm:justify-end">
                    <button
                      onClick={() => setPaymentSummaryCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={paymentSummaryCurrentPage === 1}
                      className="px-2 sm:px-3 py-1 text-xs sm:text-sm rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                      Page {paymentSummaryCurrentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPaymentSummaryCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={paymentSummaryCurrentPage === totalPages}
                      className="px-2 sm:px-3 py-1 text-xs sm:text-sm rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
                )}
              </div>
            )}
          </div>
        );
      })()}

      {/* Daily Fee Collection Chart with Summary - Mobile Responsive */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl">
        <div className="mb-4 sm:mb-6">
          <h4 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-1 sm:mb-2">Fee Collection by Class</h4>
          <p className="text-xs sm:text-sm text-gray-600">Total payments collected by class-section</p>
        </div>

        {/* Summary Cards */}
        {chartData && chartData.length > 0 && (() => {
          const validData = chartData.filter(item => item && typeof item === 'object');
          const totalPaid = validData.reduce((sum, item) => sum + Number(item.amountPaid || 0), 0);
          const totalPayments = validData.reduce((sum, item) => sum + Number(item.paymentCount || 0), 0);
          const avgDailyPaid = validData.length > 0 ? totalPaid / validData.length : 0;
          const amounts = validData.map(item => Number(item.amountPaid || 0)).filter(amt => amt > 0);
          const maxDailyPaid = amounts.length > 0 ? Math.max(...amounts) : 0;

          return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 sm:gap-2 mb-2 sm:mb-3">
              <div className="bg-white p-1.5 sm:p-2 rounded-md sm:rounded-lg shadow-sm border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0 pr-1.5">
                    <p className="text-xs font-medium text-gray-600 mb-0.5">Total Paid</p>
                    <p className="text-xs sm:text-sm font-bold text-green-600 break-words leading-tight">
                      ₹{totalPaid.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 opacity-50 flex-shrink-0" />
                </div>
              </div>
              <div className="bg-white p-1.5 sm:p-2 rounded-md sm:rounded-lg shadow-sm border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0 pr-1.5">
                    <p className="text-xs font-medium text-gray-600 mb-0.5">Total Payments</p>
                    <p className="text-xs sm:text-sm font-bold text-blue-600 break-words leading-tight">
                      {totalPayments.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 opacity-50 flex-shrink-0" />
                </div>
              </div>
              <div className="bg-white p-1.5 sm:p-2 rounded-md sm:rounded-lg shadow-sm border border-purple-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0 pr-1.5">
                    <p className="text-xs font-medium text-gray-600 mb-0.5">Avg Daily Paid</p>
                    <p className="text-xs sm:text-sm font-bold text-purple-600 break-words leading-tight">
                      ₹{Math.round(avgDailyPaid).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500 opacity-50 flex-shrink-0" />
                </div>
              </div>
              <div className="bg-white p-1.5 sm:p-2 rounded-md sm:rounded-lg shadow-sm border border-indigo-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0 pr-1.5">
                    <p className="text-xs font-medium text-gray-600 mb-0.5">Highest Daily</p>
                    <p className="text-xs sm:text-sm font-bold text-indigo-600 break-words leading-tight">
                      ₹{maxDailyPaid.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-500 opacity-50 flex-shrink-0" />
                </div>
              </div>
            </div>
          );
        })()}

        {/* Enhanced Bar Chart - Grouped by Class - Mobile Responsive */}
        <div className="w-full h-64 sm:h-80 md:h-96 bg-white p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl shadow-sm">
          {(() => {
            // Group data by class-section and sum amounts
            const classDataMap = chartData.reduce((acc, item) => {
              if (!item || !item.class || Number(item.amountPaid || 0) <= 0) return acc;
              
              const classKey = item.section 
                ? `${item.class}-${item.section}` 
                : `${item.class}`;
              
              if (!acc[classKey]) {
                acc[classKey] = {
                  classKey: classKey,
                  class: item.class,
                  section: item.section || '',
                  amountPaid: 0,
                  paymentCount: 0
                };
              }
              
              acc[classKey].amountPaid += Number(item.amountPaid || 0);
              acc[classKey].paymentCount += Number(item.paymentCount || 0);
              
              return acc;
            }, {});
            
            const classChartData = Object.values(classDataMap)
              .filter(item => item.amountPaid > 0)
              .sort((a, b) => {
                // Sort by class number first, then section
                if (a.class !== b.class) {
                  return String(a.class).localeCompare(String(b.class), undefined, { numeric: true });
                }
                return (a.section || '').localeCompare(b.section || '');
              });
            
            if (classChartData.length === 0) {
              return (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm font-medium text-gray-500">No payment data available</p>
                    <p className="text-xs text-gray-400 mt-1">for the selected period</p>
                  </div>
                </div>
              );
            }
            
            return (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart 
                  data={classChartData} 
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
              <defs>
                <linearGradient id="amountPaidGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={1} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis
                dataKey="classKey"
                tick={{ fontSize: 11, fill: '#4B5563', fontWeight: '500' }}
                axisLine={{ stroke: '#D1D5DB', strokeWidth: 1 }}
                tickLine={{ stroke: '#D1D5DB' }}
                angle={-45}
                textAnchor="end"
                height={80}
                tickFormatter={(value) => {
                  // Format as "Class X" or "Class X-Y"
                  const parts = value.split('-');
                  if (parts.length === 2) {
                    return `Class ${parts[0]}-${parts[1]}`;
                  }
                  return `Class ${value}`;
                }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#4B5563', fontWeight: '500' }}
                axisLine={{ stroke: '#D1D5DB', strokeWidth: 1 }}
                tickLine={{ stroke: '#D1D5DB' }}
                tickFormatter={(value) => {
                  if (value >= 1000000) return `₹${(value / 1000000).toFixed(1)}M`;
                  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
                  return `₹${value}`;
                }}
                width={80}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const amountPaid = data.amountPaid || 0;
                    const paymentCount = data.paymentCount || 0;
                    const displayName = data.section 
                      ? `Class ${data.class}-${data.section}` 
                      : `Class ${data.class}`;
                    
                    return (
                      <div style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.98)',
                        border: '1px solid #E5E7EB',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                        padding: '14px',
                        fontSize: '13px'
                      }}>
                        <div style={{ 
                          fontWeight: 'bold', 
                          color: '#1F2937', 
                          marginBottom: '10px',
                          paddingBottom: '8px',
                          borderBottom: '1px solid #E5E7EB'
                        }}>
                          {displayName}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '12px',
                            height: '12px',
                            backgroundColor: '#10B981',
                            borderRadius: '2px'
                          }}></div>
                          <div>
                            <div style={{ 
                              fontWeight: 'bold', 
                              color: '#1F2937', 
                              fontSize: '15px' 
                            }}>
                              ₹{Number(amountPaid).toLocaleString('en-IN')}
                            </div>
                            {paymentCount > 0 && (
                              <div style={{ 
                                fontSize: '11px', 
                                color: '#6B7280', 
                                marginTop: '4px' 
                              }}>
                                {paymentCount} payment{paymentCount !== 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
                cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }}
              />
              <Bar
                dataKey="amountPaid"
                fill="url(#amountPaidGradient)"
                name="Amount Paid"
                radius={[8, 8, 0, 0]}
                stroke="#10B981"
                strokeWidth={2}
              >
                {classChartData.length <= 30 && (
                  <LabelList
                    dataKey="amountPaid"
                    position="top"
                    formatter={(value) => {
                      if (!value || value === 0) return '';
                      if (value >= 1000000) return `₹${(value / 1000000).toFixed(1)}M`;
                      if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
                      return `₹${value}`;
                    }}
                    style={{ fontSize: '11px', fill: '#059669', fontWeight: '700' }}
                  />
                )}
              </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            );
          })()}
        </div>
      </div>

      {/* Daily Breakdown - Enhanced Table View - Mobile Responsive */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
          <h4 className="text-base sm:text-lg font-semibold text-gray-800">Recent Daily Fee Collection</h4>
          <span className="text-xs text-gray-500">
            Showing last {Math.min(chartData?.length || 0, 10)} days
          </span>
        </div>
        {chartData && chartData.length > 0 ? (
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase whitespace-nowrap">Date</th>
                      <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase whitespace-nowrap">Class-Section</th>
                      <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-right text-xs font-semibold text-gray-700 uppercase whitespace-nowrap">Amount Paid</th>
                      <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-right text-xs font-semibold text-gray-700 uppercase whitespace-nowrap">Payments</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {chartData
                      .filter(item => item && (item.amountPaid > 0 || item.paymentCount > 0))
                      .slice(-10)
                      .reverse()
                      .map((item, index) => {
                        const amountPaid = Number(item.amountPaid || 0);
                        const paymentCount = Number(item.paymentCount || 0);
                        const day = item.day || 'N/A';
                        const classSection = item.class && item.section 
                          ? `Class ${item.class}-${item.section}` 
                          : 'All Classes';
                        
                        return (
                          <motion.tr
                            key={`${day}-${index}`}
                            className="hover:bg-green-50/50 transition-colors"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.03 }}
                          >
                            <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3">
                              <span className="text-xs sm:text-sm font-medium text-gray-800 whitespace-nowrap">{day}</span>
                            </td>
                            <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3">
                              <span className="text-xs text-blue-600 font-medium bg-blue-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
                                {classSection}
                              </span>
                            </td>
                            <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-right">
                              <span className="text-sm sm:text-base font-bold text-green-600 whitespace-nowrap">
                                ₹{amountPaid.toLocaleString('en-IN')}
                              </span>
                            </td>
                            <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-right">
                              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
                                {paymentCount} {paymentCount === 1 ? 'payment' : 'payments'}
                              </span>
                            </td>
                          </motion.tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg sm:rounded-xl p-6 sm:p-8 text-center border border-gray-200">
            <CreditCard className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-xs sm:text-sm text-gray-500 font-medium">No fee collection data available</p>
            <p className="text-xs text-gray-400 mt-1">for the selected period</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Advanced Filter Component Removed as requested

// Innovative Radial Progress Chart for Attendance
const RadialAttendanceChart = ({ data, title, color, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Calculate totals based on the actual data structure
  const totalPresent = data.reduce((sum, item) => sum + (item.present || 0), 0);
  const totalAbsent = data.reduce((sum, item) => sum + (item.absent || 0), 0);
  const totalRecords = totalPresent + totalAbsent;
  const attendanceRate = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0;

  console.log("RadialAttendanceChart - Data:", data);
  console.log("RadialAttendanceChart - Total Present:", totalPresent);
  console.log("RadialAttendanceChart - Total Absent:", totalAbsent);
  console.log("RadialAttendanceChart - Attendance Rate:", attendanceRate);

  const radialData = [
    { name: 'Present', value: totalPresent, fill: color },
    { name: 'Absent', value: totalAbsent, fill: '#E5E7EB' }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
        <div className="text-4xl font-bold text-gray-900">{attendanceRate}%</div>
        <p className="text-sm text-gray-600">Overall Attendance Rate</p>
      </div>

      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" data={[{ value: attendanceRate }]}>
            <RadialBar
              dataKey="value"
              fill={color}
              cornerRadius={10}
              stroke="#fff"
              strokeWidth={2}
            />
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold fill-gray-800">
              {attendanceRate}%
            </text>
          </RadialBarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-gray-50 rounded-xl">
          <div className="text-2xl font-bold text-gray-900">{totalPresent}</div>
          <div className="text-sm text-gray-600">Present</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-xl">
          <div className="text-2xl font-bold text-gray-900">{totalAbsent}</div>
          <div className="text-sm text-gray-600">Absent</div>
        </div>
      </div>
    </div>
  );
};

// Heatmap Chart for Daily Attendance Patterns
const AttendanceHeatmapChart = ({ data, title, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Create heatmap data (simplified version)
  const heatmapData = data.slice(-30).map((item, index) => ({
    day: index + 1,
    attendance: item.totalStudents > 0 ? Math.round((item.studentsPresent / item.totalStudents) * 100) : 0,
    date: item.date
  }));

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-800 text-center">{title}</h3>

      <div className="grid grid-cols-7 gap-2">
        {heatmapData.map((item, index) => {
          const intensity = item.attendance / 100;
          const bgColor = intensity > 0.8 ? 'bg-green-500' :
            intensity > 0.6 ? 'bg-yellow-500' :
              intensity > 0.4 ? 'bg-orange-500' : 'bg-red-500';

          return (
            <motion.div
              key={index}
              className={`h-8 ${bgColor} rounded-lg flex items-center justify-center text-white text-xs font-semibold cursor-pointer hover:scale-110 transition-transform`}
              style={{ opacity: Math.max(0.3, intensity) }}
              whileHover={{ scale: 1.1 }}
              title={`${item.date}: ${item.attendance}%`}
            >
              {item.attendance}
            </motion.div>
          );
        })}
      </div>

      <div className="flex items-center justify-center space-x-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>Low (0-40%)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-orange-500 rounded"></div>
          <span>Medium (40-60%)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span>Good (60-80%)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Excellent (80-100%)</span>
        </div>
      </div>
    </div>
  );
};

// Scatter Plot for Attendance Trends
const AttendanceScatterChart = ({ data, title, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const scatterData = data.map((item, index) => ({
    x: index,
    y: item.totalStudents > 0 ? Math.round((item.studentsPresent / item.totalStudents) * 100) : 0,
    date: item.date,
    present: item.studentsPresent,
    absent: item.studentsAbsent
  }));

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-800 text-center">{title}</h3>

      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart data={scatterData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="x"
              name="Day"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              dataKey="y"
              name="Attendance %"
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
            />
            {/* <Tooltip 
              active={true}
              formatter={(value, name, props) => [
                `${props.payload.present}/${props.payload.present + props.payload.absent} (${value}%)`,
                'Attendance'
              ]}
              labelFormatter={(value, props) => `Day ${value + 1}: ${props[0]?.payload?.date}`}
            /> */}
            <Scatter
              dataKey="y"
              fill="#3B82F6"
              stroke="#1E40AF"
              strokeWidth={2}
              r={6}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Modern Student Attendance Analytics Chart
const StudentAttendanceChart = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-gray-500 text-sm">Loading student attendance data...</p>
        </div>
      </div>
    );
  }

  if (!data || !data.attendanceData || data.attendanceData.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 text-gray-500">
        <div className="text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-semibold">No student attendance data available</p>
          <p className="text-sm mt-2">Attendance tracking may not be implemented yet</p>
        </div>
      </div>
    );
  }

  const chartData = data.attendanceData.slice(-30); // Last 30 days
  const summary = data.summary;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-2xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700">Total Records</p>
              <p className="text-2xl font-bold text-blue-900">{summary.totalRecords.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-2xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-green-700">Attendance Rate</p>
              <p className="text-2xl font-bold text-green-900">{summary.overallAttendanceRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Line Chart for Daily Trends */}
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="studentAttendanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            {/* <Tooltip 
              active={true}
              formatter={(value, name) => [
                `${value} students`, 
                name === 'studentsPresent' ? 'Present' : 'Absent'
              ]}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                fontSize: '14px',
                fontWeight: '500'
              }}
            /> */}
            <Legend />
            <Line
              type="monotone"
              dataKey="studentsPresent"
              stroke="#10B981"
              strokeWidth={3}
              dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
              name="Present"
            />
            <Line
              type="monotone"
              dataKey="studentsAbsent"
              stroke="#EF4444"
              strokeWidth={3}
              dot={{ fill: '#EF4444', strokeWidth: 2, r: 6 }}
              name="Absent"
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>

      {/* Class-wise Breakdown */}
      {data.classSummary && data.classSummary.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Class-wise Attendance</h4>
          <div className="grid grid-cols-1 gap-3">
            {data.classSummary.slice(0, 5).map((item, index) => (
              <motion.div
                key={index}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl hover:shadow-md transition-all duration-200"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 5 }}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-4 h-4 bg-blue-500 rounded-full" />
                  <span className="text-sm font-semibold text-gray-800">
                    Class {item._id.class} {item._id.section}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">{item.attendanceRate}%</span>
                  <span className="text-lg font-bold text-gray-900">{item.studentCount} students</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Modern Teacher Attendance Analytics Chart
const TeacherAttendanceChart = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600"></div>
          <p className="text-gray-500 text-sm">Loading teacher attendance data...</p>
        </div>
      </div>
    );
  }

  if (!data || !data.attendanceData || data.attendanceData.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 text-gray-500">
        <div className="text-center">
          <GraduationCap className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-semibold">No teacher attendance data available</p>
          <p className="text-sm mt-2">Attendance tracking may not be implemented yet</p>
        </div>
      </div>
    );
  }

  const chartData = data.attendanceData.slice(-30); // Last 30 days
  const summary = data.summary;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-2xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-green-700">Total Records</p>
              <p className="text-2xl font-bold text-green-900">{summary.totalRecords.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-2xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700">Attendance Rate</p>
              <p className="text-2xl font-bold text-blue-900">{summary.overallAttendanceRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Area Chart for Daily Trends */}
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="teacherPresentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="teacherAbsentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            {/* <Tooltip 
              active={true}
              formatter={(value, name) => [
                `${value} teachers`, 
                name === 'teachersPresent' ? 'Present' : 'Absent'
              ]}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                fontSize: '14px',
                fontWeight: '500'
              }}
            /> */}
            <Legend />
            <Area
              type="monotone"
              dataKey="teachersPresent"
              stackId="1"
              stroke="#10B981"
              fill="url(#teacherPresentGradient)"
              strokeWidth={2}
              name="Present"
            />
            <Area
              type="monotone"
              dataKey="teachersAbsent"
              stackId="1"
              stroke="#EF4444"
              fill="url(#teacherAbsentGradient)"
              strokeWidth={2}
              name="Absent"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Subject-wise Breakdown */}
      {data.subjectSummary && data.subjectSummary.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Subject-wise Attendance</h4>
          <div className="grid grid-cols-1 gap-3">
            {data.subjectSummary.slice(0, 5).map((item, index) => (
              <motion.div
                key={index}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl hover:shadow-md transition-all duration-200"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 5 }}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-4 h-4 bg-green-500 rounded-full" />
                  <span className="text-sm font-semibold text-gray-800">{item._id}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">{item.attendanceRate}%</span>
                  <span className="text-lg font-bold text-gray-900">{item.teacherCount} teachers</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Modern Attendance Comparative Chart
const AttendanceComparativeChart = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
          <p className="text-gray-500 text-sm">Loading comparative data...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-80 text-gray-500">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-semibold">No comparative data available</p>
          <p className="text-sm mt-2">Data comparison may not be available yet</p>
        </div>
      </div>
    );
  }

  const currentPeriod = data.currentPeriod;
  const comparisonPeriod = data.comparisonPeriod;
  const comparison = data.comparison;

  return (
    <div className="space-y-6">
      {/* Comparison Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-2xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-700">Student Attendance</p>
              <p className="text-2xl font-bold text-blue-900">{currentPeriod.studentAttendance.rate}%</p>
              <p className="text-xs text-blue-600">
                {comparison.studentAttendanceChange > 0 ? '+' : ''}{comparison.studentAttendanceChange}% vs previous
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-2xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-green-700">Teacher Attendance</p>
              <p className="text-2xl font-bold text-green-900">{currentPeriod.teacherAttendance.rate}%</p>
              <p className="text-xs text-green-600">
                {comparison.teacherAttendanceChange > 0 ? '+' : ''}{comparison.teacherAttendanceChange}% vs previous
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Comparative Bar Chart */}
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            data={[
              {
                name: 'Students',
                current: currentPeriod.studentAttendance.rate,
                previous: comparisonPeriod.studentAttendance.rate,
                change: comparison.studentAttendanceChange
              },
              {
                name: 'Teachers',
                current: currentPeriod.teacherAttendance.rate,
                previous: comparisonPeriod.teacherAttendance.rate,
                change: comparison.teacherAttendanceChange
              }
            ]}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <defs>
              <linearGradient id="currentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.3} />
              </linearGradient>
              <linearGradient id="previousGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6B7280" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#6B7280" stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#E5E7EB' }}
              domain={[0, 100]}
            />
            {/* <Tooltip 
              active={true}
              formatter={(value, name) => [`${value}%`, name === 'current' ? 'Current Period' : 'Previous Period']}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                fontSize: '14px',
                fontWeight: '500'
              }}
            /> */}
            <Legend />
            <Bar
              dataKey="current"
              fill="url(#currentGradient)"
              name="Current Period"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="previous"
              fill="url(#previousGradient)"
              name="Previous Period"
              radius={[4, 4, 0, 0]}
            />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>

      {/* Trend Indicators */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`p-4 rounded-2xl ${comparison.studentAttendanceTrend === 'up' ? 'bg-green-50 border border-green-200' :
            comparison.studentAttendanceTrend === 'down' ? 'bg-red-50 border border-red-200' :
              'bg-gray-50 border border-gray-200'
          }`}>
          <div className="flex items-center space-x-3">
            {comparison.studentAttendanceTrend === 'up' ? (
              <TrendingUp className="w-6 h-6 text-green-600" />
            ) : comparison.studentAttendanceTrend === 'down' ? (
              <TrendingDown className="w-6 h-6 text-red-600" />
            ) : (
              <Activity className="w-6 h-6 text-gray-600" />
            )}
            <div>
              <p className="text-sm font-semibold text-gray-700">Student Trend</p>
              <p className={`text-lg font-bold ${comparison.studentAttendanceTrend === 'up' ? 'text-green-600' :
                  comparison.studentAttendanceTrend === 'down' ? 'text-red-600' :
                    'text-gray-600'
                }`}>
                {comparison.studentAttendanceTrend.toUpperCase()}
              </p>
            </div>
          </div>
        </div>
        <div className={`p-4 rounded-2xl ${comparison.teacherAttendanceTrend === 'up' ? 'bg-green-50 border border-green-200' :
            comparison.teacherAttendanceTrend === 'down' ? 'bg-red-50 border border-red-200' :
              'bg-gray-50 border border-gray-200'
          }`}>
          <div className="flex items-center space-x-3">
            {comparison.teacherAttendanceTrend === 'up' ? (
              <TrendingUp className="w-6 h-6 text-green-600" />
            ) : comparison.teacherAttendanceTrend === 'down' ? (
              <TrendingDown className="w-6 h-6 text-red-600" />
            ) : (
              <Activity className="w-6 h-6 text-gray-600" />
            )}
            <div>
              <p className="text-sm font-semibold text-gray-700">Teacher Trend</p>
              <p className={`text-lg font-bold ${comparison.teacherAttendanceTrend === 'up' ? 'text-green-600' :
                  comparison.teacherAttendanceTrend === 'down' ? 'text-red-600' :
                    'text-gray-600'
                }`}>
                {comparison.teacherAttendanceTrend.toUpperCase()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Enhanced Dashboard Component
const EnhancedDashboard = () => {
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  // Get today's date in YYYY-MM-DD format for date input
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const [localSelectedDate, setLocalSelectedDate] = useState(getTodayDate());
  
  const [localSelectedAcademicYear, setLocalSelectedAcademicYear] = useState(getCurrentAcademicYear());

  const {
    loading,
    error,
    dashboardData,
    realTimeData,
    incomeExpenseData,
    annualFeeSummary,
    teacherPerformanceData,
    realTimeAlerts,
    performanceTrends,
    studentAttendanceData,
    teacherAttendanceData,
    attendanceComparativeData,
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
    getAlertsData,
    getStudentAttendanceData,
    getTeacherAttendanceData,
    getAttendanceComparativeData,
    getAttendanceAnalyticsSummary,
    selectedDate,
    setSelectedDate,
    selectedAcademicYear,
    setSelectedAcademicYear,
    getCurrentAcademicYear: getStoreCurrentAcademicYear
  } = useEnhancedDashboardStore();

  // Load data on component mount and when date/academic year changes
  // Initialize date to today if not set
  useEffect(() => {
    const currentYear = getCurrentAcademicYear();
    console.log("🔧 Initializing dashboard - Current academic year:", currentYear);
    
    if (!selectedDate || selectedDate === '') {
      const today = getTodayDate();
      console.log("🔧 Setting date to today:", today);
      setSelectedDate(today);
      setLocalSelectedDate(today);
    } else {
      setLocalSelectedDate(selectedDate);
    }
    
    // Always initialize academic year to current year on mount (override any stale value)
    console.log("🔧 Setting academic year to current:", currentYear);
    setSelectedAcademicYear(currentYear);
    setLocalSelectedAcademicYear(currentYear);
  }, []); // Run only on mount

  useEffect(() => {
    console.log("=== useEffect triggered ===");
    console.log("Selected Date:", selectedDate);
    console.log("Selected Academic Year:", selectedAcademicYear);
    if (selectedDate && selectedAcademicYear) {
      console.log("✅ Both date and academic year are set, triggering fetchAllDashboardData");
      console.log("Calling fetchAllDashboardData with:", { selectedDate, selectedAcademicYear });
      fetchAllDashboardData(selectedDate, selectedAcademicYear);
    } else {
      console.log("❌ Skipping fetch - missing date or academic year");
      console.log("Date:", selectedDate, "Academic Year:", selectedAcademicYear);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, selectedAcademicYear]);

  // Start auto-refresh
  useEffect(() => {
    startAutoRefresh();
    return () => stopAutoRefresh();
  }, []);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllDashboardData(selectedDate, selectedAcademicYear);
    setRefreshing(false);
  };
  
  // Generate academic year options using shared utility (previous 5, current, next 1)
  // Sort in descending order (newest first) for better UX
  const academicYearOptions = getAcademicYearOptions(5, 1).sort((a, b) => {
    const aStart = parseInt(a.split('-')[0]);
    const bStart = parseInt(b.split('-')[0]);
    return bStart - aStart; // Descending order (newest first)
  });

  // Get computed data
  const kpis = getComputedKPIs();
  const chartData = getChartData();
  const recentActivities = getRecentActivities();
  const performanceMetrics = getPerformanceMetrics();

  // Get attendance analytics data
  const attendanceSummary = getAttendanceAnalyticsSummary();

  // Debug logging
  console.log("EnhancedDashboard - KPIs:", kpis);
  console.log("EnhancedDashboard - Chart Data:", chartData);
  console.log("EnhancedDashboard - Students by Class:", chartData.studentsByClass);
  console.log("EnhancedDashboard - Income Expense Data:", chartData.incomeExpenseData);
  console.log("EnhancedDashboard - Loading:", loading);
  console.log("EnhancedDashboard - Dashboard Data:", dashboardData);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 p-2 sm:p-4 md:p-6">
        {/* Header */}
        <motion.div
          className="mb-4 sm:mb-6 md:mb-8 lg:mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col gap-4 sm:gap-6">
            <div className="space-y-2 sm:space-y-3">
              <motion.h1
                className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Enhanced Analytics Dashboard
              </motion.h1>
              <motion.p
                className="text-sm sm:text-base md:text-lg text-gray-600 font-medium"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                Real-time insights into your school's performance and operations
              </motion.p>
              {lastUpdated && (
                <motion.div
                  className="flex items-center space-x-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs sm:text-sm text-gray-500 font-medium">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </span>
                </motion.div>
              )}
            </div>

            {/* Date and Academic Year Selectors - Mobile Optimized */}
            <motion.div
              className="flex flex-col gap-3 sm:gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {/* Date Selector - Stack on mobile */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0" />
                  <label className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">Date:</label>
                  <input
                    type="date"
                    value={localSelectedDate}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      setLocalSelectedDate(newDate);
                      setSelectedDate(newDate);
                    }}
                    className="flex-1 min-w-0 px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                  />
                </div>
                <button
                  onClick={() => {
                    const today = getTodayDate();
                    setLocalSelectedDate(today);
                    setSelectedDate(today);
                  }}
                  className="px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors whitespace-nowrap"
                >
                  Today
                </button>
              </div>
              
              {/* Academic Year Selector - Stack on mobile */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0" />
                  <label className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">Academic Year:</label>
                  <select
                    value={localSelectedAcademicYear}
                    onChange={async (e) => {
                      const newYear = e.target.value;
                      console.log("🔄 Academic year changed to:", newYear);
                      setLocalSelectedAcademicYear(newYear);
                      setSelectedAcademicYear(newYear);
                      console.log("✅ Academic year updated in store");
                      
                      if (selectedDate) {
                        console.log("🚀 Immediately fetching data with new academic year:", newYear);
                        await fetchAllDashboardData(selectedDate, newYear);
                      } else {
                        console.log("⚠️ Cannot fetch - selectedDate is missing:", selectedDate);
                      }
                    }}
                    className="flex-1 min-w-0 px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm bg-white"
                  >
                    {academicYearOptions.map((year) => (
                      <option key={year} value={year}>
                        {year} {year === getCurrentAcademicYear() ? "(Current)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={async () => {
                    const currentYear = getCurrentAcademicYear();
                    console.log("🔄 Setting academic year to current:", currentYear);
                    setLocalSelectedAcademicYear(currentYear);
                    setSelectedAcademicYear(currentYear);
                    
                    if (selectedDate) {
                      console.log("🚀 Immediately fetching data with current academic year:", currentYear);
                      await fetchAllDashboardData(selectedDate, currentYear);
                    }
                  }}
                  className="px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors whitespace-nowrap"
                >
                  Current
                </button>
              </div>
            </motion.div>

            {/* Action Buttons - Mobile Optimized */}
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <motion.button
                className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 text-xs sm:text-sm md:text-base font-semibold ${autoRefresh ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                onClick={toggleAutoRefresh}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {autoRefresh ? <Pause className="w-4 h-4 sm:w-5 sm:h-5" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5" />}
                <span className="hidden sm:inline">Auto Refresh</span>
              </motion.button>
              <motion.button
                className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 text-xs sm:text-sm md:text-base font-semibold text-gray-700 hover:bg-gray-50"
                onClick={handleRefresh}
                disabled={refreshing}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </motion.button>
              {/* <motion.button
              className="flex items-center space-x-2 px-4 sm:px-6 py-3 bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 text-sm sm:text-base font-semibold text-gray-700 hover:bg-gray-50"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
            </motion.button> */}
            </div>
          </div>
        </motion.div>

        {/* Main Dashboard Content */}
        <motion.div
          className="space-y-4 sm:space-y-6 md:space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
            <MetricCard
              title="Total Students"
              value={kpis.totalStudents}
              subtitle="Enrolled"
              icon={UsersIcon}
              color="blue"
              loading={loading}
              delay={0.1}
              isRealTime={true}
            />
            <MetricCard
              title="Active Teachers"
              value={kpis.totalTeachers}
              subtitle="Staff Members"
              icon={GraduationCapIcon}
              color="green"
              loading={loading}
              delay={0.2}
              isRealTime={true}
            />
            <MetricCard
              title="Fee Collection"
              value={kpis.totalFeeCollected}
              prefix="₹"
              subtitle="This Year"
              icon={DollarSignIcon}
              color="purple"
              loading={loading}
              delay={0.3}
              isRealTime={true}
            />
            <MetricCard
              title="Pending Offline"
              value={kpis.pendingOfflinePayments}
              subtitle="Verification Required"
              icon={Receipt}
              color="orange"
              loading={loading}
              delay={0.4}
              isRealTime={true}
            />
          </div>

          {/* Alerts Panel - Removed */}

          {/* Secondary Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
            <MetricCard
              title="Student Attendance"
              value={kpis.attendanceToday}
              subtitle={`${kpis.totalEnrolledStudents || kpis.totalStudents} Total Students`}
              icon={ActivityIcon}
              color="emerald"
              loading={loading}
              delay={0.5}
              isRealTime={true}
              percentage={kpis.attendancePercentage}
            />
            <MetricCard
              title="Teacher Attendance"
              value={kpis.teacherAttendanceToday}
              subtitle={`${kpis.totalEnrolledTeachers || kpis.totalTeachers} Total Teachers`}
              icon={ClockIcon}
              color="indigo"
              loading={loading}
              delay={0.6}
              isRealTime={true}
              percentage={kpis.teacherAttendancePercentage}
            />

            {/* <MetricCard
            title="Marked Today"
            value={kpis.totalMarkedToday}
            subtitle={`${kpis.markedAttendancePercentage}% of Total Students`}
            icon={CheckCircle}
            color="blue"
            loading={loading}
            delay={0.7}
            isRealTime={true}
            percentage={kpis.markedAttendancePercentage}
          /> */}

            {/* <MetricCard
            title="Upcoming Events"
            value={kpis.upcomingEvents}
            subtitle="This Month"
            icon={CalendarIconAlt}
            color="pink"
            loading={loading}
            delay={0.8}
            isRealTime={true}
          /> */}
          </div>

          {/* Enhanced Attendance Breakdown - Mobile Responsive */}
          {(kpis.studentsAbsent > 0 || kpis.studentsNotMarked > 0 || kpis.teachersAbsent > 0 || kpis.teachersNotMarked > 0) && (
            <motion.div
              className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl md:rounded-3xl shadow-xl border border-blue-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-600 flex-shrink-0" />
                <span className="truncate">Detailed Attendance Breakdown</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                {/* Student Attendance Details */}
                <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm">
                  <h4 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 mb-2 sm:mb-3 flex items-center">
                    <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600 flex-shrink-0" />
                    Student Attendance
                  </h4>
                  <div className="space-y-1.5 sm:space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-gray-600">Present:</span>
                      <span className="text-xs sm:text-sm font-semibold text-green-600">{kpis.attendanceToday}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-gray-600">Absent:</span>
                      <span className="text-xs sm:text-sm font-semibold text-red-600">{kpis.studentsAbsent || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-gray-600">Not Marked:</span>
                      <span className="text-xs sm:text-sm font-semibold text-orange-600">{kpis.studentsNotMarked || 0}</span>
                    </div>
                    <div className="flex justify-between items-center border-t pt-1.5 sm:pt-2">
                      <span className="text-xs sm:text-sm font-semibold text-gray-800">Total Marked Today:</span>
                      <span className="text-xs sm:text-sm font-bold text-blue-600">{kpis.totalMarkedToday || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm font-semibold text-gray-800">Total Enrolled:</span>
                      <span className="text-xs sm:text-sm font-bold text-gray-900">{kpis.totalEnrolledStudents || kpis.totalStudents}</span>
                    </div>
                  </div>
                </div>

                {/* Teacher Attendance Details */}
                <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm">
                  <h4 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 mb-2 sm:mb-3 flex items-center">
                    <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600 flex-shrink-0" />
                    Teacher Attendance
                  </h4>
                  <div className="space-y-1.5 sm:space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-gray-600">Present:</span>
                      <span className="text-xs sm:text-sm font-semibold text-green-600">{kpis.teacherAttendanceToday}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-gray-600">Absent:</span>
                      <span className="text-xs sm:text-sm font-semibold text-red-600">{kpis.teachersAbsent || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-gray-600">Not Marked:</span>
                      <span className="text-xs sm:text-sm font-semibold text-orange-600">{kpis.teachersNotMarked || 0}</span>
                    </div>
                    <div className="flex justify-between items-center border-t pt-1.5 sm:pt-2">
                      <span className="text-xs sm:text-sm font-semibold text-gray-800">Total Enrolled:</span>
                      <span className="text-xs sm:text-sm font-bold text-gray-900">{kpis.totalEnrolledTeachers || kpis.totalTeachers}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            {/* Students by Class */}
            <ChartContainer title="Class Wise Student Strength" loading={loading} delay={0.9} isRealTime={true}>
              <div className="mb-2 p-2 bg-yellow-50 rounded text-xs">
                <strong>Data Check:</strong> {chartData.studentsByClass?.length || 0} classes received
              </div>
              <StudentsByClassChart data={chartData.studentsByClass} loading={loading} />
            </ChartContainer>

            {/* Income vs Expense */}
            <ChartContainer title="Fee Collection Status" loading={loading} delay={1.0} isRealTime={true}>
              <FeeCollectionStatusChart data={chartData.feeCollectionStatusData} loading={loading} />
            </ChartContainer>
          </div>

          {/* Modern Attendance Analytics Section */}
          {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"> */}
          {/* Student Attendance Analytics */}
          {/* <ChartContainer title="Student Attendance Analytics" loading={loading} delay={1.1} isRealTime={true}>
            <StudentAttendanceChart data={chartData.studentAttendanceData} loading={loading} />
          </ChartContainer> */}

          {/* Teacher Attendance Analytics */}
          {/* <ChartContainer title="Teacher Attendance Analytics" loading={loading} delay={1.2} isRealTime={true}>
            <TeacherAttendanceChart data={chartData.teacherAttendanceData} loading={loading} />
          </ChartContainer>
        </div> */}



          {/* Payment Methods Analysis */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            <ChartContainer title="Payment Methods Analysis" loading={loading} delay={1.4} isRealTime={true}>
              <PaymentMethodsChart data={chartData.paymentMethodsData} loading={loading} />
            </ChartContainer>
          </div>

          {/* Fee Collection Trends - Enhanced Comprehensive View */}
          <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6">
            <ChartContainer title="Fee Collection Trends & Analysis" loading={loading} delay={1.5} isRealTime={true}>
              {chartData.feeCollectionRates && chartData.feeCollectionRates.length > 0 ? (
                <div className="space-y-4 sm:space-y-6">
                  {/* Summary Statistics Cards */}
                  {(() => {
                    const data = chartData.feeCollectionRates;
                    const totalCollected = data.reduce((sum, item) => sum + (item.totalCollected || 0), 0);
                    const avgMonthly = data.length > 0 ? totalCollected / data.length : 0;
                    const maxMonth = data.reduce((max, item) => 
                      (item.totalCollected || 0) > (max.totalCollected || 0) ? item : max, data[0] || {}
                    );
                    const minMonth = data.reduce((min, item) => 
                      (item.totalCollected || 0) < (min.totalCollected || 0) ? item : min, data[0] || {}
                    );
                    const recentMonths = data.slice(-3);
                    const previousMonths = data.slice(-6, -3);
                    const recentAvg = recentMonths.length > 0 
                      ? recentMonths.reduce((sum, item) => sum + (item.totalCollected || 0), 0) / recentMonths.length 
                      : 0;
                    const previousAvg = previousMonths.length > 0 
                      ? previousMonths.reduce((sum, item) => sum + (item.totalCollected || 0), 0) / previousMonths.length 
                      : 0;
                    const growthRate = previousAvg > 0 
                      ? ((recentAvg - previousAvg) / previousAvg * 100).toFixed(1) 
                      : recentAvg > 0 ? '100' : '0';
                    const isGrowing = parseFloat(growthRate) > 0;

                    return (
                      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 sm:p-4 rounded-xl border border-blue-200">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs sm:text-sm font-semibold text-blue-700">Total Collected</p>
                            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                          </div>
                          <p className="text-lg sm:text-xl md:text-2xl font-bold text-blue-900">
                            ₹{totalCollected.toLocaleString('en-IN')}
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            Over {data.length} {data.length === 1 ? 'month' : 'months'}
                          </p>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 sm:p-4 rounded-xl border border-green-200">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs sm:text-sm font-semibold text-green-700">Avg Monthly</p>
                            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                          </div>
                          <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-900">
                            ₹{Math.round(avgMonthly).toLocaleString('en-IN')}
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            Per month average
                          </p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 sm:p-4 rounded-xl border border-purple-200">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs sm:text-sm font-semibold text-purple-700">Growth Rate</p>
                            {isGrowing ? (
                              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                            ) : (
                              <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                            )}
                          </div>
                          <p className={`text-lg sm:text-xl md:text-2xl font-bold ${isGrowing ? 'text-green-900' : 'text-red-900'}`}>
                            {isGrowing ? '+' : ''}{growthRate}%
                          </p>
                          <p className="text-xs text-purple-600 mt-1">
                            Last 3 months vs previous
                          </p>
                        </div>

                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 sm:p-4 rounded-xl border border-orange-200">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs sm:text-sm font-semibold text-orange-700">Peak Month</p>
                            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                          </div>
                          <p className="text-lg sm:text-xl md:text-2xl font-bold text-orange-900">
                            ₹{maxMonth.totalCollected?.toLocaleString('en-IN') || '0'}
                          </p>
                          <p className="text-xs text-orange-600 mt-1 truncate">
                            {maxMonth.month || 'N/A'}
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Enhanced Chart with Area Fill */}
                  <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200">
                    <div className="mb-3 sm:mb-4">
                      <h5 className="text-sm sm:text-base font-semibold text-gray-800 mb-1">
                        Monthly Fee Collection Trend
                      </h5>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Track your fee collection performance over time. Hover over data points for detailed information.
                      </p>
                    </div>
                    <div className="w-full h-64 sm:h-72 md:h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart 
                          data={chartData.feeCollectionRates} 
                          margin={{ top: 10, right: 20, left: 10, bottom: 40 }}
                        >
                          <defs>
                            <linearGradient id="feeCollectionAreaGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05} />
                            </linearGradient>
                            <linearGradient id="feeCollectionLineGradient" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#3B82F6" />
                              <stop offset="100%" stopColor="#8B5CF6" />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                          <XAxis
                            dataKey="month"
                            tick={{ fontSize: 11, fill: '#6B7280', fontWeight: '500' }}
                            axisLine={{ stroke: '#D1D5DB', strokeWidth: 1 }}
                            tickLine={{ stroke: '#D1D5DB' }}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                            interval="preserveStartEnd"
                            tickFormatter={(value) => {
                              // Format month display: "Feb 2025" instead of "2025-02"
                              if (value && value.includes('-')) {
                                const [year, month] = value.split('-');
                                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                const monthIndex = parseInt(month) - 1;
                                return `${monthNames[monthIndex] || month} ${year}`;
                              }
                              return value;
                            }}
                          />
                          <YAxis
                            tick={{ fontSize: 11, fill: '#6B7280', fontWeight: '500' }}
                            axisLine={{ stroke: '#D1D5DB', strokeWidth: 1 }}
                            tickLine={{ stroke: '#D1D5DB' }}
                            tickFormatter={(value) => {
                              if (value >= 1000000) return `₹${(value / 1000000).toFixed(1)}M`;
                              if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
                              return `₹${value}`;
                            }}
                            width={70}
                          />
                          <Tooltip
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                const amount = data.totalCollected || 0;
                                const month = label || 'N/A';
                                
                                // Format month for display
                                let formattedMonth = month;
                                if (month && month.includes('-')) {
                                  const [year, monthNum] = month.split('-');
                                  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                                  const monthIndex = parseInt(monthNum) - 1;
                                  formattedMonth = `${monthNames[monthIndex] || monthNum} ${year}`;
                                }

                                return (
                                  <div style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                    border: '1px solid #E5E7EB',
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                                    padding: '12px 16px',
                                    fontSize: '13px'
                                  }}>
                                    <div style={{ 
                                      fontWeight: 'bold', 
                                      color: '#1F2937', 
                                      marginBottom: '8px',
                                      paddingBottom: '8px',
                                      borderBottom: '1px solid #E5E7EB'
                                    }}>
                                      {formattedMonth}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <div style={{
                                        width: '12px',
                                        height: '12px',
                                        backgroundColor: '#3B82F6',
                                        borderRadius: '2px'
                                      }}></div>
                                      <div>
                                        <div style={{ 
                                          fontWeight: 'bold', 
                                          color: '#1F2937', 
                                          fontSize: '16px' 
                                        }}>
                                          ₹{Number(amount).toLocaleString('en-IN')}
                                        </div>
                                        <div style={{ 
                                          fontSize: '11px', 
                                          color: '#6B7280', 
                                          marginTop: '2px' 
                                        }}>
                                          Total Collected
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                            cursor={{ stroke: '#3B82F6', strokeWidth: 2, strokeDasharray: '5 5' }}
                          />
                          <Area
                            type="monotone"
                            dataKey="totalCollected"
                            stroke="url(#feeCollectionLineGradient)"
                            strokeWidth={3}
                            fill="url(#feeCollectionAreaGradient)"
                            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Insights Section */}
                  {(() => {
                    const data = chartData.feeCollectionRates;
                    if (data.length < 2) return null;
                    
                    const recentMonths = data.slice(-3);
                    const previousMonths = data.slice(-6, -3);
                    const recentAvg = recentMonths.length > 0 
                      ? recentMonths.reduce((sum, item) => sum + (item.totalCollected || 0), 0) / recentMonths.length 
                      : 0;
                    const previousAvg = previousMonths.length > 0 
                      ? previousMonths.reduce((sum, item) => sum + (item.totalCollected || 0), 0) / previousMonths.length 
                      : 0;
                    const growthRate = previousAvg > 0 
                      ? ((recentAvg - previousAvg) / previousAvg * 100) 
                      : recentAvg > 0 ? 100 : 0;

                    return (
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-3 sm:p-4 rounded-xl border border-indigo-200">
                        <h5 className="text-sm sm:text-base font-semibold text-gray-800 mb-2 sm:mb-3 flex items-center">
                          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-indigo-600" />
                          Key Insights
                        </h5>
                        <div className="space-y-2 text-xs sm:text-sm text-gray-700">
                          {growthRate > 0 ? (
                            <p className="flex items-start">
                              <span className="text-green-600 mr-2">✓</span>
                              <span>Fee collection has <strong>increased by {Math.abs(growthRate).toFixed(1)}%</strong> in the last 3 months compared to the previous period.</span>
                            </p>
                          ) : growthRate < 0 ? (
                            <p className="flex items-start">
                              <span className="text-orange-600 mr-2">⚠</span>
                              <span>Fee collection has <strong>decreased by {Math.abs(growthRate).toFixed(1)}%</strong> in the last 3 months. Consider reviewing collection strategies.</span>
                            </p>
                          ) : (
                            <p className="flex items-start">
                              <span className="text-blue-600 mr-2">ℹ</span>
                              <span>Fee collection has remained <strong>stable</strong> over the recent period.</span>
                            </p>
                          )}
                          <p className="flex items-start">
                            <span className="text-blue-600 mr-2">ℹ</span>
                            <span>Data shows collection trends from <strong>{data[0]?.month || 'N/A'}</strong> to <strong>{data[data.length - 1]?.month || 'N/A'}</strong>.</span>
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 sm:h-72 md:h-80 text-gray-500">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">💰</span>
                    </div>
                    <p className="text-base sm:text-lg font-semibold">No fee collection data available</p>
                    <p className="text-xs sm:text-sm mt-2">Fee payments will appear here once recorded</p>
                  </div>
                </div>
              )}
            </ChartContainer>
          </div>




        </motion.div>
      </div>
    </div>
  );
};

export default EnhancedDashboard;
