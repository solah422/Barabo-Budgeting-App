/**
 * Author: -Solah-
 * OS support: -Windows and Android Mobile-
 * Description: Transactions page with search, filtering, and swipe actions.
 */
import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../providers/AppProvider';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight, 
  MoreVertical,
  Download,
  Calendar,
  ArrowLeftRight,
  Trash2,
  Edit3,
  CheckSquare,
  Square,
  X,
  Edit2
} from 'lucide-react';
import { formatCurrency, cn, formatDate } from '../utils';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants/maldives';
import { Modal } from '../components/Modal';

export const Transactions: React.FC = () => {
  const { transactions, accounts, storage, refreshData, transactionFilter, setTransactionFilter } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  useEffect(() => {
    if (transactionFilter) {
      if (transactionFilter.search) setSearchTerm(transactionFilter.search);
      if (transactionFilter.type) setFilterType(transactionFilter.type as any);
      setTransactionFilter(null);
    }
  }, [transactionFilter, setTransactionFilter]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const allCategories = [...new Set([...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES.map(c => c.name)])];
  
  const autocompleteSuggestions = useMemo(() => {
    if (!searchTerm) return [];
    const merchants = Array.from(new Set(transactions.map(t => t.merchantOrProvider).filter(Boolean)));
    const categories = Array.from(new Set(transactions.map(t => t.category)));
    const all = [...merchants, ...categories] as string[];
    return all.filter(s => s.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5);
  }, [searchTerm, transactions]);

  const triggerHaptic = () => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
  };

  const handleDelete = async (id: string) => {
    triggerHaptic();
    await storage.transactions.delete(id);
    await refreshData();
  };
  
  const filteredTransactions = transactions
    .filter(t => {
      const matchesSearch = t.category.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (t.merchantOrProvider?.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = filterType === 'all' || t.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredTransactions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTransactions.map(t => t.id));
    }
  };

  const handleBulkDelete = async () => {
    for (const id of selectedIds) {
      await storage.transactions.delete(id);
    }
    setSelectedIds([]);
    setIsDeleteModalOpen(false);
    await refreshData();
  };

  const handleBulkCategoryChange = async (category: string) => {
    for (const id of selectedIds) {
      await storage.transactions.update(id, { category });
    }
    setIsBulkEditOpen(false);
    setSelectedIds([]);
    await refreshData();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm w-fit">
          <button 
            onClick={() => setFilterType('all')}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-bold transition-all",
              filterType === 'all' ? "bg-slate-900 dark:bg-emerald-600 text-white shadow-lg" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            All
          </button>
          <button 
            onClick={() => setFilterType('income')}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-bold transition-all",
              filterType === 'income' ? "bg-emerald-600 text-white shadow-lg" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            Income
          </button>
          <button 
            onClick={() => setFilterType('expense')}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-bold transition-all",
              filterType === 'expense' ? "bg-rose-600 text-white shadow-lg" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            Expenses
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowAutocomplete(true);
              }}
              onFocus={() => setShowAutocomplete(true)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm dark:text-white"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}

            {/* Autocomplete Dropdown */}
            <AnimatePresence>
              {showAutocomplete && autocompleteSuggestions.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
                >
                  {autocompleteSuggestions.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSearchTerm(suggestion);
                        setShowAutocomplete(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-3"
                    >
                      <Search size={14} className="text-slate-400" />
                      {suggestion}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
            <Filter size={20} />
          </button>
          <button className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
            <Download size={20} />
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-slate-900 dark:bg-emerald-600 text-white px-6 py-4 rounded-[32px] flex items-center justify-between shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-4">
            <span className="text-sm font-black">{selectedIds.length} selected</span>
            <div className="h-4 w-px bg-white/20" />
            <div className="relative">
              <button 
                onClick={() => setIsBulkEditOpen(!isBulkEditOpen)}
                className="flex items-center gap-2 text-sm font-bold hover:text-emerald-200 transition-colors"
              >
                <Edit3 size={18} />
                Change Category
              </button>
              {isBulkEditOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 py-2 z-50">
                  <p className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Category</p>
                  <div className="max-h-64 overflow-y-auto custom-scrollbar">
                    {allCategories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => handleBulkCategoryChange(cat)}
                        className="w-full text-left px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <button 
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex items-center gap-2 text-sm font-bold text-rose-200 hover:text-rose-100 transition-colors"
          >
            <Trash2 size={18} />
            Delete
          </button>
        </div>
      )}

      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        title="Confirm Bulk Delete"
      >
        <div className="space-y-6">
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-white">{selectedIds.length}</span> transactions? This action cannot be undone.
          </p>
          <div className="flex gap-4">
            <button 
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-bold"
            >
              Cancel
            </button>
            <button 
              onClick={handleBulkDelete}
              className="flex-1 py-3 bg-rose-600 text-white rounded-2xl font-bold shadow-lg shadow-rose-200 dark:shadow-none"
            >
              Delete All
            </button>
          </div>
        </div>
      </Modal>

      {/* Transactions List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-4 w-10">
                  <button onClick={toggleSelectAll} className="text-slate-400 hover:text-emerald-600 transition-colors">
                    {selectedIds.length === filteredTransactions.length && filteredTransactions.length > 0 ? <CheckSquare size={20} /> : <Square size={20} />}
                  </button>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Transaction</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Account</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600">
                        <ArrowLeftRight size={32} />
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 font-medium">No transactions found</p>
                      <button className="text-emerald-600 text-sm font-bold">Clear filters</button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const account = accounts.find(a => a.id === tx.accountId);
                  const isSelected = selectedIds.includes(tx.id);
                  return (
                    <tr 
                      key={tx.id} 
                      className={cn(
                        "hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group",
                        isSelected && "bg-emerald-50/30 dark:bg-emerald-900/10"
                      )}
                    >
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => toggleSelect(tx.id)}
                          className={cn(
                            "transition-colors",
                            isSelected ? "text-emerald-600" : "text-slate-300 hover:text-slate-400"
                          )}
                        >
                          {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            tx.type === 'income' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30" : "bg-rose-50 text-rose-600 dark:bg-rose-900/30"
                          )}>
                            {tx.type === 'income' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{tx.merchantOrProvider || 'General'}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{tx.note || 'No notes'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-bold">
                          {tx.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: account?.color || '#cbd5e1' }} />
                          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{account?.name || 'Unknown'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                          <Calendar size={14} />
                          <p className="text-xs font-medium">{formatDate(tx.date)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className={cn(
                          "text-sm font-black",
                          tx.type === 'income' ? "text-emerald-600" : "text-slate-900 dark:text-white"
                        )}>
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, tx.currency)}
                        </p>
                        {tx.currency !== 'MVR' && (
                          <p className="text-[10px] text-slate-400 font-bold">
                            ≈ {formatCurrency(tx.baseAmount, 'MVR')}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile List View */}
        <div className="md:hidden divide-y divide-slate-50 dark:divide-slate-800">
          {filteredTransactions.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600">
                  <ArrowLeftRight size={24} />
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">No transactions found</p>
              </div>
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const account = accounts.find(a => a.id === tx.accountId);
              const isSelected = selectedIds.includes(tx.id);
              return (
                <SwipeableTransactionItem 
                  key={tx.id}
                  transaction={tx}
                  accountName={account?.name || 'Unknown'}
                  isSelected={isSelected}
                  onToggleSelect={() => toggleSelect(tx.id)}
                  onDelete={() => handleDelete(tx.id)}
                  onEdit={() => {
                    // Logic for editing (could open a modal)
                    console.log('Edit', tx.id);
                  }}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

interface SwipeableTransactionItemProps {
  transaction: any;
  accountName: string;
  isSelected: boolean;
  onToggleSelect: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

const SwipeableTransactionItem: React.FC<SwipeableTransactionItemProps> = ({ 
  transaction, 
  accountName, 
  isSelected, 
  onToggleSelect, 
  onDelete, 
  onEdit 
}) => {
  const x = useMotionValue(0);
  const deleteScale = useTransform(x, [-100, -50], [1.2, 0.8]);
  const editScale = useTransform(x, [50, 100], [0.8, 1.2]);

  return (
    <div className="relative overflow-hidden bg-slate-100 dark:bg-slate-800">
      {/* Background Actions */}
      <div className="absolute inset-0 flex items-center justify-between px-6">
        <div className="flex items-center gap-2 text-blue-600">
          <motion.div style={{ scale: editScale }}>
            <Edit2 size={20} />
          </motion.div>
          <span className="text-xs font-bold">Edit</span>
        </div>
        <div className="flex items-center gap-2 text-rose-600">
          <span className="text-xs font-bold">Delete</span>
          <motion.div style={{ scale: deleteScale }}>
            <Trash2 size={20} />
          </motion.div>
        </div>
      </div>

      {/* Foreground Content */}
      <motion.div
        style={{ x }}
        drag="x"
        dragConstraints={{ left: -100, right: 100 }}
        onDragEnd={(_, info) => {
          if (info.offset.x > 70) {
            onEdit();
          } else if (info.offset.x < -70) {
            onDelete();
          }
          x.set(0);
        }}
        onClick={onToggleSelect}
        className={cn(
          "relative bg-white dark:bg-slate-900 p-3.5 flex items-center gap-3 transition-colors active:bg-slate-50 dark:active:bg-slate-800",
          isSelected && "bg-emerald-50/30 dark:bg-emerald-900/10"
        )}
      >
        <div className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
          transaction.type === 'income' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30" : "bg-rose-50 text-rose-600 dark:bg-rose-900/30"
        )}>
          {transaction.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{transaction.merchantOrProvider || 'General'}</p>
            <p className={cn(
              "text-sm font-black",
              transaction.type === 'income' ? "text-emerald-600" : "text-slate-900 dark:text-white"
            )}>
              {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount, transaction.currency)}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{transaction.category}</span>
              <span className="text-[10px] text-slate-300">•</span>
              <span className="text-[10px] font-bold text-slate-400 truncate max-w-[80px]">{accountName}</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">{formatDate(transaction.date)}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

/** --- End of Transactions.tsx --- */

