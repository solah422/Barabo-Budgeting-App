import { IRepository, ISettingsRepository, IStorageProvider } from './interfaces';
import { Account, Bill, Budget, Debt, Transaction, UserSettings } from '../types';

class LocalRepository<T extends { id: string }> implements IRepository<T> {
  constructor(private key: string) {}

  private async getRaw(): Promise<T[]> {
    const data = localStorage.getItem(this.key);
    return data ? JSON.parse(data) : [];
  }

  async getAll(): Promise<T[]> {
    return this.getRaw();
  }

  async getById(id: string): Promise<T | null> {
    const items = await this.getRaw();
    return items.find((item) => item.id === id) || null;
  }

  async create(item: T): Promise<T> {
    const items = await this.getRaw();
    items.push(item);
    localStorage.setItem(this.key, JSON.stringify(items));
    return item;
  }

  async update(id: string, item: Partial<T>): Promise<T> {
    const items = await this.getRaw();
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) throw new Error('Item not found');
    items[index] = { ...items[index], ...item };
    localStorage.setItem(this.key, JSON.stringify(items));
    return items[index];
  }

  async delete(id: string): Promise<void> {
    const items = await this.getRaw();
    const filtered = items.filter((i) => i.id !== id);
    localStorage.setItem(this.key, JSON.stringify(filtered));
  }

  async saveAll(items: T[]): Promise<void> {
    localStorage.setItem(this.key, JSON.stringify(items));
  }
}

class SettingsLocalRepository implements ISettingsRepository {
  private key = 'barabo_settings';
  private defaultSettings: UserSettings = {
    primaryCurrency: 'MVR',
    secondaryCurrency: 'USD',
    exchangeRates: { USD: 15.42 },
    locale: 'en-MV',
    theme: 'light',
    accentColor: 'emerald',
    monthStartDay: 1,
    budgetingStyle: 'category',
    selectedBanks: [],
    selectedProviders: [],
    onboardingCompleted: false,
  };

  async getSettings(): Promise<UserSettings> {
    const data = localStorage.getItem(this.key);
    return data ? JSON.parse(data) : this.defaultSettings;
  }

  async updateSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    const current = await this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(this.key, JSON.stringify(updated));
    return updated;
  }
}

export class LocalStorageProvider implements IStorageProvider {
  accounts = new LocalRepository<Account>('barabo_accounts');
  transactions = new LocalRepository<Transaction>('barabo_transactions');
  budgets = new LocalRepository<Budget>('barabo_budgets');
  bills = new LocalRepository<Bill>('barabo_bills');
  debts = new LocalRepository<Debt>('barabo_debts');
  settings = new SettingsLocalRepository();

  async clearAll(): Promise<void> {
    localStorage.clear();
  }

  async exportData(): Promise<string> {
    const data = {
      accounts: await this.accounts.getAll(),
      transactions: await this.transactions.getAll(),
      budgets: await this.budgets.getAll(),
      bills: await this.bills.getAll(),
      debts: await this.debts.getAll(),
      settings: await this.settings.getSettings(),
    };
    return JSON.stringify(data, null, 2);
  }

  async importData(json: string): Promise<void> {
    const data = JSON.parse(json);
    await this.clearAll();
    if (data.accounts) await this.accounts.saveAll(data.accounts);
    if (data.transactions) await this.transactions.saveAll(data.transactions);
    if (data.budgets) await this.budgets.saveAll(data.budgets);
    if (data.bills) await this.bills.saveAll(data.bills);
    if (data.debts) await this.debts.saveAll(data.debts);
    if (data.settings) await this.settings.updateSettings(data.settings);
  }
}
