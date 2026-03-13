/**
 * Author: -Solah-
 * OS support: -Windows and Android Mobile-
 * Description: Application context provider for managing global state and business logic.
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { IStorageProvider } from '../repositories/interfaces';
import { LocalStorageProvider } from '../repositories/LocalStorageProvider';
import { Account, Bill, Budget, Debt, Transaction, UserSettings, Notification } from '../types';

interface AppContextType {
  storage: IStorageProvider;
  settings: UserSettings | null;
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  bills: Bill[];
  debts: Debt[];
  notifications: Notification[];
  loading: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  transactionFilter: { search: string; type: string } | null;
  setTransactionFilter: (filter: { search: string; type: string } | null) => void;
  refreshData: () => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [storage] = useState<IStorageProvider>(new LocalStorageProvider());
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactionFilter, setTransactionFilter] = useState<{ search: string; type: string } | null>(null);

  const refreshData = async () => {
    const [s, acc, tx, bud, bl, db] = await Promise.all([
      storage.settings.getSettings(),
      storage.accounts.getAll(),
      storage.transactions.getAll(),
      storage.budgets.getAll(),
      storage.bills.getAll(),
      storage.debts.getAll(),
    ]);
    setSettings(s);
    setAccounts(acc);
    setTransactions(tx);
    setBudgets(bud);
    setBills(bl);
    setDebts(db);
    
    generateBillReminders(bl);
  };

  const generateBillReminders = (currentBills: Bill[]) => {
    const today = new Date();
    const newNotifications: Notification[] = [];
    
    currentBills.forEach(bill => {
      if (bill.status === 'paid') return;
      
      const dueDate = new Date(bill.dueDate);
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays >= 0 && diffDays <= 3) {
        const id = `bill-reminder-${bill.id}-${bill.dueDate}`;
        newNotifications.push({
          id,
          title: 'Bill Reminder',
          message: `Your bill for ${bill.providerName} is due in ${diffDays === 0 ? 'today' : diffDays + ' days'}.`,
          type: 'bill',
          date: new Date().toISOString(),
          isRead: false,
          link: 'bills'
        });
      }
    });

    setNotifications(prev => {
      const existingIds = new Set(prev.map(n => n.id));
      const uniqueNew = newNotifications.filter(n => !existingIds.has(n.id));
      return [...uniqueNew, ...prev];
    });
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    const updated = await storage.settings.updateSettings(newSettings);
    setSettings(updated);
  };

  useEffect(() => {
    refreshData().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (settings?.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings?.theme]);

  // Apply accent color to CSS variables
  useEffect(() => {
    if (!settings?.accentColor) return;
    
    const colors: Record<string, string> = {
      emerald: '#10b981',
      blue: '#3b82f6',
      violet: '#8b5cf6',
      rose: '#f43f5e',
      amber: '#f59e0b'
    };
    
    const color = colors[settings.accentColor];
    document.documentElement.style.setProperty('--accent-color', color);
  }, [settings?.accentColor]);

  return (
    <AppContext.Provider
      value={{
        storage,
        settings,
        accounts,
        transactions,
        budgets,
        bills,
        debts,
        notifications,
        loading,
        activeTab,
        setActiveTab,
        transactionFilter,
        setTransactionFilter,
        refreshData,
        updateSettings,
        markNotificationAsRead,
        clearNotifications,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

/** --- End of AppProvider.tsx --- */
