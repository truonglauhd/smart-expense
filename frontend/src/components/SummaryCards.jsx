import React, { useContext } from "react";
import { ExpenseContext } from "../context/ExpenseContext";
import {
  BanknotesIcon,
  CreditCardIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";

const SummaryCards = () => {
  const { incomes, expenses } = useContext(ExpenseContext);

  const totalIncome = incomes.reduce((sum, inc) => sum + Number(inc.amount), 0);
  const totalExpenses = expenses.reduce(
    (sum, exp) => sum + Number(exp.amount),
    0
  );
  const balance = totalIncome - totalExpenses;

  return (
    <div className="grid sm:grid-cols-3 justify-center items-center gap-4">
      {/* Income Card */}
      <div className="bg-white rounded shadow flex justify-start items-center p-5">
        <div className="rounded-md bg-green-100 flex items-center justify-center w-12 h-12">
          <BanknotesIcon className="w-8 h-8 text-green-500" />
        </div>
        <div className="grid justify-center items-center h-[49px] ml-1">
          <h4 className="font-semibold text-gray-700 text-[16px] -mt-1">Income</h4>
          <p className="text-xl font-bold text-gray-400">
            ${totalIncome.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Balance Card */}
      <div className="bg-white rounded shadow flex justify-start items-center p-5">
        <div className="rounded-md bg-pink-200 flex items-center justify-center w-12 h-12">
          <WalletIcon className="w-8 h-8 text-purple-500" />
        </div>
        <div className="grid justify-center items-center h-[49px] ml-1">
          <h4 className="font-semibold text-gray-700 text-[16px] -mt-1">Balance</h4>
          <p className={`text-xl font-bold ${balance < 0 ? "text-red-500" : "text-gray-400"}`}>
            ${balance.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Expense Card */}
      <div className="bg-white rounded shadow flex justify-start items-center p-5">
        <div className="rounded-md bg-red-100 flex items-center justify-center w-12 h-12">
          <CreditCardIcon className="w-8 h-8 text-red-500" />
        </div>
        <div className="grid justify-center items-center h-[49px] ml-1">
          <h4 className="font-semibold text-gray-700 text-[16px] -mt-1">Expense</h4>
          <p className="text-xl font-bold text-gray-400">
            ${totalExpenses.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;
