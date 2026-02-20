import React from 'react';
import { motion } from 'framer-motion';
import {
  LineChart as RechartsLineChart,
  BarChart as RechartsBarChart,
  PieChart as RechartsPieChart,
  AreaChart,
  RadialBarChart,
  RadialBar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
  Area,
  Bar,
  Line,
  Pie,
  ComposedChart
} from 'recharts';

// Modern Color Palette
const MODERN_COLORS = {
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
  gradient: {
    primary: ['#3B82F6', '#1D4ED8'],
    success: ['#10B981', '#059669'],
    warning: ['#F59E0B', '#D97706'],
    danger: ['#EF4444', '#DC2626']
  }
};

const chartColors = [
  MODERN_COLORS.primary,
  MODERN_COLORS.secondary,
  MODERN_COLORS.accent,
  MODERN_COLORS.danger,
  MODERN_COLORS.warning,
  MODERN_COLORS.success,
  MODERN_COLORS.info,
  MODERN_COLORS.purple,
  MODERN_COLORS.pink,
  MODERN_COLORS.indigo
];

// 📈 Gradient Line Chart with Area Fill - User/Student Growth Over Time
export const GradientLineChart = ({ data, loading, title, height = 300 }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const chartData = data || [
    { month: 'Jan', students: 120, teachers: 15 },
    { month: 'Feb', students: 135, teachers: 16 },
    { month: 'Mar', students: 142, teachers: 17 },
    { month: 'Apr', students: 158, teachers: 18 },
    { month: 'May', students: 165, teachers: 19 },
    { month: 'Jun', students: 172, teachers: 20 }
  ];

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={MODERN_COLORS.primary} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={MODERN_COLORS.primary} stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorTeachers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={MODERN_COLORS.secondary} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={MODERN_COLORS.secondary} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="month" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6B7280' }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6B7280' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
            }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="students"
            stroke={MODERN_COLORS.primary}
            strokeWidth={3}
            fill="url(#colorStudents)"
            name="Students"
            dot={{ fill: MODERN_COLORS.primary, strokeWidth: 2, r: 6 }}
          />
          <Area
            type="monotone"
            dataKey="teachers"
            stroke={MODERN_COLORS.secondary}
            strokeWidth={3}
            fill="url(#colorTeachers)"
            name="Teachers"
            dot={{ fill: MODERN_COLORS.secondary, strokeWidth: 2, r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// 📊 Rounded Bar Chart (Horizontal) - Attendance or Usage Breakdown
export const RoundedBarChart = ({ data, loading, title, height = 300 }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const chartData = data || [
    { name: 'Grade 10', attendance: 95, students: 45 },
    { name: 'Grade 11', attendance: 88, students: 38 },
    { name: 'Grade 12', attendance: 92, students: 42 },
    { name: 'Grade 9', attendance: 89, students: 35 }
  ];

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart 
          data={chartData} 
          layout="horizontal"
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            type="number"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6B7280' }}
          />
          <YAxis 
            type="category"
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6B7280' }}
            width={80}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
            }}
          />
          <Bar 
            dataKey="attendance" 
            fill={MODERN_COLORS.primary}
            radius={[0, 8, 8, 0]}
            name="Attendance %"
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

// 📊 Stacked Bar Chart - Performance by Category
export const StackedBarChart = ({ data, loading, title, height = 300 }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const chartData = data || [
    { month: 'Jan', paid: 120000, partial: 30000, unpaid: 20000 },
    { month: 'Feb', paid: 135000, partial: 25000, unpaid: 15000 },
    { month: 'Mar', paid: 142000, partial: 20000, unpaid: 10000 },
    { month: 'Apr', paid: 158000, partial: 15000, unpaid: 5000 },
    { month: 'May', paid: 165000, partial: 10000, unpaid: 3000 },
    { month: 'Jun', paid: 172000, partial: 5000, unpaid: 1000 }
  ];

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6B7280' }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6B7280' }}
          />
          <Tooltip 
            formatter={(value) => [`₹${value.toLocaleString()}`, '']}
            contentStyle={{
              backgroundColor: 'white',
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
            }}
          />
          <Legend />
          <Bar dataKey="paid" stackId="a" fill={MODERN_COLORS.success} name="Paid" radius={[0, 0, 0, 0]} />
          <Bar dataKey="partial" stackId="a" fill={MODERN_COLORS.warning} name="Partial" radius={[0, 0, 0, 0]} />
          <Bar dataKey="unpaid" stackId="a" fill={MODERN_COLORS.danger} name="Unpaid" radius={[4, 4, 0, 0]} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

// 🟢 Donut Chart with Center Label - Overall Summary Ratios
export const DonutChart = ({ data, loading, title, height = 300, centerValue, centerLabel }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const chartData = data || [
    { name: 'Paid', value: 75, color: MODERN_COLORS.success },
    { name: 'Partial', value: 15, color: MODERN_COLORS.warning },
    { name: 'Unpaid', value: 10, color: MODERN_COLORS.danger }
  ];

  return (
    <div className="w-full relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
            }}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
      
      {/* Center Label */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{centerValue}</div>
          <div className="text-sm text-gray-600">{centerLabel}</div>
        </div>
      </div>
    </div>
  );
};

// 📉 Progress Radial Chart - Task or Event Completion
export const RadialProgressChart = ({ data, loading, title, height = 300 }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const chartData = data || [
    { name: 'Collection Rate', value: 85, fill: MODERN_COLORS.success },
    { name: 'Attendance Rate', value: 92, fill: MODERN_COLORS.primary },
    { name: 'Teacher Performance', value: 88, fill: MODERN_COLORS.accent }
  ];

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" data={chartData}>
          <RadialBar dataKey="value" cornerRadius={10} fill={MODERN_COLORS.primary} />
          <Tooltip 
            formatter={(value) => [`${value}%`, '']}
            contentStyle={{
              backgroundColor: 'white',
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
            }}
          />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
};

// 💰 Dual Line + Bar Combo Chart - Monthly Income vs Expense
export const DualComboChart = ({ data, loading, title, height = 300 }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const chartData = data || [
    { month: 'Jan', income: 120000, expense: 80000, profit: 40000 },
    { month: 'Feb', income: 135000, expense: 85000, profit: 50000 },
    { month: 'Mar', income: 142000, expense: 90000, profit: 52000 },
    { month: 'Apr', income: 158000, expense: 95000, profit: 63000 },
    { month: 'May', income: 165000, expense: 100000, profit: 65000 },
    { month: 'Jun', income: 172000, expense: 105000, profit: 67000 }
  ];

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6B7280' }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6B7280' }}
          />
          <Tooltip 
            formatter={(value, name) => [`₹${value.toLocaleString()}`, name === 'income' ? 'Income' : name === 'expense' ? 'Expense' : 'Profit']}
            contentStyle={{
              backgroundColor: 'white',
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
            }}
          />
          <Legend />
          <Bar dataKey="income" fill={MODERN_COLORS.success} name="Income" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" fill={MODERN_COLORS.danger} name="Expense" radius={[4, 4, 0, 0]} />
          <Line 
            type="monotone" 
            dataKey="profit" 
            stroke={MODERN_COLORS.primary} 
            strokeWidth={3}
            dot={{ fill: MODERN_COLORS.primary, strokeWidth: 2, r: 6 }}
            name="Profit"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

// 🧾 Horizontal Bar with Avatars/Labels - Top Performing Items
export const TopPerformersChart = ({ data, loading, title, height = 300 }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const chartData = data || [
    { name: 'Sarah Johnson', score: 98, avatar: 'SJ', class: 'Grade 10A' },
    { name: 'Michael Chen', score: 95, avatar: 'MC', class: 'Grade 11B' },
    { name: 'Emily Davis', score: 92, avatar: 'ED', class: 'Grade 12A' },
    { name: 'David Wilson', score: 89, avatar: 'DW', class: 'Grade 10B' },
    { name: 'Lisa Brown', score: 87, avatar: 'LB', class: 'Grade 11A' }
  ];

  return (
    <div className="w-full space-y-3" style={{ height }}>
      {chartData.map((item, index) => (
        <motion.div
          key={item.name}
          className="flex items-center space-x-4 p-3 bg-white rounded-lg shadow-sm border border-gray-100"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {item.avatar}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                <p className="text-sm text-gray-500">{item.class}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">{item.score}%</div>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${item.score}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// 🔵 3D Donut / Polar Area Chart - Active vs Inactive Users
export const PolarAreaChart = ({ data, loading, title, height = 300 }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const chartData = data || [
    { name: 'Active Students', value: 450, fill: MODERN_COLORS.success },
    { name: 'Inactive Students', value: 50, fill: MODERN_COLORS.danger },
    { name: 'Active Teachers', value: 45, fill: MODERN_COLORS.primary },
    { name: 'Inactive Teachers', value: 5, fill: MODERN_COLORS.warning }
  ];

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
            }}
          />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};
