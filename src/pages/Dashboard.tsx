import React from 'react';
import { useApp } from '../providers/AppProvider';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Target, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { formatCurrency, cn } from '../utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
  PieChart,
  Pie
} from 'recharts';

export const Dashboard: React.FC = () => {
  const { accounts, transactions, budgets, bills, setActiveTab } = useApp();

  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);
  const monthlyIncome = transactions
    .filter(t => t.type === 'income' && new Date(t.date).getMonth() === new Date().getMonth())
    .reduce((acc, curr) => acc + curr.baseAmount, 0);
  const monthlyExpenses = transactions
    .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === new Date().getMonth())
    .reduce((acc, curr) => acc + curr.baseAmount, 0);

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Calculate real weekly chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return {
      name: d.toLocaleDateString('en-US', { weekday: 'short' }),
      date: d.toISOString().split('T')[0],
      income: 0,
      expense: 0
    };
  }).reverse();

  transactions.forEach(t => {
    const tDate = t.date.split('T')[0];
    const dayData = last7Days.find(d => d.date === tDate);
    if (dayData) {
      if (t.type === 'income') dayData.income += t.baseAmount;
      else dayData.expense += t.baseAmount;
    }
  });

  const chartData = last7Days.map(({ name, income, expense }) => ({ name, income, expense }));

  // Calculate real budget progress
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyBudgets = budgets.filter(b => b.month === currentMonth && b.year === currentYear);
  
  const budgetProgress = monthlyBudgets.map(budget => {
    const spent = transactions
      .filter(t => t.type === 'expense' && t.category === budget.category && new Date(t.date).getMonth() === currentMonth)
      .reduce((acc, curr) => acc + curr.baseAmount, 0);
    
    return {
      label: budget.category,
      spent,
      limit: budget.plannedAmount,
      color: spent > budget.plannedAmount ? 'bg-rose-500' : spent > budget.plannedAmount * 0.8 ? 'bg-amber-500' : 'bg-emerald-500'
    };
  }).slice(0, 4);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white dark:bg-slate-900 p-3 md:p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
              <Wallet size={16} />
            </div>
            <span className="hidden md:block text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md">Net Worth</span>
          </div>
          <p className="text-[9px] md:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Balance</p>
          <h3 className="text-base md:text-xl font-bold text-slate-900 dark:text-white mt-0.5 truncate">{formatCurrency(totalBalance)}</h3>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 md:p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
              <TrendingUp size={16} />
            </div>
            <span className="hidden md:block text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">This Month</span>
          </div>
          <p className="text-[9px] md:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Income</p>
          <h3 className="text-base md:text-xl font-bold text-slate-900 dark:text-white mt-0.5 truncate">{formatCurrency(monthlyIncome)}</h3>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 md:p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-rose-50 dark:bg-rose-900/30 rounded-xl flex items-center justify-center text-rose-600 group-hover:scale-105 transition-transform">
              <TrendingDown size={16} />
            </div>
            <span className="hidden md:block text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-900/30 px-2 py-0.5 rounded-md">This Month</span>
          </div>
          <p className="text-[9px] md:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Expenses</p>
          <h3 className="text-base md:text-xl font-bold text-slate-900 dark:text-white mt-0.5 truncate">{formatCurrency(monthlyExpenses)}</h3>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3 md:p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-amber-50 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-600 group-hover:scale-105 transition-transform">
              <Calendar size={16} />
            </div>
            <span className="hidden md:block text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-md">Pending</span>
          </div>
          <p className="text-[9px] md:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Bills</p>
          <h3 className="text-base md:text-xl font-bold text-slate-900 dark:text-white mt-0.5 truncate">{bills.filter(b => b.status !== 'paid').length}</h3>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Cash Flow Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-4 md:p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Cash Flow Trend</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Income vs Expenses this week</p>
            </div>
          </div>
          <div className="h-40 md:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#1e293b', color: '#fff' }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={3} />
                <Area type="monotone" dataKey="expense" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Insights */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-5 rounded-2xl text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-bold text-base mb-1">Financial Health</h3>
              <div className="flex items-end gap-1.5 mb-3">
                <span className="text-3xl font-black">82</span>
                <span className="text-slate-400 text-xs font-medium mb-1">/ 100</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                You're doing great! Your savings rate is 15% higher than last month.
              </p>
              <button 
                onClick={() => setActiveTab('reports')}
                className="mt-4 w-full py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all backdrop-blur-md"
              >
                View Full Report
              </button>
            </div>
            {/* Abstract background shape */}
            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl"></div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Upcoming Bills</h3>
            <div className="space-y-3">
              {bills.length === 0 ? (
                <div className="text-center py-2">
                  <p className="text-[10px] text-slate-400 italic">No upcoming bills</p>
                </div>
              ) : (
                bills.slice(0, 3).map(bill => (
                  <div 
                    key={bill.id} 
                    onClick={() => setActiveTab('bills')}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 group hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-white dark:bg-slate-700 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-400 shadow-sm group-hover:text-emerald-600">
                        <Calendar size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{bill.providerName}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Due {new Date(bill.dueDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <p className="text-xs font-black text-slate-900 dark:text-white">{formatCurrency(bill.amount)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Transactions</h3>
            <button 
              onClick={() => setActiveTab('transactions')}
              className="text-emerald-600 text-[10px] font-bold hover:underline flex items-center gap-0.5"
            >
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-0.5">
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300 dark:text-slate-600">
                  <ArrowLeftRight size={24} />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">No transactions yet</p>
                <button 
                  onClick={() => setActiveTab('transactions')}
                  className="text-emerald-600 text-[10px] font-bold mt-1"
                >
                  Add your first expense
                </button>
              </div>
            ) : (
              recentTransactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      tx.type === 'income' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30" : "bg-rose-50 text-rose-600 dark:bg-rose-900/30"
                    )}>
                      {tx.type === 'income' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{tx.category}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{tx.merchantOrProvider || 'General'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "text-xs font-black",
                      tx.type === 'income' ? "text-emerald-600" : "text-slate-900 dark:text-white"
                    )}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </p>
                    <p className="text-[9px] text-slate-400">{new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Budget Progress */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Budget Progress</h3>
          <div className="space-y-4">
            {budgetProgress.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[10px] text-slate-400 italic">No budgets set for this month</p>
              </div>
            ) : (
              budgetProgress.map((item, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-[10px]">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{item.label}</span>
                    <span className="text-slate-500 dark:text-slate-400">
                      <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(item.spent)}</span> / {formatCurrency(item.limit)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full transition-all duration-1000", item.color)} 
                      style={{ width: `${Math.min((item.spent / item.limit) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
          <button 
            onClick={() => setActiveTab('budgets')}
            className="mt-6 w-full py-3 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 text-xs font-bold hover:border-emerald-500 hover:text-emerald-600 transition-all"
          >
            Manage Budgets
          </button>
        </div>
      </div>
    </div>
  );
};
