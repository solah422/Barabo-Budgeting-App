import React, { useRef, useEffect } from 'react';
import { useApp } from '../providers/AppProvider';
import { Bell, X, Check, Trash2, Calendar, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationAsRead, clearNotifications, setActiveTab } = useApp();
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'bill': return <Calendar size={16} className="text-blue-500" />;
      case 'budget': return <AlertCircle size={16} className="text-amber-500" />;
      default: return <Info size={16} className="text-emerald-500" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className="absolute right-0 mt-2 w-80 md:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden"
        >
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-emerald-600" />
              <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-emerald-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <button 
                  onClick={clearNotifications}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Clear all"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button 
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {notifications.length > 0 ? (
              <div className="divide-y divide-slate-50 dark:divide-slate-800">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={cn(
                      "p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer relative group",
                      !notification.isRead && "bg-emerald-50/30 dark:bg-emerald-900/10"
                    )}
                    onClick={() => {
                      markNotificationAsRead(notification.id);
                      if (notification.link) {
                        setActiveTab(notification.link);
                        onClose();
                      }
                    }}
                  >
                    <div className="flex gap-3">
                      <div className="mt-1">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className={cn(
                            "text-sm font-bold truncate",
                            notification.isRead ? "text-slate-600 dark:text-slate-400" : "text-slate-900 dark:text-white"
                          )}>
                            {notification.title}
                          </p>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">
                            {new Date(notification.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                    {!notification.isRead && (
                      <div className="absolute top-4 right-2 w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 px-4 text-center">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <Bell size={24} />
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">All caught up!</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">No new notifications at the moment.</p>
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-center">
              <button 
                onClick={() => {
                  notifications.forEach(n => markNotificationAsRead(n.id));
                }}
                className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest hover:underline"
              >
                Mark all as read
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
