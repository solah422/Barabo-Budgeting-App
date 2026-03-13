import React from 'react';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  PieChart, 
  Wallet,
  MoreHorizontal,
  Plus
} from 'lucide-react';
import { cn } from '../utils';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onMoreClick: () => void;
  onAddClick: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ 
  activeTab, 
  setActiveTab, 
  onMoreClick,
  onAddClick
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'transactions', label: 'Activity', icon: ArrowLeftRight },
    { id: 'add', label: 'Add', icon: Plus, isAction: true },
    { id: 'budgets', label: 'Budgets', icon: PieChart },
    { id: 'more', label: 'More', icon: MoreHorizontal },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1 z-40 pb-safe">
      <div className="flex items-center justify-around h-12">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          if (item.isAction) {
            return (
              <button
                key={item.id}
                onClick={onAddClick}
                className="flex flex-col items-center justify-center -mt-6"
              >
                <div className="w-11 h-11 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-md shadow-emerald-200 dark:shadow-none border-2 border-white dark:border-slate-900">
                  <Plus size={20} />
                </div>
                <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{item.label}</span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'more') {
                  onMoreClick();
                } else {
                  setActiveTab(item.id);
                }
              }}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-2 min-w-[60px] transition-all",
                isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"
              )}
            >
              <Icon size={20} className={cn("transition-transform", isActive && "scale-110")} />
              <span className={cn(
                "text-[9px] font-semibold mt-0.5",
                isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
