/**
 * Author: -Solah-
 * OS support: -Windows and Android Mobile-
 * Description: Modal component for adding new financial transactions.
 */
import React, { useState } from 'react';
import { useApp } from '../providers/AppProvider';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../constants/maldives';
import { cn, generateId } from '../utils';
import { TransactionType } from '../types';
import { Modal } from './Modal';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose }) => {
  const { accounts, storage, refreshData } = useApp();
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [accountId, setAccountId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  const triggerHaptic = () => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category || !accountId) return;

    triggerHaptic();
    const account = accounts.find(a => a.id === accountId);
    if (!account) return;

    const numAmount = parseFloat(amount);
    
    await storage.transactions.create({
      id: generateId(),
      type,
      amount: numAmount,
      currency: account.currency,
      exchangeRateToBase: 1,
      baseAmount: numAmount,
      category,
      accountId,
      date: new Date(date).toISOString(),
      tags: [],
      status: 'completed',
      isRecurring: false,
      note,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Update account balance
    const newBalance = type === 'income' ? account.balance + numAmount : account.balance - numAmount;
    await storage.accounts.update(accountId, { balance: newBalance });

    await refreshData();
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Add Transaction"
      className="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type Selector */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all",
              type === 'expense' ? "bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm" : "text-slate-500 dark:text-slate-400"
            )}
          >
            <ArrowDownRight size={18} />
            Expense
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all",
              type === 'income' ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm" : "text-slate-500 dark:text-slate-400"
            )}
          >
            <ArrowUpRight size={18} />
            Income
          </button>
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-400">MVR</span>
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-20 pr-6 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl text-3xl font-black text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Account Selector */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Account</label>
            <select
              required
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
            >
              <option value="">Select Account</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
          </div>

          {/* Category Selector */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
            <select
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
            >
              <option value="">Select Category</option>
              {type === 'income' 
                ? INCOME_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)
                : EXPENSE_CATEGORIES.map(cat => <option key={cat.name} value={cat.name}>{cat.name}</option>)
              }
            </select>
          </div>
        </div>

        {/* Date Input */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
          />
        </div>

        {/* Note Input */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Note (Optional)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What was this for?"
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
          />
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-slate-900 dark:bg-emerald-600 text-white rounded-2xl font-bold shadow-xl hover:bg-slate-800 dark:hover:bg-emerald-700 transition-all active:scale-95"
        >
          Save Transaction
        </button>
      </form>
    </Modal>
  );
};

/** --- End of AddTransactionModal.tsx --- */
