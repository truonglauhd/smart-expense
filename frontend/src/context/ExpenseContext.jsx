import React, { createContext, useEffect, useState } from "react";
import {
  apiGetExpenses,
  apiCreateExpense,
  apiUpdateExpense,
  apiDeleteExpense,
  apiGetIncomes,
  apiCreateIncome,
  apiUpdateIncome,
  apiDeleteIncome,
} from "../services/api";

// 1) Create Context
export const ExpenseContext = createContext();

// 2) Provider
export const ExpenseProvider = ({ children }) => {
  // Income & Expense state
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);

  // Editing states
  const [editingIncome, setEditingIncome] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);

  // Filters for expense list / API
  const [filters, setFilters] = useState({
    category: "",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
    amountRange: "",
    sort: "newest",
  });

  const [incomeFilters, setIncomeFilters] = useState({
    category: "",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
    amountRange: "",
    sort: "newest",
  });

  // --- Load data: prefer API, fallback to localStorage
  useEffect(() => {
    (async () => {
      try {
        const [expenseRes, incomeRes] = await Promise.all([
          apiGetExpenses(),
          apiGetIncomes(),
        ]);

        setExpenses(expenseRes.data || []);
        setIncomes(incomeRes.data || []);
      } catch (err) {
        // Fallback for first run or when backend is down
        const storedIncomes = JSON.parse(localStorage.getItem("incomes")) || [];
        const storedExpenses =
          JSON.parse(localStorage.getItem("expenses")) || [];
        setIncomes(storedIncomes);
        setExpenses(storedExpenses);
      }
    })();
  }, []);

  // Keep localStorage updated (offline/demo support)
  useEffect(() => {
    localStorage.setItem("incomes", JSON.stringify(incomes));
  }, [incomes]);

  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  // --- Helper actions (used by forms/lists) ---
  const actions = {
    // Expenses
    async addExpense(payload) {
      const { data } = await apiCreateExpense(payload);
      setExpenses((prev) => [data, ...prev]);
      return data;
    },
    async updateExpense(id, payload) {
      const { data } = await apiUpdateExpense(id, payload);
      setExpenses((prev) => prev.map((x) => (x.id === id ? data : x)));
      return data;
    },
    async deleteExpense(id) {
      await apiDeleteExpense(id);
      setExpenses((prev) => prev.filter((x) => x.id !== id));
    },
    async refetchExpenses(extraParams = {}) {
      const { data } = await apiGetExpenses({ ...filters, ...extraParams });
      setExpenses(data || []);
    },

    // Incomes
    async addIncome(payload) {
      const { data } = await apiCreateIncome(payload);
      setIncomes((prev) => [data, ...prev]);
      return data;
    },
    async updateIncome(id, payload) {
      const { data } = await apiUpdateIncome(id, payload);
      setIncomes((prev) => prev.map((x) => (x.id === id ? data : x)));
      return data;
    },
    async deleteIncome(id) {
      await apiDeleteIncome(id);
      setIncomes((prev) => prev.filter((x) => x.id !== id));
    },
    async refetchIncomes() {
      const { data } = await apiGetIncomes();
      setIncomes(data || []);
    },
  };

  return (
    <ExpenseContext.Provider
      value={{
        // state
        expenses,
        setExpenses,
        incomes,
        setIncomes,
        editingIncome,
        setEditingIncome,
        editingExpense,
        setEditingExpense,
        filters,
        setFilters,
        incomeFilters,
        setIncomeFilters,
        // actions
        ...actions,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};
