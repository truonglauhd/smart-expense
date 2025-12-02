import React, { useContext, useMemo } from "react";
import { ExpenseContext } from "../context/ExpenseContext";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import { toast } from "react-toastify";
import MoneyIcon from "../assets/images/money-bag.png";
import Lottie from "lottie-react";
import IncomeEmpty from "../assets/animations/IncomeEmpty.json";

const formatIncomeDate = (value) => {
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

const IncomeList = () => {
  const {
    incomes,
    setEditingIncome,
    deleteIncome, 
    incomeFilters,
  } = useContext(ExpenseContext);

  const handleDelete = async (id) => {
    try {
      await deleteIncome(id); 
      toast.info("Income deleted!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete income. Please try again.");
    }
  };

  const filteredIncomes = useMemo(() => {
    const list = (incomes || []).filter((income) => {
      const amount = Number(income.amount);
      const dateValue = new Date(income.date);

      if (incomeFilters.category && income.category !== incomeFilters.category)
        return false;
      if (
        incomeFilters.startDate &&
        dateValue < new Date(incomeFilters.startDate)
      )
        return false;
      if (
        incomeFilters.endDate &&
        dateValue > new Date(incomeFilters.endDate)
      )
        return false;
      if (
        incomeFilters.minAmount &&
        amount < Number(incomeFilters.minAmount)
      )
        return false;
      if (
        incomeFilters.maxAmount &&
        amount > Number(incomeFilters.maxAmount)
      )
        return false;
      return true;
    });

    const sortKey = incomeFilters.sort || "newest";

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
  }, [incomes, incomeFilters]);

  return (
    <div className="bg-[#F7F9FC] rounded shawdow p-4 mt-4 h-[400px] md:h-[450px] overflow-y-auto scrollbar">
      <h3 className="text-3xl font-bold md:mt-5 mb-4 text-[#127487]">🧾Income List</h3>

      {filteredIncomes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[400px]">
          <p className="text-gray-500">No incomes added yet.</p>
          <Lottie animationData={IncomeEmpty} loop style={{ width: 200, height: 200 }} />
        </div>
      ) : (
        <ul className="space-y-3">
          {filteredIncomes.map((income) => (
            <li
              className="border-b-2 border-gray-300 md:p-2 flex justify-between items-center"
              key={income.id}
            >
              <div className="flex flex-col gap-1 flex-1">
                <div className="flex gap-2 items-center">
                  <span className="rounded-full flex justify-center items-center w-7 h-7">
                    <img src={MoneyIcon} alt="income-icon" />
                  </span>
                  <p className="md:text-[18px] text-[#166e60] font-semibold capitalize">
                    {income.category || "income"}
                  </p>
                </div>
                <p className="font-bold text-[#2FA61B] md:text-xl ml-9">
                  ${income.amount}
                </p>
                {income.note && (
                  <p className="md:text-[16px] text-[#6E6B6D] font-semibold ml-9">
                    {income.note}
                  </p>
                )}
                <p className="text-[#8C8585] text-xs ml-9">
                  {formatIncomeDate(income.date)}
                </p>
              </div>

              <div className="md:space-x-2 flex items-center gap-2">
                <button onClick={() => setEditingIncome(income)} aria-label="Edit">
                  <PencilIcon className="w-5 h-5 text-[#2A7B9B] cursor-pointer" />
                </button>
                <button onClick={() => handleDelete(income.id)} aria-label="Delete">
                  <TrashIcon className="w-5 h-5 text-[#eb4d26] cursor-pointer" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default IncomeList;
