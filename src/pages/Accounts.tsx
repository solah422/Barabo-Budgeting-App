import React, { useState } from 'react';
import { useApp } from '../providers/AppProvider';
import { 
  Plus, 
  Wallet, 
  CreditCard, 
  Banknote, 
  MoreVertical,
  ExternalLink,
  History,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { formatCurrency, cn, generateId } from '../utils';
import { Modal } from '../components/Modal';

export const Accounts: React.FC = () => {
  const { accounts, transactions, storage, refreshData } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: '',
    institutionName: '',
    accountType: 'savings' as const,
    currency: 'MVR',
    balance: 0,
    color: '#10b981'
  });

  const getAccountStats = (accountId: string) => {
    const accountTxs = transactions.filter(t => t.accountId === accountId);
    const income = accountTxs.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
    const expense = accountTxs.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    return { income, expense };
  };

  const handleAddAccount = async () => {
    if (!newAccount.name || !newAccount.institutionName) return;
    
    await storage.accounts.create({
      id: generateId(),
      ...newAccount,
      openingBalance: newAccount.balance,
      isArchived: false,
      includeInNetWorth: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    setIsModalOpen(false);
    setNewAccount({
      name: '',
      institutionName: '',
      accountType: 'savings',
      currency: 'MVR',
      balance: 0,
      color: '#10b981'
    });
    await refreshData();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Summary Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Your Accounts</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Manage your banks, wallets and cash</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-slate-200 dark:shadow-none transition-all active:scale-95"
        >
          <Plus size={20} />
          Add Account
        </button>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Add New Account"
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Account Name</label>
            <input 
              type="text" 
              placeholder="e.g. BML Savings"
              value={newAccount.name}
              onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Institution</label>
            <input 
              type="text" 
              placeholder="e.g. Bank of Maldives"
              value={newAccount.institutionName}
              onChange={(e) => setNewAccount({...newAccount, institutionName: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Type</label>
              <select 
                value={newAccount.accountType}
                onChange={(e) => setNewAccount({...newAccount, accountType: e.target.value as any})}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
              >
                <option value="savings">Savings</option>
                <option value="checking">Checking</option>
                <option value="cash">Cash</option>
                <option value="credit">Credit Card</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Initial Balance</label>
              <input 
                type="number" 
                value={newAccount.balance}
                onChange={(e) => setNewAccount({...newAccount, balance: parseFloat(e.target.value)})}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Card Color</label>
            <div className="flex gap-3">
              {['#10b981', '#3b82f6', '#f59e0b', '#f43f5e', '#8b5cf6', '#0f172a'].map(color => (
                <button
                  key={color}
                  onClick={() => setNewAccount({...newAccount, color})}
                  className={cn(
                    "w-8 h-8 rounded-full transition-all",
                    newAccount.color === color ? "ring-2 ring-offset-2 ring-slate-400 scale-110" : "opacity-50 hover:opacity-100"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <button 
            onClick={handleAddAccount}
            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 transition-all"
          >
            Create Account
          </button>
        </div>
      </Modal>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.length === 0 ? (
          <div className="col-span-full py-16 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center px-6">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600 mb-4">
              <Wallet size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No accounts added yet</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mb-6">Add your Bank of Maldives or Maldives Islamic Bank accounts to start tracking.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-200 dark:shadow-none text-sm"
            >
              Add First Account
            </button>
          </div>
        ) : (
          accounts.map(account => {
            const stats = getAccountStats(account.id);
            return (
              <div key={account.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group overflow-hidden">
                {/* Card Header */}
                <div className="p-4 pb-0">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md" style={{ backgroundColor: account.color }}>
                        {account.accountType === 'savings' ? <Banknote size={20} /> : <CreditCard size={20} />}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{account.name}</h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{account.institutionName}</p>
                      </div>
                    </div>
                    <button className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all">
                      <MoreVertical size={18} />
                    </button>
                  </div>

                  <div className="mb-6">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Current Balance</p>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      {formatCurrency(account.balance, account.currency)}
                    </h3>
                  </div>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-2 border-t border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
                  <div className="p-3 border-r border-slate-50 dark:border-slate-800">
                    <div className="flex items-center gap-1 text-emerald-600 mb-0.5">
                      <ArrowUpRight size={12} />
                      <span className="text-[9px] font-black uppercase tracking-wider">Income</span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{formatCurrency(stats.income, account.currency)}</p>
                  </div>
                  <div className="p-3">
                    <div className="flex items-center gap-1 text-rose-600 mb-0.5">
                      <ArrowDownRight size={12} />
                      <span className="text-[9px] font-black uppercase tracking-wider">Expense</span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{formatCurrency(stats.expense, account.currency)}</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="p-3 flex items-center gap-2">
                  <button className="flex-1 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-1.5">
                    <History size={12} />
                    History
                  </button>
                  <button className="flex-1 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-1.5">
                    <ExternalLink size={12} />
                    Details
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
