import React, { useContext, useMemo } from "react";
import { ExpenseContext } from "../context/ExpenseContext";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import MoneyManagementIcon from "../assets/images/money-management.png";
import Lottie from "lottie-react";
import ExpenseEmpty from "../assets/animations/ExpenseEmpty.json";
import { toast } from "react-toastify";

const formatExpenseDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const ExpenseList = () => {
  const { expenses, setEditingExpense, deleteExpense, filters } =
    useContext(ExpenseContext);

  const handleEdit = (expense) => {
    setEditingExpense(expense);
  };

  const handleDelete = async (id) => {
    try {
      await deleteExpense(id); 
      toast.success("Expense deleted!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete. Please try again.");
    }
  };

  const filteredExpenses = useMemo(() => {
    const list = (expenses || []).filter((exp) => {
      const expAmount = Number(exp.amount);
      const expDate = new Date(exp.date);

      if (filters.category && exp.category !== filters.category) return false;
      if (filters.startDate && expDate < new Date(filters.startDate)) return false;
      if (filters.endDate && expDate > new Date(filters.endDate)) return false;
      if (filters.minAmount && expAmount < Number(filters.minAmount)) return false;
      if (filters.maxAmount && expAmount > Number(filters.maxAmount)) return false;

      return true;
    });

    const sortKey = filters.sort || "newest";

    return [...list].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      const amountA = Number(a.amount);
      const amountB = Number(b.amount);

      switch (sortKey) {
        case "oldest":
          return dateA - dateB;
        case "amount-high":
          return amountB - amountA;
        case "amount-low":
          return amountA - amountB;
        case "newest":
        default:
          return dateB - dateA;
      }
    });
  }, [expenses, filters]);

  return (
    <div className="bg-[#F7F9FC] rounded-md px-4 py-4 h-[450px] overflow-y-auto scrollbar">
      <h3 className="text-3xl font-bold mb-4 text-[#127487]">📃Expense List</h3>

      {filteredExpenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[400px]">
          <p className="text-gray-500">No expenses found.</p>
          <Lottie
            animationData={ExpenseEmpty}
            loop
            style={{ width: 200, height: 200 }}
          />
        </div>
      ) : (
        <ul className="space-y-3">
          {filteredExpenses.map((exp) => (
            <li
              key={exp.id}
              className="border-b-2 border-gray-300 md:p-2 flex flex-col gap-1"
            >
              {/* Category row */}
              <div className="flex gap-2 items-center">
                <span className="rounded-full flex justify-center items-center w-8 h-8">
                  <img src={MoneyManagementIcon} alt="expenseIcon" />
                </span>
                <p className="md:text-[18px] text-[#166e60] font-semibold">
                  {exp.category}
                </p>
              </div>

              {/* Amount directly below category */}
              <p className="font-bold text-[#2FA61B] md:text-xl ml-10">
                ${exp.amount}
              </p>

              {/* Note on its own line so it doesn't push money around */}
              {exp.note && (
                <p className="md:text-[16px] text-[#6E6B6D] font-semibold ml-10">
                  {exp.note}
                </p>
              )}

              {/* Bottom row: date on left, actions on right */}
              <div className="flex items-center justify-between mt-1">
                <p className="text-[#8C8585] text-xs ml-10">
                  {formatExpenseDate(exp.date)}
                </p>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEdit(exp)} aria-label="Edit">
                    <PencilIcon className="w-5 h-5 text-[#2A7B9B] cursor-pointer" />
                  </button>
                  <button onClick={() => handleDelete(exp.id)} aria-label="Delete">
                    <TrashIcon className="w-5 h-5 text-[#eb4d26] cursor-pointer" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ExpenseList;
