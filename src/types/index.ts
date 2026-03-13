export type Currency = 'MVR' | 'USD';
export type AccentColor = 'emerald' | 'blue' | 'violet' | 'rose' | 'amber';

export interface UserSettings {
  name?: string;
  primaryCurrency: Currency;
  secondaryCurrency: Currency;
  exchangeRates: { [key: string]: number };
  locale: string;
  theme: 'light' | 'dark';
  accentColor: AccentColor;
  monthStartDay: number;
  budgetingStyle: 'category' | 'envelope' | 'zero-based';
  selectedBanks: string[];
  selectedProviders: string[];
  onboardingCompleted: boolean;
}

export interface Account {
  id: string;
  name: string;
  institutionName: string;
  institutionType: 'bank' | 'cash' | 'wallet' | 'other';
  accountType: 'savings' | 'checking' | 'credit' | 'loan' | 'cash';
  currency: Currency;
  balance: number;
  openingBalance: number;
  isArchived: boolean;
  includeInNetWorth: boolean;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: Currency;
  exchangeRateToBase: number;
  baseAmount: number;
  category: string;
  subcategory?: string;
  accountId: string;
  transferAccountId?: string;
  merchantOrProvider?: string;
  note?: string;
  tags: string[];
  date: string;
  isRecurring: boolean;
  recurringRule?: string;
  status: 'pending' | 'completed' | 'cleared';
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  month: number; // 0-11
  year: number;
  category: string;
  plannedAmount: number;
  rolloverEnabled: boolean;
  alertThreshold: number; // 0-1
  notes?: string;
}

export interface Bill {
  id: string;
  providerName: string;
  category: string;
  accountReference?: string;
  amount: number;
  currency: Currency;
  dueDate: string;
  recurringFrequency: 'monthly' | 'quarterly' | 'yearly' | 'once';
  autopayEnabled: boolean;
  reminderDaysBefore: number;
  status: 'upcoming' | 'paid' | 'overdue';
  notes?: string;
  averageAmount?: number;
  lastPaidDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Debt {
  id: string;
  lenderName: string;
  debtType: 'loan' | 'credit_card' | 'family' | 'other';
  principalAmount: number;
  currentBalance: number;
  interestRate: number;
  dueDate: string;
  monthlyPayment: number;
  currency: Currency;
  linkedAccountId?: string;
  notes?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'bill' | 'budget' | 'system';
  date: string;
  isRead: boolean;
  link?: string;
}
