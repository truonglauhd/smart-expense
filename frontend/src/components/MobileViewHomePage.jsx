import React from "react";
import DashboardIcon from "../assets/images/budget.png";
import ExpenseIcon from "../assets/images/costs.png";
import IncomeIcon from "../assets/images/coins.png";
import AccountingIcon from "../assets/images/accounting.png";

const MobileViewHomePage = ({ setActiveSection, activeSection }) => {
  return (
    <div className="flex flex-col gap-5 sm:hidden mb-6 p-5">
      {/* Dashboard */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setActiveSection("dashboard")}
        onKeyDown={(e) => e.key === "Enter" && setActiveSection("dashboard")}
        className={`p-4 rounded shadow cursor-pointer ${
          activeSection === "dashboard" ? "bg-blue-600 text-white" : "bg-white"
        }`}
      >
        <div className="flex flex-col justify-between items-center">
          <img
            src={DashboardIcon}
            alt="dashboard-icon"
            className="w-20 h-20 object-contain"
          />
          <p
            className={`font-semibold text-xl ${
              activeSection === "dashboard" ? "text-white" : "text-[#090979]"
            }`}
          >
            Dashboard
          </p>
        </div>
      </div>

      {/* Income */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setActiveSection("income")}
        onKeyDown={(e) => e.key === "Enter" && setActiveSection("income")}
        className={`p-4 rounded shadow cursor-pointer ${
          activeSection === "income" ? "bg-green-600 text-white" : "bg-white"
        }`}
      >
        <div className="flex flex-col justify-between items-center">
          <img
            src={IncomeIcon}
            alt="income-icon"
            className="w-20 h-20 object-contain"
          />
          <p
            className={`font-semibold text-xl ${
              activeSection === "income" ? "text-white" : "text-[#090979]"
            }`}
          >
            Income
          </p>
        </div>
      </div>

      {/* Expense */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setActiveSection("expense")}
        onKeyDown={(e) => e.key === "Enter" && setActiveSection("expense")}
        className={`p-4 rounded shadow cursor-pointer ${
          activeSection === "expense" ? "bg-red-600 text-white" : "bg-white"
        }`}
      >
        <div className="flex flex-col justify-between items-center">
          <img
            src={ExpenseIcon}
            alt="expense-icon"
            className="w-20 h-20 object-contain"
          />
          <p
            className={`font-semibold text-xl ${
              activeSection === "expense" ? "text-white" : "text-[#090979]"
            }`}
          >
            Expense
          </p>
        </div>
      </div>

      {/* Login */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setActiveSection("login")}
        onKeyDown={(e) => e.key === "Enter" && setActiveSection("login")}
        className={`p-4 rounded shadow cursor-pointer ${
          activeSection === "login" ? "bg-purple-600 text-white" : "bg-white"
        }`}
      >
        <div className="flex flex-col justify-between items-center">
          <img
            src={AccountingIcon}
            alt="login-icon"
            className="w-20 h-20 object-contain"
          />
          <p
            className={`font-semibold text-xl ${
              activeSection === "login" ? "text-white" : "text-[#090979]"
            }`}
          >
            Login
          </p>
        </div>
      </div>
    </div>
  );
};

export default MobileViewHomePage;
