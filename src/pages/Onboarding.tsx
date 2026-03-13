import React, { useState } from 'react';
import { useApp } from '../providers/AppProvider';
import { 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Wallet, 
  Building2, 
  ReceiptText, 
  TrendingUp,
  Waves
} from 'lucide-react';
import { MALDIVES_BANKS, UTILITY_PROVIDERS } from '../constants/maldives';
import { cn, generateId } from '../utils';

export const Onboarding: React.FC = () => {
  const { updateSettings, storage, refreshData } = useApp();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [selectedBanks, setSelectedBanks] = useState<string[]>(['bml', 'mib']);
  const [selectedProviders, setSelectedProviders] = useState<string[]>(['stelco', 'mwsc', 'dhiraagu', 'ooredoo']);

  const nextStep = () => {
    if (step === 1 && !name.trim()) return;
    setStep(s => s + 1);
  };
  const prevStep = () => setStep(s => s - 1);

  const completeOnboarding = async () => {
    // Create default accounts for selected banks
    for (const bankId of selectedBanks) {
      const bank = MALDIVES_BANKS.find(b => b.id === bankId);
      if (bank) {
        await storage.accounts.create({
          id: generateId(),
          name: `${bank.name} Account`,
          institutionName: bank.name,
          institutionType: 'bank',
          accountType: 'savings',
          currency: 'MVR',
          balance: 0,
          openingBalance: 0,
          isArchived: false,
          includeInNetWorth: true,
          color: bankId === 'bml' ? '#e11d48' : '#059669',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    // Create default bills for selected providers
    for (const providerId of selectedProviders) {
      const provider = UTILITY_PROVIDERS.find(p => p.id === providerId);
      if (provider) {
        await storage.bills.create({
          id: generateId(),
          providerName: provider.name,
          category: provider.type,
          amount: 0,
          currency: 'MVR',
          dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 25).toISOString(),
          recurringFrequency: 'monthly',
          autopayEnabled: false,
          reminderDaysBefore: 3,
          status: 'upcoming',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    await updateSettings({
      onboardingCompleted: true,
      name,
      selectedBanks,
      selectedProviders,
    });
    await refreshData();
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-emerald-600 rounded-3xl flex items-center justify-center text-white mx-auto shadow-2xl shadow-emerald-200 rotate-3">
                <Waves size={40} />
              </div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Welcome to Barabo</h1>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium">
                The most beautiful way to manage your finances in the Maldives.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-xl space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">What should we call you?</label>
                  <input 
                    type="text" 
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-lg font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                    <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                      <Wallet size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Track Everything</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Accounts, bills, and savings.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                    <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
                      <TrendingUp size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Smart Insights</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Understand your habits.</p>
                    </div>
                  </div>
                </div>
              </div>
              <button 
                onClick={nextStep}
                disabled={!name.trim()}
                className="w-full py-4 bg-slate-900 dark:bg-emerald-600 text-white rounded-2xl font-bold shadow-xl hover:bg-slate-800 dark:hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                Get Started
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">Your Banks</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Select the banks you use in the Maldives.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {MALDIVES_BANKS.map(bank => (
                <button
                  key={bank.id}
                  onClick={() => {
                    setSelectedBanks(prev => 
                      prev.includes(bank.id) ? prev.filter(id => id !== bank.id) : [...prev, bank.id]
                    );
                  }}
                  className={cn(
                    "p-6 rounded-[32px] border-2 transition-all flex flex-col items-center gap-3 group relative",
                    selectedBanks.includes(bank.id) 
                      ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 shadow-lg shadow-emerald-100 dark:shadow-none" 
                      : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-700"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg",
                    selectedBanks.includes(bank.id) ? "bg-emerald-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 group-hover:bg-slate-200 dark:group-hover:bg-slate-700"
                  )}>
                    {bank.logo}
                  </div>
                  <span className={cn(
                    "text-xs font-bold text-center",
                    selectedBanks.includes(bank.id) ? "text-emerald-900 dark:text-emerald-400" : "text-slate-600 dark:text-slate-400"
                  )}>{bank.name}</span>
                  {selectedBanks.includes(bank.id) && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg">
                      <Check size={14} />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className="flex gap-4">
              <button onClick={prevStep} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-bold">Back</button>
              <button onClick={nextStep} className="flex-[2] py-4 bg-slate-900 dark:bg-emerald-600 text-white rounded-2xl font-bold shadow-xl">Continue</button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">Utility Providers</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Which services do you pay for?</p>
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {UTILITY_PROVIDERS.map(provider => (
                <button
                  key={provider.id}
                  onClick={() => {
                    setSelectedProviders(prev => 
                      prev.includes(provider.id) ? prev.filter(id => id !== provider.id) : [...prev, provider.id]
                    );
                  }}
                  className={cn(
                    "w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between group",
                    selectedProviders.includes(provider.id) 
                      ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" 
                      : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-700"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold",
                      selectedProviders.includes(provider.id) ? "bg-emerald-600" : "bg-slate-200 dark:bg-slate-800"
                    )}>
                      <ReceiptText size={20} />
                    </div>
                    <div className="text-left">
                      <p className={cn("text-sm font-bold", selectedProviders.includes(provider.id) ? "text-emerald-900 dark:text-emerald-400" : "text-slate-900 dark:text-white")}>
                        {provider.name}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">{provider.type}</p>
                    </div>
                  </div>
                  {selectedProviders.includes(provider.id) && (
                    <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg">
                      <Check size={14} />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className="flex gap-4">
              <button onClick={prevStep} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-bold">Back</button>
              <button onClick={completeOnboarding} className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-200 dark:shadow-none">
                Finish Setup
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-xl w-full">
        {renderStep()}
        
        {/* Progress Dots */}
        {step > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {[2, 3].map(i => (
              <div 
                key={i} 
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  step === i ? "w-8 bg-emerald-600" : "w-2 bg-slate-200 dark:bg-slate-800"
                )} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
