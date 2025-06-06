import React, { createContext, useContext, useState, useEffect } from "react";
import axios from 'axios';
import { Expense, ExpenseFilters, Category, PaymentMode, DateFilter } from "@/types";
import { subDays, startOfMonth, isWithinInterval, parseISO } from "date-fns";
import { useAuth } from "./AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ExpenseContextType {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, "id" | "user">) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  filters: ExpenseFilters;
  setFilters: React.Dispatch<React.SetStateAction<ExpenseFilters>>;
  filteredExpenses: Expense[];
  categories: Category[];
  paymentModes: PaymentMode[];
  dateFilters: DateFilter[];
  isLoading: boolean;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const categories: Category[] = [
  "Rental", 
  "Groceries", 
  "Entertainment", 
  "Travel", 
  "Others"
];

export const paymentModes: PaymentMode[] = [
  "UPI", 
  "Credit Card", 
  "Net Banking", 
  "Cash"
];

export const dateFilters: DateFilter[] = [
  "This month",
  "Last 30 days",
  "Last 90 days",
  "All time"
];

const DEFAULT_FILTERS: ExpenseFilters = {
  dateFilter: "This month",
  categories: [],
  paymentModes: []
};

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filters, setFilters] = useState<ExpenseFilters>(DEFAULT_FILTERS);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();
  const { toast } = useToast();

  const api = axios.create({
    baseURL: 'https://expense-7tiz.onrender.com',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  useEffect(() => {
    if (token) {
      fetchExpenses();
    }
  }, [token]);

  const fetchExpenses = async () => {
    try {
      const response = await api.get('/expenses');
      setExpenses(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch expenses",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addExpense = async (expenseData: Omit<Expense, "id" | "user">) => {
    try {
      const response = await api.post('/expenses', expenseData);
      setExpenses(prev => [...prev, response.data]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add expense",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      await api.delete(`/expenses/${id}`);
      setExpenses(prev => prev.filter(expense => expense._id !== id));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete expense",
        variant: "destructive"
      });
      throw error;
    }
  };

  const filteredExpenses = React.useMemo(() => {
    return expenses.filter(expense => {
      const expenseDate = parseISO(expense.date);
      const now = new Date();
      
      let passesDateFilter = true;
      if (filters.dateFilter === "This month") {
        const monthStart = startOfMonth(now);
        passesDateFilter = isWithinInterval(expenseDate, { 
          start: monthStart, 
          end: now 
        });
      } else if (filters.dateFilter === "Last 30 days") {
        passesDateFilter = isWithinInterval(expenseDate, {
          start: subDays(now, 30),
          end: now
        });
      } else if (filters.dateFilter === "Last 90 days") {
        passesDateFilter = isWithinInterval(expenseDate, {
          start: subDays(now, 90),
          end: now
        });
      }
      
      const passesCategoryFilter = filters.categories.length === 0 || 
        filters.categories.includes(expense.category);
      
      const passesPaymentModeFilter = filters.paymentModes.length === 0 || 
        filters.paymentModes.includes(expense.paymentMode);
      
      return passesDateFilter && passesCategoryFilter && passesPaymentModeFilter;
    });
  }, [expenses, filters]);

  return (
    <ExpenseContext.Provider 
      value={{ 
        expenses, 
        addExpense, 
        deleteExpense,
        filters,
        setFilters,
        filteredExpenses,
        categories,
        paymentModes,
        dateFilters,
        isLoading
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpense = () => {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error("useExpense must be used within an ExpenseProvider");
  }
  return context;
};