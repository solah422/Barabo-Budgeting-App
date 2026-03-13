export const MALDIVES_BANKS = [
  { id: 'bml', name: 'Bank of Maldives', logo: 'BML' },
  { id: 'mib', name: 'Maldives Islamic Bank', logo: 'MIB' },
  { id: 'cbm', name: 'Commercial Bank of Maldives', logo: 'CBM' },
  { id: 'mcb', name: 'Mauritius Commercial Bank (Maldives)', logo: 'MCB' },
  { id: 'sbi', name: 'State Bank of India', logo: 'SBI' },
  { id: 'boc', name: 'Bank of Ceylon', logo: 'BOC' },
  { id: 'hbl', name: 'Habib Bank Limited', logo: 'HBL' },
  { id: 'dbm', name: 'Development Bank of Maldives', logo: 'DBM' },
];

export const UTILITY_PROVIDERS = [
  { id: 'stelco', name: 'STELCO', type: 'Electricity / Utility' },
  { id: 'mwsc', name: 'MWSC', type: 'Water / Sewerage' },
  { id: 'fenaka', name: 'FENAKA', type: 'Utility / Water / Electricity / Sewerage' },
  { id: 'medianet', name: 'Medianet', type: 'TV / Entertainment / Internet' },
  { id: 'ooredoo', name: 'Ooredoo', type: 'Telecom / Mobile / Broadband' },
  { id: 'dhiraagu', name: 'Dhiraagu', type: 'Telecom / Mobile / Broadband' },
  { id: 'rol', name: 'ROL', type: 'Internet / telecom' },
  { id: 'maldives_gas', name: 'Maldives Gas', type: 'Gas' },
  { id: 'villa_gas', name: 'Villa Gas', type: 'Gas' },
];

export const INCOME_CATEGORIES = [
  'Salary', 'Freelance', 'Business', 'Allowance', 'Bonus', 'Rent Received', 'Investment Income', 'Gift Received', 'Refund', 'Other Income'
];

export const EXPENSE_CATEGORIES = [
  {
    name: 'Housing / Rent',
    subcategories: ['Rent', 'Maintenance', 'Security']
  },
  {
    name: 'Utilities',
    subcategories: ['Electricity', 'Water', 'Sewerage', 'Gas', 'Mobile', 'Internet', 'TV / Entertainment']
  },
  {
    name: 'Groceries',
    subcategories: ['Supermarket', 'Local Market', 'Supplies']
  },
  {
    name: 'Dining Out',
    subcategories: ['Restaurants', 'Cafes', 'Takeaway']
  },
  {
    name: 'Transport',
    subcategories: ['Fuel', 'Ferry / Boat', 'Air Travel', 'Taxi', 'Bus']
  },
  {
    name: 'Education',
    subcategories: ['School Fees', 'Courses', 'Books']
  },
  {
    name: 'Healthcare',
    subcategories: ['Medical', 'Pharmacy', 'Insurance']
  },
  {
    name: 'Personal Care',
    subcategories: ['Grooming', 'Cosmetics', 'Gym']
  },
  {
    name: 'Shopping',
    subcategories: ['Clothing', 'Electronics', 'Home Goods']
  },
  {
    name: 'Subscriptions',
    subcategories: ['Streaming', 'Software', 'Memberships']
  },
  {
    name: 'Debt Repayment',
    subcategories: ['Loan', 'Credit Card', 'Family']
  },
  {
    name: 'Savings Contribution',
    subcategories: ['Emergency Fund', 'Investment', 'Goal']
  },
  {
    name: 'Charity',
    subcategories: ['Zakat', 'Donations', 'Sadaqah']
  },
  {
    name: 'Miscellaneous',
    subcategories: ['Other']
  }
];
