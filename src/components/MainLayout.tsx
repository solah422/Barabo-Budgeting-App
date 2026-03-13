/**
 * Author: -Solah-
 * OS support: -Windows and Android Mobile-
 * Description: Main application layout with navigation and notification center.
 */
import React, { useState, useEffect } from 'react';
import { useApp } from '../providers/AppProvider';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { Menu, Plus, Bell, Search } from 'lucide-react';
import { Dashboard } from '../pages/Dashboard';
import { Transactions } from '../pages/Transactions';
import { Budgets } from '../pages/Budgets';
import { Bills } from '../pages/Bills';
import { Accounts } from '../pages/Accounts';
import { Reports } from '../pages/Reports';
import { Settings } from '../pages/Settings';
import { Onboarding } from '../pages/Onboarding';
import { AddTransactionModal } from './AddTransactionModal';
import { NotificationCenter } from './NotificationCenter';
import { Skeleton } from './Skeleton';
import { cn } from '../utils';

export const MainLayout: React.FC = () => {
  const { settings, loading, activeTab, setActiveTab, notifications } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="h-screen w-full bg-slate-50 dark:bg-slate-950 flex flex-col">
        <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4">
          <Skeleton className="w-24 h-6" />
          <div className="flex gap-3">
            <Skeleton className="w-8 h-8" />
            <Skeleton className="w-8 h-8" />
          </div>
        </header>
        <div className="flex-1 p-4 md:p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-[32px]" />
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (settings && !settings.onboardingCompleted) {
    return <Onboarding />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'transactions': return <Transactions />;
      case 'budgets': return <Budgets />;
      case 'bills': return <Bills />;
      case 'accounts': return <Accounts />;
      case 'reports': return <Reports />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col lg:flex-row">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
      />
      
      <main className="flex-1 flex flex-col min-w-0 lg:ml-64 pb-16 lg:pb-0">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="lg:hidden w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-sm">
              <Plus size={16} className="rotate-45" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white capitalize truncate max-w-[150px] md:max-w-none">
              {activeTab === 'dashboard' ? 'Barabo' : activeTab.replace('-', ' ')}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 md:gap-3">
            <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-1.5 gap-2 text-slate-500 dark:text-slate-400 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
              <Search size={16} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none outline-none text-sm w-32 lg:w-64 text-slate-900 dark:text-white"
              />
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg relative transition-colors"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border border-white dark:border-slate-900"></span>
                )}
              </button>
              <NotificationCenter 
                isOpen={isNotificationOpen} 
                onClose={() => setIsNotificationOpen(false)} 
              />
            </div>

            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="hidden lg:flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all active:scale-95"
            >
              <Plus size={16} />
              <span>Add New</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-4 md:p-6 overflow-x-hidden">
          {renderContent()}
        </div>
      </main>

      <BottomNav 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onMoreClick={() => setIsSidebarOpen(true)}
        onAddClick={() => setIsAddModalOpen(true)}
      />

      <AddTransactionModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>
  );
};

/** --- End of MainLayout.tsx --- */
