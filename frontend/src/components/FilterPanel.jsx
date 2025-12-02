import React, { useContext } from "react";
import { ExpenseContext } from "../context/ExpenseContext";

const FilterPanel = () => {
  const { filters, setFilters } = useContext(ExpenseContext);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // If preset range, split it into min/max
    if (name === "amountRange") {
      const [min, max] = value.split("-");
      setFilters((prev) => ({
        ...prev,
        amountRange: value, // keep selected value
        minAmount: min || "",
        maxAmount: max === "+" ? "" : max || "",
      }));
    } else {
      // Category, startDate, endDate, etc.
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const clearFilters = () => {
    setFilters({
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
    <div className="bg-[#F7F9FC] p-4 rounded-md md:mt-4 sm:flex sm:justify-between md:relative mb-1">
      <div className="flex flex-wrap gap-3">
        {/* Category */}
        <div className="flex flex-col">
          <label className="text-gray-700 text-[16px] font-semibold">
            Category
          </label>
          <select
            name="category"
            value={filters.category}
            onChange={handleChange}
            className="text-sm text-gray-400 rounded font-semibold border-2 border-gray-400 focus:border-gray-400 focus:outline-none cursor-pointer"
          >
            <option value="">📌All</option>
            <option value="Food">🍕Food</option>
            <option value="Travel">✈Travel</option>
            <option value="Bills">📰Bills</option>
            <option value="Others">🔗Others</option>
          </select>
        </div>

        {/* Amount Range */}
        <div className="flex flex-col">
          <label className="text-gray-700 text-[16px] font-semibold">
            Amount Range
          </label>
          <select
            name="amountRange"
            value={filters.amountRange || ""}  // <- safe default
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

        {/* Date Range */}
        <div className="flex gap-2">
          {/* From */}
          <div className="space-x-2 xl:flex xl:flex-col">
            <label className="text-gray-700 text-[16px] font-semibold">
              From
            </label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleChange}
              className="text-sm text-gray-400 rounded font-semibold border-2 border-gray-400 focus:border-gray-400 focus:outline-none cursor-pointer"
            />
          </div>

          {/* To */}
          <div className="space-x-2 xl:flex xl:flex-col">
            <label className="text-gray-700 text-[16px] font-semibold">
              To
            </label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleChange}
              className="text-sm text-gray-400 rounded font-semibold border-2 border-gray-400 focus:border-gray-400 focus:outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Sort By */}
        <div className="flex flex-col">
          <label className="text-gray-700 text-[16px] font-semibold">
            Sort By
          </label>
          <select
            name="sort"
            value={filters.sort || "newest"}
            onChange={handleChange}
            className="text-sm text-gray-400 rounded font-semibold border-2 border-gray-400 focus:border-gray-400 focus:outline-none cursor-pointer"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="amount-high">Amount (High to Low)</option>
            <option value="amount-low">Amount (Low to High)</option>
          </select>
        </div>
      </div>

      <button
        onClick={clearFilters}
        className="px-3 py-1 text-white font-semibold rounded mt-2 md:absolute md:top-2 md:right-2 bg-gradient-to-tr from-[#ABADB0] to-[#7585BA] hover:bg-gradient-to-bl hover:from-[#ABADB0] hover:to-[#7585BA] transition duration-500 cursor-pointer"
      >
        Clear
      </button>
    </div>
  );
};

export default FilterPanel;
