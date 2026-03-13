/**
 * Author: -Solah-
 * OS support: -Windows and Android Mobile-
 * Description: Settings page for application configuration and appearance.
 */
import React, { useRef } from 'react';
import { useApp } from '../providers/AppProvider';
import { 
  Download, 
  Upload, 
  Trash2, 
  Moon, 
  Sun, 
  Globe, 
  Bell,
  Shield,
  Database,
  ChevronRight,
  User,
  Palette,
  RefreshCw,
  Check
} from 'lucide-react';
import { cn } from '../utils';
import { Modal } from '../components/Modal';

export const Settings: React.FC = () => {
  const { settings, updateSettings, storage, refreshData } = useApp();
  const [activeSection, setActiveSection] = React.useState('general');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isResetModalOpen, setIsResetModalOpen] = React.useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = React.useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);
  const [importJson, setImportJson] = React.useState('');
  const [importError, setImportError] = React.useState('');

  const handleExport = async () => {
    try {
      const data = await storage.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `barabo_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = event.target?.result as string;
        await storage.importData(json);
        await refreshData();
        window.location.reload();
      } catch (error) {
        console.error('Import failed:', error);
      }
    };
    reader.readAsText(file);
  };

  const handleTextImport = async () => {
    try {
      if (!importJson.trim()) {
        setImportError('Please paste your backup JSON');
        return;
      }
      await storage.importData(importJson);
      setIsImportModalOpen(false);
      window.location.reload();
    } catch (error) {
      setImportError('Invalid backup data format');
    }
  };

  const handleResetData = async () => {
    await storage.clearAll();
    setIsResetModalOpen(false);
    window.location.reload();
  };

  const handleDemoData = async () => {
    // Basic demo data seeding
    const demoAccounts = [
      { id: '1', name: 'BML Savings', institutionName: 'Bank of Maldives', institutionType: 'bank', accountType: 'savings', balance: 25000, openingBalance: 25000, currency: 'MVR', color: '#e11d48', isArchived: false, includeInNetWorth: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: '2', name: 'MIB Checking', institutionName: 'Maldives Islamic Bank', institutionType: 'bank', accountType: 'checking', balance: 12000, openingBalance: 12000, currency: 'MVR', color: '#059669', isArchived: false, includeInNetWorth: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: '3', name: 'Cash Wallet', institutionName: 'Cash', institutionType: 'cash', accountType: 'cash', balance: 1500, openingBalance: 1500, currency: 'MVR', color: '#f59e0b', isArchived: false, includeInNetWorth: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ];

    const demoTransactions = [
      { id: 't1', type: 'expense', amount: 1200, currency: 'MVR', exchangeRateToBase: 1, baseAmount: 1200, category: 'Groceries', accountId: '1', date: new Date().toISOString(), status: 'completed', tags: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), note: 'Weekly shopping' },
      { id: 't2', type: 'income', amount: 15000, currency: 'MVR', exchangeRateToBase: 1, baseAmount: 15000, category: 'Salary', accountId: '1', date: new Date().toISOString(), status: 'completed', tags: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), note: 'Monthly salary' },
      { id: 't3', type: 'expense', amount: 500, currency: 'MVR', exchangeRateToBase: 1, baseAmount: 500, category: 'Dining', accountId: '2', date: new Date().toISOString(), status: 'completed', tags: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), note: 'Dinner with friends' },
    ];

    const demoBills = [
      { id: 'b1', providerName: 'Dhiraagu', category: 'Internet', amount: 999, currency: 'MVR', dueDate: '2026-03-15', status: 'upcoming', recurringFrequency: 'monthly', autopayEnabled: false, reminderDaysBefore: 3, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'b2', providerName: 'STELCO', category: 'Electricity', amount: 1500, currency: 'MVR', dueDate: '2026-03-20', status: 'upcoming', recurringFrequency: 'monthly', autopayEnabled: false, reminderDaysBefore: 3, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ];

    await storage.clearAll();
    for (const acc of demoAccounts) await storage.accounts.create(acc as any);
    for (const tx of demoTransactions) await storage.transactions.create(tx as any);
    for (const bill of demoBills) await storage.bills.create(bill as any);
    
    await updateSettings({ onboardingCompleted: true, name: 'Demo User' });
    setIsDemoModalOpen(false);
    window.location.reload();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Settings</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Customize your budgeting experience</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {/* Navigation */}
        <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-hide">
          {[
            { id: 'general', label: 'General', icon: User },
            { id: 'appearance', label: 'Appearance', icon: Palette },
            { id: 'currency', label: 'Currency', icon: Globe },
            { id: 'data', label: 'Data', icon: Database },
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={cn(
                "flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                activeSection === item.id 
                  ? "bg-slate-900 dark:bg-emerald-600 text-white shadow-lg" 
                  : "text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
              )}
            >
              <item.icon size={18} />
              <span className="whitespace-nowrap">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="md:col-span-2 space-y-6">
          {activeSection === 'general' && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <User size={20} className="text-emerald-600" />
                Profile
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Your Name</label>
                  <input 
                    type="text" 
                    value={settings?.name || ''}
                    onChange={(e) => updateSettings({ name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'appearance' && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Palette size={20} className="text-amber-500" />
                Appearance
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Dark Mode</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Switch between light and dark themes</p>
                  </div>
                  <button 
                    onClick={() => updateSettings({ theme: settings?.theme === 'dark' ? 'light' : 'dark' })}
                    className={cn(
                      "w-12 h-6 rounded-full transition-all relative",
                      settings?.theme === 'dark' ? "bg-emerald-600" : "bg-slate-200 dark:bg-slate-700"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                      settings?.theme === 'dark' ? "left-7" : "left-1"
                    )} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Accent Color</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Choose your primary theme color</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { id: 'emerald', color: 'bg-emerald-500', label: 'Emerald' },
                      { id: 'blue', color: 'bg-blue-500', label: 'Blue' },
                      { id: 'violet', color: 'bg-violet-500', label: 'Violet' },
                      { id: 'rose', color: 'bg-rose-500', label: 'Rose' },
                      { id: 'amber', color: 'bg-amber-500', label: 'Amber' },
                    ].map((accent) => (
                      <button
                        key={accent.id}
                        onClick={() => updateSettings({ accentColor: accent.id as any })}
                        className={cn(
                          "group flex flex-col items-center gap-2 transition-all",
                          settings?.accentColor === accent.id ? "scale-110" : "opacity-60 hover:opacity-100"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-2xl shadow-sm flex items-center justify-center transition-all",
                          accent.color,
                          settings?.accentColor === accent.id ? "ring-4 ring-slate-100 dark:ring-slate-800" : ""
                        )}>
                          {settings?.accentColor === accent.id && <Check size={18} className="text-white" />}
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{accent.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'currency' && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe size={20} className="text-blue-500" />
                Currency & Locale
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Primary Currency</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Default currency for all totals</p>
                  </div>
                  <select 
                    value={settings?.primaryCurrency}
                    onChange={(e) => updateSettings({ primaryCurrency: e.target.value as any })}
                    className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold px-4 py-2 outline-none dark:text-white"
                  >
                    <option value="MVR">MVR (Rufiyaa)</option>
                    <option value="USD">USD (Dollar)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Exchange Rate (USD to MVR)</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Manual rate for conversions</p>
                  </div>
                  <input 
                    type="number" 
                    value={settings?.exchangeRates.USD}
                    onChange={(e) => updateSettings({ exchangeRates: { ...settings?.exchangeRates, USD: parseFloat(e.target.value) } })}
                    className="w-24 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold px-4 py-2 outline-none text-right dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'data' && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Database size={20} className="text-emerald-500" />
                Data Management
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={handleExport}
                  className="flex flex-col items-center gap-2 p-4 bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-2xl transition-all group"
                >
                  <Download size={24} className="text-slate-400 group-hover:text-emerald-600" />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Export Backup</span>
                </button>
                <button 
                  onClick={() => setIsImportModalOpen(true)}
                  className="flex flex-col items-center gap-2 p-4 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-2xl transition-all group"
                >
                  <Upload size={24} className="text-slate-400 group-hover:text-blue-600" />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Import Backup</span>
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileImport} 
                  accept=".json" 
                  className="hidden" 
                />
              </div>

              <div className="grid grid-cols-1 gap-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                <button 
                  onClick={() => setIsDemoModalOpen(true)}
                  className="w-full flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-2xl transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <RefreshCw size={20} className="text-blue-600" />
                    <span className="text-sm font-bold text-blue-900 dark:text-blue-400">Seed Demo Data</span>
                  </div>
                  <ChevronRight size={18} className="text-blue-400" />
                </button>

                <button 
                  onClick={() => setIsResetModalOpen(true)}
                  className="w-full flex items-center justify-between p-4 bg-rose-50 dark:bg-rose-900/10 hover:bg-rose-100 dark:hover:bg-rose-900/20 rounded-2xl transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Trash2 size={20} className="text-rose-600" />
                    <span className="text-sm font-bold text-rose-900 dark:text-rose-400">Reset All Data</span>
                  </div>
                  <ChevronRight size={18} className="text-rose-400" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Modal 
        isOpen={isResetModalOpen} 
        onClose={() => setIsResetModalOpen(false)} 
        title="Reset All Data"
      >
        <div className="space-y-6">
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Are you sure you want to reset all data? This will delete all your accounts, transactions, and settings. This action <span className="font-bold text-rose-600">cannot be undone</span>.
          </p>
          <div className="flex gap-4">
            <button 
              onClick={() => setIsResetModalOpen(false)}
              className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-bold"
            >
              Cancel
            </button>
            <button 
              onClick={handleResetData}
              className="flex-1 py-3 bg-rose-600 text-white rounded-2xl font-bold shadow-lg"
            >
              Reset Everything
            </button>
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={isDemoModalOpen} 
        onClose={() => setIsDemoModalOpen(false)} 
        title="Seed Demo Data"
      >
        <div className="space-y-6">
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            This will replace your current data with sample accounts, transactions, and bills. This is great for exploring the app's features.
          </p>
          <div className="flex gap-4">
            <button 
              onClick={() => setIsDemoModalOpen(false)}
              className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-bold"
            >
              Cancel
            </button>
            <button 
              onClick={handleDemoData}
              className="flex-1 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg"
            >
              Seed Data
            </button>
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        title="Import Backup"
      >
        <div className="space-y-6">
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all group"
            >
              <Upload size={24} className="text-slate-400 group-hover:text-blue-600" />
              <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Choose Backup File</span>
            </button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100 dark:border-slate-800"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-slate-900 px-2 text-slate-400 font-black tracking-widest">Or Paste JSON</span></div>
            </div>

            <textarea 
              value={importJson}
              onChange={(e) => {
                setImportJson(e.target.value);
                setImportError('');
              }}
              placeholder="Paste your backup JSON here..."
              className="w-full h-32 px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-xs font-mono outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-slate-900 dark:text-white resize-none"
            />
            {importError && <p className="text-xs font-bold text-rose-600">{importError}</p>}
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setIsImportModalOpen(false)}
              className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-bold"
            >
              Cancel
            </button>
            <button 
              onClick={handleTextImport}
              className="flex-1 py-3 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg"
            >
              Import Data
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

/** --- End of Settings.tsx --- */
