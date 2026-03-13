import { Account, Bill, Budget, Debt, Transaction, UserSettings } from '../types';

export interface IRepository<T> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  create(item: T): Promise<T>;
  update(id: string, item: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
  saveAll(items: T[]): Promise<void>;
}

export interface ISettingsRepository {
  getSettings(): Promise<UserSettings>;
  updateSettings(settings: Partial<UserSettings>): Promise<UserSettings>;
}

export interface IStorageProvider {
  accounts: IRepository<Account>;
  transactions: IRepository<Transaction>;
  budgets: IRepository<Budget>;
  bills: IRepository<Bill>;
  debts: IRepository<Debt>;
  settings: ISettingsRepository;
  clearAll(): Promise<void>;
  exportData(): Promise<string>;
  importData(json: string): Promise<void>;
}
