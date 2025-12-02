import React, { useContext } from "react";
import { ExpenseContext } from "../context/ExpenseContext";

const CategoryTotals = ({ expenses: propExpenses, categoryTotals: propCategoryTotals }) => {
  const { expenses: contextExpenses } = useContext(ExpenseContext);
  const expenses = propExpenses !== undefined ? propExpenses : contextExpenses;

  const categories = ["Food", "Travel", "Bills", "Others"];

    const totals = propCategoryTotals
    ? categories.map((cat) => ({
        category: cat,
        total: propCategoryTotals[cat] || 0,
      }))
    : categories.map((cat) => {
        const total = expenses
          .filter((exp) => exp.category === cat)
          .reduce((sum, exp) => sum + Number(exp.amount), 0);
        return { category: cat, total };
      });

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {totals.map((cat) => (
        <div
          key={cat.category}
          className="bg-white p-4 rounded shadow flex flex-col items-center justify-center"
        >
          <div className="flex gap-1 items-center justify-center">
            {cat.category === "Food" && (
              <span className="bg-cyan-100 p-2 rounded-md text-xl md:text-sm lg:text-xl">
                🍔
              </span>
            )}
            {cat.category === "Travel" && (
              <span className="bg-blue-200 p-2 rounded-md text-xl md:text-sm lg:text-xl">
                ✈
              </span>
            )}
            {cat.category === "Bills" && (
              <span className="bg-violet-100 p-2 rounded-md text-xl md:text-sm lg:text-xl">
                📰
              </span>
            )}
            {cat.category === "Others" && (
              <span className="bg-gray-300 p-2 rounded-md text-xl md:text-sm lg:text-xl">
                🔗
              </span>
            )}
            <h4 className="font-semibold mb-2 text-emerald-800 text-2xl md:text-xl">
              {cat.category}
            </h4>
          </div>
          <p className="text-2xl font-bold text-gray-600">${cat.total}</p>
        </div>
      ))}
    </div>
  );
};

export default CategoryTotals;
