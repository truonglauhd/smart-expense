import React, { useContext, useEffect, useState } from "react";
import SummaryCards from "./components/SummaryCards";
import {
  BanknotesIcon,
  ChartPieIcon,
  CreditCardIcon,
  HomeIcon,
} from "@heroicons/react/24/solid";
import { UserIcon } from "@heroicons/react/24/outline";
import ExpenseChart from "./components/ExpenseChart";
import CategoryTotals from "./components/CategoryTotals";
import Transactions from "./components/Transactions";
import AddIncomeForm from "./components/AddIncomeForm";
import IncomeList from "./components/IncomeList";
import AddExpenseForm from "./components/AddExpenseForm";
import FilterPanel from "./components/FilterPanel";
import ExpenseList from "./components/ExpenseList";
import IncomeFilterPanel from "./components/IncomeFilterPanel";
import Home from "./components/Home";
import MobileViewHomePage from "./components/MobileViewHomePage";
import { ArrowLeftCircleIcon } from "@heroicons/react/24/outline";
import Login from "./components/Login";
import Register from "./components/Register";
import UserProfile from "./components/UserProfile";
import DateFilter from "./components/DateFilter";
import { loadStoredAuth, clearStoredAuth, apiGetSummaryPeriod } from "./services/api";
import { ExpenseContext } from "./context/ExpenseContext";

const DashboardSection = () => {
  const { expenses, incomes } = useContext(ExpenseContext);
  const [filteredData, setFilteredData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleApplyFilter = async (startDate, endDate) => {
    setIsLoading(true);
    try {
      const data = await apiGetSummaryPeriod(startDate, endDate);
      setFilteredData(data);
    } catch (error) {
      console.error("Error fetching filtered data:", error);
      setFilteredData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilter = () => {
    setFilteredData(null);
  };

  // Use filtered data if available, otherwise use context data
  const displayExpenses = filteredData ? filteredData.expenses : expenses;
  const displayIncomes = filteredData ? filteredData.incomes : incomes;
  const displayCategoryTotals = filteredData ? filteredData.expenseCategoryTotals : null;

  return (
    <div className="mt-4">
      <DateFilter onApply={handleApplyFilter} onClear={handleClearFilter} />
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading filtered data...</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-2">
          <div className="md:col-span-2 flex flex-col gap-4">
            <ExpenseChart expenses={displayExpenses} />
            <CategoryTotals expenses={displayExpenses} categoryTotals={displayCategoryTotals} />
          </div>
          <div>
            <Transactions expenses={displayExpenses} incomes={displayIncomes} />
          </div>
        </div>
      )}
    </div>
  );
};

const App = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = loadStoredAuth();
    return stored?.username || null;
  });

  const { refetchExpenses } = useContext(ExpenseContext);

  const handleLogout = () => {
    clearStoredAuth();
    setCurrentUser(null);
    setActiveSection("home");
    window.location.reload();
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640 && activeSection === "mobileMenu") {
        setActiveSection("dashboard");
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeSection]);

  return (
    <div className="min-h-screen flex flex-col bg-[#BDD6F2]">
      {/* Header */}
      <header className="bg-[#EBF0F5] mb-2 rounded-b-md border-2 border-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
          <h1 className="text-3xl font-bold text-[#090979]">
            Smart Expense Tracker
          </h1>
          <div className="flex items-center gap-3">
            <div className="text-[#05375E] font-semibold">
              {currentUser ? `Signed in as ${currentUser}` : "Not signed in"}
            </div>
            {currentUser && (
              <button
                onClick={handleLogout}
                className="px-3 py-1 text-sm font-semibold text-white rounded bg-gradient-to-tr from-[#ABADB0] to-[#7585BA] hover:bg-gradient-to-bl hover:from-[#ABADB0] hover:to-[#7585BA] transition duration-300 cursor-pointer"
              >
                Log out
              </button>
            )}
          </div>
        </div>
      </header>

      {/* SIDEBAR FOR DESKTOP */}
      <div className="hidden md:flex flex-col bg-[#05375E] text-white w-16 py-6 fixed top-0 left-0 h-screen items-center space-y-6 border-2 border-white rounded-md">
        <button
          aria-label="Go to Home"
          onClick={() => setActiveSection("home")}
          className={`cursor-pointer ${activeSection === "home" ? "text-green-600" : ""}`}
        >
          <ChartPieIcon className="w-8 h-8 text-white" />
        </button>
        <button
          aria-label="Go to Dashboard"
          onClick={() => setActiveSection("dashboard")}
          className={`cursor-pointer ${activeSection === "dashboard" ? "text-green-600" : ""}`}
        >
          <HomeIcon className="w-8 h-8" />
        </button>
        <button
          aria-label="Go to Income"
          onClick={() => setActiveSection("income")}
          className={`cursor-pointer ${activeSection === "income" ? "text-green-600" : ""}`}
        >
          <BanknotesIcon className="w-8 h-8" />
        </button>
        <button
          aria-label="Go to Expense"
          onClick={() => setActiveSection("expense")}
          className={`cursor-pointer ${activeSection === "expense" ? "text-green-600" : ""}`}
        >
          <CreditCardIcon className="w-8 h-8" />
        </button>
        <button
          aria-label={currentUser ? "Go to Profile" : "Go to Login"}
          onClick={() => setActiveSection(currentUser ? "profile" : "login")}
          className={`cursor-pointer ${
            activeSection === (currentUser ? "profile" : "login") ? "text-green-600" : ""
          }`}
        >
          <UserIcon className="w-8 h-8" />
        </button>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 md:ml-16 p-2">
        {/* Home */}
        {activeSection === "home" && (
          <div className="text-center p-10 bg-[#D9EAFA] flex flex-col justify-center items-center border-2 border-white min-h-screen">
            <Home />
            <button
              onClick={() => {
                if (window.innerWidth < 640) {
                  setActiveSection("mobileMenu"); // Mobile: show cards menu
                } else {
                  setActiveSection("dashboard"); // Desktop: go straight to dashboard
                }
              }}
              className="mt-6 px-6 py-3 bg-gradient-to-tl from-[#F598C0] to-[#72AFED] text-white rounded font-bold hover:bg-gradient-to-br hover:from-[#F598C0] hover:to-[#72AFED] cursor-pointer transition duration-500 focus:outline-none"
            >
              Go To Dashboard
            </button>
          </div>
        )}

        {/* MOBILE CARDS MENU */}
        {activeSection === "mobileMenu" && (
          <div>
            <MobileViewHomePage
              setActiveSection={setActiveSection}
              activeSection={activeSection}
            />
          </div>
        )}

        {/* Always SHOW SUMMARY */}
        {activeSection !== "home" &&
          activeSection !== "mobileMenu" &&
          activeSection !== "profile" && (
          <div>
            <button className="sm:hidden" onClick={() => setActiveSection("mobileMenu")}>
              <ArrowLeftCircleIcon className="w-8 h-8 text-white" />
            </button>
            <SummaryCards />
          </div>
          )}

        {/* DASHBOARD */}
        {activeSection === "dashboard" && (
          <DashboardSection />
        )}

        {/* INCOME */}
        {activeSection === "income" && (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <AddIncomeForm setActiveSection={setActiveSection} />
            </div>
            <div className="md:col-span-2">
              <IncomeFilterPanel />
              <IncomeList />
            </div>
          </div>
        )}

        {/* EXPENSE */}
        {activeSection === "expense" && (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <AddExpenseForm setActiveSection={setActiveSection} />
            </div>
            <div className="md:col-span-2">
              <FilterPanel />
              <ExpenseList />
            </div>
          </div>
        )}

        {/* LOGIN */}
        {activeSection === "login" && (
          <div className="mt-4 flex justify-center">
            <Login
              setActiveSection={setActiveSection}
              onLoginSuccess={async (username) => {
                setCurrentUser(username);
                try {
                  await refetchExpenses();
                } catch (e) {
                  // ignore errors here; toast handling is inside lower layers
                  console.error(e);
                }
              }}
            />
          </div>
        )}

        {/* PROFILE */}
        {activeSection === "profile" && (
          <div className="mt-4 flex justify-center">
            <UserProfile username={currentUser} />
          </div>
        )}

        {/* REGISTER */}
        {activeSection === "register" && (
          <div className="mt-4 flex justify-center">
            <Register setActiveSection={setActiveSection} />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
