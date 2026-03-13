/**
 * Author: -Solah-
 * OS support: -Windows and Android Mobile-
 * Description: Reports page with interactive charts for financial analysis.
 */
import React from 'react';
import { useApp } from '../providers/AppProvider';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Download
} from 'lucide-react';
import { formatCurrency, cn } from '../utils';
import { 
  ResponsiveContainer, 
  PieChart as RePieChart, 
  Pie, 
  Cell, 
  Tooltip,
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

export const Reports: React.FC = () => {
  const { transactions, settings, setActiveTab, setTransactionFilter } = useApp();
  const isDark = settings.theme === 'dark';

  const handleCategoryClick = (category: string) => {
    setTransactionFilter({ search: category, type: 'expense' });
    setActiveTab('transactions');
  };

  // Calculate real data from transactions
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  const categoryTotals: Record<string, number> = {};
  
  expenseTransactions.forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.baseAmount;
  });

  const colors = [
    isDark ? '#334155' : '#0f172a',
    '#10b981',
    '#3b82f6',
    '#f59e0b',
    '#f43f5e',
    '#8b5cf6',
    '#ec4899',
    '#06b6d4'
  ];

  const expenseByCategory = Object.entries(categoryTotals)
    .map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // Monthly trend calculation
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return {
      month: d.toLocaleString('default', { month: 'short' }),
      year: d.getFullYear(),
      monthNum: d.getMonth(),
      income: 0,
      expense: 0
    };
  }).reverse();

  transactions.forEach(t => {
    const tDate = new Date(t.date);
    const monthData = last6Months.find(m => m.monthNum === tDate.getMonth() && m.year === tDate.getFullYear());
    if (monthData) {
      if (t.type === 'income') monthData.income += t.baseAmount;
      else monthData.expense += t.baseAmount;
    }
  });

  const monthlyTrend = last6Months.map(({ month, income, expense }) => ({ month, income, expense }));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Reports & Insights</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Deep dive into your financial habits</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white px-6 py-3 rounded-2xl font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
          <Download size={20} />
          Export PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Spending by Category */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PieChart size={18} className="text-emerald-600" />
              Spending by Category
            </h3>
            <div className="hidden sm:block text-[10px] font-black text-slate-400 uppercase tracking-widest">Top 6</div>
          </div>
          
          <div className="flex flex-col items-center gap-6">
            <div className="w-full h-40 flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={expenseByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    onClick={(data) => handleCategoryClick(String(data.name))}
                    className="cursor-pointer"
                  >
                    {expenseByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      backgroundColor: isDark ? '#1e293b' : '#ffffff',
                      padding: '8px 12px'
                    }}
                    itemStyle={{ fontSize: '12px', color: isDark ? '#ffffff' : '#000000', fontWeight: 'bold' }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                </RePieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total</span>
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  {formatCurrency(expenseByCategory.reduce((sum, item) => sum + item.value, 0))}
                </span>
              </div>
            </div>
            
            <div className="w-full space-y-3">
              {expenseByCategory.length > 0 ? (
                expenseByCategory.map((item) => {
                  const total = expenseByCategory.reduce((sum, i) => sum + i.value, 0);
                  const percentage = Math.round((item.value / total) * 100);
                  return (
                    <div key={item.name} className="space-y-1 group cursor-pointer" onClick={() => handleCategoryClick(item.name)}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 transition-colors">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black text-slate-400">{percentage}%</span>
                          <span className="text-[11px] font-black text-slate-900 dark:text-white">{formatCurrency(item.value)}</span>
                        </div>
                      </div>
                      <div className="h-1 w-full bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-1000 ease-out" 
                          style={{ backgroundColor: item.color, width: `${percentage}%` }} 
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <PieChart size={32} className="text-slate-200 dark:text-slate-800 mb-2" />
                  <p className="text-xs text-slate-400 font-medium italic">No expense data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Income vs Expense Trend */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-600" />
              Income vs Expense
            </h3>
            <div className="hidden sm:flex items-center gap-3 text-[10px] font-bold">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <span className="text-slate-500 dark:text-slate-400">Income</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-slate-900 dark:bg-slate-400 rounded-full" />
                <span className="text-slate-500 dark:text-slate-400">Expense</span>
              </div>
            </div>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#334155" : "#f1f5f9"} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: isDark ? '#94a3b8' : '#64748b'}} dy={5} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: isDark ? '#94a3b8' : '#64748b'}} />
                <Tooltip 
                  cursor={{fill: isDark ? '#1e293b' : '#f8fafc'}}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    color: isDark ? '#ffffff' : '#000000',
                    padding: '8px 12px'
                  }}
                  itemStyle={{ fontSize: '12px', color: isDark ? '#ffffff' : '#000000' }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Bar 
                  dataKey="income" 
                  fill="#10b981" 
                  radius={[2, 2, 0, 0]} 
                  barSize={12} 
                  onClick={() => {
                    setTransactionFilter({ search: '', type: 'income' });
                    setActiveTab('transactions');
                  }}
                  className="cursor-pointer"
                />
                <Bar 
                  dataKey="expense" 
                  fill={isDark ? "#94a3b8" : "#0f172a"} 
                  radius={[2, 2, 0, 0]} 
                  barSize={12} 
                  onClick={() => {
                    setTransactionFilter({ search: '', type: 'expense' });
                    setActiveTab('transactions');
                  }}
                  className="cursor-pointer"
                />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Smart Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
          <div className="w-8 h-8 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm mb-3">
            <TrendingUp size={16} />
          </div>
          <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-100 mb-1">Savings Rate</h4>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-300 leading-relaxed">
            Your savings rate is 22% this month, which is 5% higher than your average. Keep it up!
          </p>
        </div>

        <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/30">
          <div className="w-8 h-8 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-sm mb-3">
            <TrendingDown size={16} />
          </div>
          <h4 className="text-sm font-bold text-rose-900 dark:text-rose-100 mb-1">Dining Spike</h4>
          <p className="text-[11px] text-rose-700 dark:text-rose-300 leading-relaxed">
            You've spent MVR 1,200 on dining out this week. This is 40% more than your usual weekly spend.
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30">
          <div className="w-8 h-8 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm mb-3">
            <BarChart3 size={16} />
          </div>
          <h4 className="text-sm font-bold text-blue-900 dark:text-blue-100 mb-1">Utility Trend</h4>
          <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">
            Your electricity bill has been steadily decreasing over the last 3 months. Great energy saving!
          </p>
        </div>
      </div>
    </div>
  );
};

/** --- End of Reports.tsx --- */
