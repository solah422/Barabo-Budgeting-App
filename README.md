# Barabo Budgeting App

A premium, Maldives-first personal finance tracker designed for managing income, expenses, budgets, and bills with ease.

## Features

- **Dashboard**: Get a quick overview of your financial health, recent transactions, and upcoming bills.
- **Transactions**: Track all your income and expenses. Features include search, filtering by type (income/expense), and bulk actions.
- **Budgets**: Set and monitor budgets for different spending categories.
- **Reports**: Visualize your spending habits with interactive charts and graphs.
- **Accounts**: Manage multiple accounts (e.g., BML Savings, MIB Checking, Cash Wallet).
- **Settings**: Customize your experience with dark/light mode, accent colors, and data management (export/import/reset).
- **Offline-First**: All data is stored securely in your browser's local storage.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Animations**: Motion (Framer Motion)
- **Charts**: Recharts
- **Date Formatting**: date-fns

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd barabo-budgeting
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`.

## Building for Production

To create a production build, run:

```bash
npm run build
```

The compiled assets will be available in the `dist` directory. You can preview the production build using:

```bash
npm run preview
```

## Data Privacy

Barabo Budgeting App is a client-side application. All your financial data is stored locally in your browser using `localStorage`. No data is sent to external servers, ensuring complete privacy and security of your financial information. You can export and import your data anytime from the Settings page.

## License

This project is licensed under the MIT License.
