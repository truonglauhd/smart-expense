import React, { useState } from "react";

const DateFilter = ({ onApply, onClear }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleApply = () => {
    if (startDate || endDate) {
      onApply(startDate || null, endDate || null);
    }
  };

  const handleClear = () => {
    setStartDate("");
    setEndDate("");
    onClear();
  };

  return (
    <div className="bg-white p-4 rounded-md shadow-lg mb-4">
      <h3 className="text-xl font-bold text-[#127487] mb-4">
        📅 Filter by Date Period
      </h3>
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#127487]"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#127487]"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleApply}
            className="px-6 py-2 bg-gradient-to-r from-[#127487] to-[#0C0596] text-white rounded-md font-semibold hover:opacity-90 transition duration-200 focus:outline-none focus:ring-2 focus:ring-[#127487]"
          >
            Apply
          </button>
          <button
            onClick={handleClear}
            className="px-6 py-2 bg-gray-500 text-white rounded-md font-semibold hover:bg-gray-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateFilter;

