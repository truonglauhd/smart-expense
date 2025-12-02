import React, { useContext } from "react";
import { ExpenseContext } from "../context/ExpenseContext";

const IncomeFilterPanel = () => {
  const { incomeFilters, setIncomeFilters } = useContext(ExpenseContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "amountRange") {
      const [min, max] = value.split("-");
      setIncomeFilters((prev) => ({
        ...prev,
        amountRange: value,
        minAmount: min || "",
        maxAmount: max === "+" ? "" : max || "",
      }));
    } else {
      setIncomeFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const clearFilters = () => {
    setIncomeFilters({
      category: "",
      startDate: "",
      endDate: "",
      minAmount: "",
      maxAmount: "",
      amountRange: "",
      sort: "newest",
    });
  };

  return (
    <div className="bg-[#F7F9FC] p-4 rounded-md md:mt-4 mb-2 flex flex-wrap gap-4 relative">
      <div className="flex flex-col">
        <label className="text-gray-700 text-[16px] font-semibold">
          Category
        </label>
        <select
          name="category"
          value={incomeFilters.category}
          onChange={handleChange}
          className="text-sm text-gray-400 rounded font-semibold border-2 border-gray-400 focus:border-gray-400 focus:outline-none cursor-pointer"
        >
          <option value="">All</option>
          <option value="wage">Wage</option>
          <option value="salary">Salary</option>
          <option value="commission">Commission</option>
        </select>
      </div>

      <div className="flex flex-col">
        <label className="text-gray-700 text-[16px] font-semibold">
          Amount Range
        </label>
        <select
          name="amountRange"
          value={incomeFilters.amountRange || ""}
          onChange={handleChange}
          className="text-sm text-gray-400 rounded font-semibold border-2 border-gray-400 focus:border-gray-400 focus:outline-none cursor-pointer"
        >
          <option value="">All</option>
          <option value="0-100">0 - 100</option>
          <option value="100-500">100 - 500</option>
          <option value="500-1000">500 - 1000</option>
          <option value="1000-+">1000+</option>
        </select>
      </div>

      <div className="flex gap-2">
        <div className="space-x-2 xl:flex xl:flex-col">
          <label className="text-gray-700 text-[16px] font-semibold">
            From
          </label>
          <input
            type="date"
            name="startDate"
            value={incomeFilters.startDate}
            onChange={handleChange}
            className="text-sm text-gray-400 rounded font-semibold border-2 border-gray-400 focus:border-gray-400 focus:outline-none cursor-pointer"
          />
        </div>
        <div className="space-x-2 xl:flex xl:flex-col">
          <label className="text-gray-700 text-[16px] font-semibold">
            To
          </label>
          <input
            type="date"
            name="endDate"
            value={incomeFilters.endDate}
            onChange={handleChange}
            className="text-sm text-gray-400 rounded font-semibold border-2 border-gray-400 focus:border-gray-400 focus:outline-none cursor-pointer"
          />
        </div>
      </div>

      <div className="flex flex-col">
        <label className="text-gray-700 text-[16px] font-semibold">
          Sort By
        </label>
        <select
          name="sort"
          value={incomeFilters.sort || "newest"}
          onChange={handleChange}
          className="text-sm text-gray-400 rounded font-semibold border-2 border-gray-400 focus:border-gray-400 focus:outline-none cursor-pointer"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="amount-high">Amount (High to Low)</option>
          <option value="amount-low">Amount (Low to High)</option>
        </select>
      </div>

      <button
        onClick={clearFilters}
        className="px-3 py-1 text-white font-semibold rounded bg-gradient-to-tr from-[#ABADB0] to-[#7585BA] hover:bg-gradient-to-bl hover:from-[#ABADB0] hover:to-[#7585BA] transition duration-500 cursor-pointer md:absolute md:right-4 md:top-4"
      >
        Clear
      </button>
    </div>
  );
};

export default IncomeFilterPanel;

