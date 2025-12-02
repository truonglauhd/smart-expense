import React, { useContext, useMemo } from "react";
import { ExpenseContext } from "../context/ExpenseContext";
import Lottie from "lottie-react";
import Transaction from "../assets/animations/Transaction.json";

const formatTransactionDate = (value) => {
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

const Transactions = ({ expenses: propExpenses, incomes: propIncomes }) => {
  const { incomes: contextIncomes, expenses: contextExpenses } = useContext(ExpenseContext);
  const expenses = propExpenses !== undefined ? propExpenses : contextExpenses;
  const incomes = propIncomes !== undefined ? propIncomes : contextIncomes;

  // Combine & sort by date descending (memoized)
  const combined = useMemo(() => {
    const list = [
      ...(incomes || []).map((item) => ({ ...item, type: "Income" })),
      ...(expenses || []).map((item) => ({ ...item, type: "Expense" })),
    ];
    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [incomes, expenses]);

  return (
    <div className="bg-[#fafdfd] p-5 md:p-2 rounded-md shadow-lg overflow-y-auto h-[450px] md:h-[620px] lg:p-4 xl:p-5 scrollbar">
      <h3 className="text-2xl font-bold mb-4 text-[#127487] md:text-xl lg:text-2xl">
        💰All Transactions
      </h3>

      {combined.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[400px]">
          <p className="text-gray-500 mt-10">No transactions yet.</p>
          <Lottie animationData={Transaction} loop />
        </div>
      ) : (
        <ul className="space-y-3 overflow-y-auto">
          {combined.map((item) => (
            <li
              key={item.id}
              className="border-b-2 border-gray-300 p-4 md:p-2 lg:p-4"
            >
              <div>
                <div className="flex justify-between items-center">
                  <div className="flex gap-5 md:gap-0 lg:gap-3 xl:gap-5">
                    <div
                      className={`rounded-full flex justify-center items-center w-7 h-7 ${
                        item.type === "Income" ? "bg-violet-500" : "bg-red-900"
                      }`}
                    >
                      {item.type === "Income" ? "💲" : "💳"}
                    </div>
                    <span className="text-gray-600 font-semibold text-xl md:text-[16px] lg:text-[18px]">
                      {item.note?.trim() ? item.note : item.type}
                    </span>
                  </div>

                  <p
                    className={`font-bold text-xl md:text-sm lg:text-[18px] ${
                      item.type === "Income" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {item.type === "Income"
                      ? `+$${Number(item.amount).toLocaleString()}`
                      : `-$${Number(item.amount).toLocaleString()}`}
                  </p>
                </div>

                <p className="text-[#8C8585] text-xs pt-2">
                  {formatTransactionDate(item.date)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Transactions;
