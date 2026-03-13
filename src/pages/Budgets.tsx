import React, { useState } from 'react';
import { useApp } from '../providers/AppProvider';
import { 
  Plus, 
  PieChart, 
  TrendingUp, 
  AlertTriangle, 
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  History
} from 'lucide-react';
import { formatCurrency, cn, generateId } from '../utils';
import { Modal } from '../components/Modal';
import { EXPENSE_CATEGORIES } from '../constants/maldives';

export const Budgets: React.FC = () => {
  const { budgets, transactions, storage, refreshData } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBudget, setNewBudget] = useState({
    category: EXPENSE_CATEGORIES[0].name,
    plannedAmount: 0,
    period: 'monthly' as const
  });

  const getSpentAmount = (category: string) => {
    return transactions
      .filter(t => t.type === 'expense' && t.category === category && new Date(t.date).getMonth() === new Date().getMonth())
      .reduce((acc, curr) => acc + curr.baseAmount, 0);
  };

  const handleAddBudget = async () => {
    if (newBudget.plannedAmount <= 0) return;
    
    await storage.budgets.create({
      id: generateId(),
      ...newBudget,
      spentAmount: getSpentAmount(newBudget.category),
      currency: 'MVR',
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
      endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    setIsModalOpen(false);
    setNewBudget({
      category: EXPENSE_CATEGORIES[0].name,
      plannedAmount: 0,
      period: 'monthly'
    });
    await refreshData();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Monthly Budgets</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Plan your spending and save more</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm">
            <History size={20} />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-slate-200 dark:shadow-none transition-all active:scale-95"
          >
            <Plus size={20} />
            Create Budget
          </button>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Set Monthly Budget"
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
            <select 
              value={newBudget.category}
              onChange={(e) => setNewBudget({...newBudget, category: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
            >
              {EXPENSE_CATEGORIES.map(cat => (
                <option key={cat.name} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Monthly Limit (MVR)</label>
            <input 
              type="number" 
              placeholder="e.g. 5000"
              value={newBudget.plannedAmount || ''}
              onChange={(e) => setNewBudget({...newBudget, plannedAmount: parseFloat(e.target.value)})}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
            />
          </div>
          <button 
            onClick={handleAddBudget}
            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 transition-all"
          >
            Save Budget
          </button>
        </div>
      </Modal>

      {budgets.length === 0 ? (
        <div className="py-16 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center px-6">
          <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600 mb-4">
            <PieChart size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No budgets set up</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mb-6">Set limits for categories like Groceries or Dining to keep your spending in check.</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-200 dark:shadow-none text-sm"
          >
            Set First Budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map(budget => {
            const spent = getSpentAmount(budget.category);
            const progress = (spent / budget.plannedAmount) * 100;
            const isOver = spent > budget.plannedAmount;

            return (
              <div key={budget.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      <PieChart size={18} />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{budget.category}</h4>
                  </div>
                  {isOver && <AlertTriangle size={18} className="text-rose-500 animate-pulse" />}
                </div>

                <div className="space-y-3">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Spent</p>
                      <h3 className={cn("text-xl font-black tracking-tight", isOver ? "text-rose-600" : "text-slate-900 dark:text-white")}>
                        {formatCurrency(spent)}
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Budget</p>
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-400">{formatCurrency(budget.plannedAmount)}</p>
                    </div>
                  </div>

                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-1000",
                        isOver ? "bg-rose-500" : progress > 80 ? "bg-amber-500" : "bg-emerald-500"
                      )} 
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className={cn(isOver ? "text-rose-600" : "text-slate-500 dark:text-slate-400")}>
                      {progress.toFixed(0)}% used
                    </span>
                    <span className="text-slate-400 dark:text-slate-500">
                      {isOver 
                        ? `${formatCurrency(spent - budget.plannedAmount)} over` 
                        : `${formatCurrency(budget.plannedAmount - spent)} left`}
                    </span>
                  </div>
                </div>

                <button className="mt-4 w-full py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-400 transition-all flex items-center justify-center gap-1.5">
                  View Details
                  <ChevronRight size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
