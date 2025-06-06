export type Category = 'Rental' | 'Groceries' | 'Entertainment' | 'Travel' | 'Others';
export type PaymentMode = 'UPI' | 'Credit Card' | 'Net Banking' | 'Cash';
export type DateFilter = 'This month' | 'Last 30 days' | 'Last 90 days' | 'All time';

export interface Expense {
  _id: string;
  amount: number;
  category: Category;
  notes: string;
  date: string;
  paymentMode: PaymentMode;
  user: string;
}

export interface ExpenseFilters {
  dateFilter: DateFilter;
  categories: Category[];
  paymentModes: PaymentMode[];
}