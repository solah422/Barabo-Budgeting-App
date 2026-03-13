import React, { useState } from 'react';
import { useApp } from '../providers/AppProvider';
import { 
  Plus, 
  ReceiptText, 
  Calendar, 
  Bell, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  MoreVertical,
  Check,
  Trash2
} from 'lucide-react';
import { formatCurrency, cn, formatDate, generateId } from '../utils';
import { Modal } from '../components/Modal';
import { UTILITY_PROVIDERS } from '../constants/maldives';

export const Bills: React.FC = () => {
  const { bills, storage, refreshData, accounts } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBill, setNewBill] = useState({
    providerName: UTILITY_PROVIDERS[0].name,
    amount: '',
    dueDate: new Date().toISOString().split('T')[0],
    category: UTILITY_PROVIDERS[0].type,
    notes: ''
  });

  const unpaidBills = bills.filter(b => b.status !== 'paid');
  const totalUnpaid = unpaidBills.reduce((sum, b) => sum + b.amount, 0);
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const paidThisMonth = bills.filter(b => {
    const d = new Date(b.dueDate);
    return b.status === 'paid' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).reduce((sum, b) => sum + b.amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30';
      case 'overdue': return 'text-rose-600 bg-rose-50 dark:bg-rose-900/30';
      default: return 'text-amber-600 bg-amber-50 dark:bg-amber-900/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle2 size={14} />;
      case 'overdue': return <AlertCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const handleAddBill = async () => {
    const amountNum = parseFloat(newBill.amount);
    if (isNaN(amountNum) || amountNum <= 0) return;
    
    await storage.bills.create({
      id: generateId(),
      providerName: newBill.providerName,
      amount: amountNum,
      dueDate: newBill.dueDate,
      category: newBill.category,
      notes: newBill.notes,
      status: new Date(newBill.dueDate) < new Date() ? 'overdue' : 'upcoming',
      currency: 'MVR',
      recurringFrequency: 'once',
      autopayEnabled: false,
      reminderDaysBefore: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    setIsModalOpen(false);
    setNewBill({
      providerName: UTILITY_PROVIDERS[0].name,
      amount: '',
      dueDate: new Date().toISOString().split('T')[0],
      category: UTILITY_PROVIDERS[0].type,
      notes: ''
    });
    await refreshData();
  };

  const handleMarkAsPaid = async (bill: any) => {
    // In a real app, we might want to select which account to pay from
    // For now, we'll just mark it as paid
    await storage.bills.update(bill.id, { 
      status: 'paid',
      lastPaidDate: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    // Also create a transaction for it
    if (accounts.length > 0) {
      const defaultAccount = accounts[0];
      await storage.transactions.create({
        id: generateId(),
        type: 'expense',
        amount: bill.amount,
        currency: bill.currency,
        exchangeRateToBase: 1,
        baseAmount: bill.amount,
        category: bill.category,
        accountId: defaultAccount.id,
        merchantOrProvider: bill.providerName,
        note: `Paid bill: ${bill.providerName}`,
        date: new Date().toISOString(),
        tags: ['bill'],
        status: 'completed',
        isRecurring: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Update account balance
      await storage.accounts.update(defaultAccount.id, {
        balance: defaultAccount.balance - bill.amount
      });
    }

    await refreshData();
  };

  const handleDeleteBill = async (id: string) => {
    await storage.bills.delete(id);
    await refreshData();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Bills & Utilities</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Manage your monthly utility payments</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-200 dark:shadow-none transition-all active:scale-95"
        >
          <Plus size={20} />
          Add New Bill
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Unpaid</p>
          <div className="flex flex-col gap-0.5">
            <span className="text-lg font-black text-rose-600 truncate">{formatCurrency(totalUnpaid, 'MVR')}</span>
            <span className="text-[9px] text-slate-400 font-medium">{unpaidBills.length} bills</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Paid This Month</p>
          <div className="flex flex-col gap-0.5">
            <span className="text-lg font-black text-emerald-600 truncate">{formatCurrency(paidThisMonth, 'MVR')}</span>
          </div>
        </div>
        <div className="bg-slate-900 dark:bg-emerald-600 p-3.5 rounded-2xl text-white shadow-lg hidden lg:block">
          <div className="flex items-center gap-2 mb-1.5">
            <Bell size={14} className="text-emerald-400 dark:text-white" />
            <p className="text-[9px] font-black uppercase tracking-widest">Next Due</p>
          </div>
          {unpaidBills.length > 0 ? (
            <div>
              <p className="text-sm font-bold truncate">{unpaidBills[0].providerName}</p>
              <p className="text-[10px] text-white/70">Due {formatDate(unpaidBills[0].dueDate)}</p>
            </div>
          ) : (
            <p className="text-xs font-medium">All caught up!</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Bills List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">All Bills</h3>
            <div className="flex gap-2">
              <span className="text-[10px] font-medium text-slate-400">Sort by:</span>
              <button className="text-[10px] font-bold text-emerald-600">Due Date</button>
            </div>
          </div>

          {bills.length === 0 ? (
            <div className="py-16 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center px-6">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600 mb-4">
                <ReceiptText size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No bills added yet</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mb-6">Add your monthly bills as you receive them to keep track of your utilities.</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-200 dark:shadow-none text-sm"
              >
                Add Your First Bill
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {bills.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).map(bill => (
                <div key={bill.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                  {bill.status === 'paid' && (
                    <div className="absolute top-0 right-0 p-1.5">
                      <div className="bg-emerald-500 text-white p-0.5 rounded-full">
                        <Check size={10} />
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        <ReceiptText size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[100px]">{bill.providerName}</h4>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{bill.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-black text-slate-900 dark:text-white">{formatCurrency(bill.amount, bill.currency)}</p>
                      <span className={cn(
                        "text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full inline-flex items-center gap-1 mt-0.5",
                        getStatusColor(bill.status)
                      )}>
                        {getStatusIcon(bill.status)}
                        {bill.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 mb-4">
                    <Calendar size={12} />
                    <span>Due {formatDate(bill.dueDate)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {bill.status !== 'paid' ? (
                      <button 
                        onClick={() => handleMarkAsPaid(bill)}
                        className="flex-1 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white py-2 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 size={12} />
                        Mark as Paid
                      </button>
                    ) : (
                      <div className="flex-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 py-2 rounded-lg text-[10px] font-bold text-center">
                        Paid {formatDate(bill.lastPaidDate || bill.updatedAt)}
                      </div>
                    )}
                    <button 
                      onClick={() => handleDeleteBill(bill.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Add New Bill"
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Provider</label>
            <select 
              value={newBill.providerName}
              onChange={(e) => {
                const provider = UTILITY_PROVIDERS.find(p => p.name === e.target.value);
                setNewBill({
                  ...newBill, 
                  providerName: e.target.value,
                  category: provider?.type || 'Utilities'
                });
              }}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
            >
              {UTILITY_PROVIDERS.map(p => (
                <option key={p.name} value={p.name}>{p.name}</option>
              ))}
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Amount (MVR)</label>
              <input 
                type="number" 
                placeholder="0.00"
                value={newBill.amount}
                onChange={(e) => setNewBill({...newBill, amount: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Due Date</label>
              <input 
                type="date" 
                value={newBill.dueDate}
                onChange={(e) => setNewBill({...newBill, dueDate: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Notes (Optional)</label>
            <input 
              type="text" 
              placeholder="Reference number, etc."
              value={newBill.notes}
              onChange={(e) => setNewBill({...newBill, notes: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
            />
          </div>

          <button 
            onClick={handleAddBill}
            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 transition-all active:scale-95"
          >
            Save Bill
          </button>
        </div>
      </Modal>
    </div>
  );
};
