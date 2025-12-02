import React, { useContext, useEffect, useState } from "react";
import { ExpenseContext } from "../context/ExpenseContext";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/solid";

const AddIncomeForm = ({ setActiveSection }) => {
  const { editingIncome, setEditingIncome, addIncome, updateIncome } =
    useContext(ExpenseContext);

  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date());
  const [note, setNote] = useState("");
  const [category, setCategory] = useState("wage");

  useEffect(() => {
    if (editingIncome) {
      setAmount(editingIncome.amount);
      setDate(editingIncome.date ? new Date(editingIncome.date) : new Date());
      setNote(editingIncome.note || "");
      setCategory(editingIncome.category || "wage");
    } else {
      setAmount("");
      setDate(new Date());
      setNote("");
      setCategory("wage");
    }
  }, [editingIncome]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount) {
      toast.error("Amount is required!");
      return;
    }
    if (!date) {
      toast.error("Please fill the date field");
      return;
    }

    const payload = {
      amount: parseFloat(amount),
      category,
      date: new Date(date).toISOString().split("T")[0], 
      note,
    };

    try {
      if (editingIncome) {
        await updateIncome(editingIncome.id, payload);
        toast.success("Income updated!");
        setEditingIncome(null);
      } else {
        await addIncome(payload);
        toast.success("Income added!");
      }

      setAmount("");
      setDate(new Date());
      setNote("");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleClear = () => {
    setEditingIncome(null);
    setAmount("");
    setDate(new Date());
    setNote("");
    setCategory("wage");
  };

  const handleClose = () => {
    setActiveSection("dashboard");
    handleClear();
  };

  return (
    <div className="bg-[#ffff] p-4 md:px-4 md:py-2 rounded-md shadow mt-4 relative">
      {editingIncome && (
        <button
          type="button"
          onClick={handleClear}
          className="flex items-center gap-2 text-[#127487] font-semibold hover:underline mb-2"
        >
          <ArrowUturnLeftIcon className="w-5 h-5" />
          Back to Add
        </button>
      )}
      <h2 className="text-3xl font-bold md:mt-5 mb-2 text-[#127487]">
        {editingIncome ? "✏Edit Income" : "💰Add Income"}
      </h2>

      <button
        onClick={handleClose}
        className="px-4 py-2 bg-gradient-to-bl from-[#eeabab] to-[#f380b5] hover:bg-gradient-to-tr hover:from-[#FF0000] hover:to-[#FA7DB7] font-semibold text-white rounded absolute right-2 top-4 md:right-4 md:top-7 cursor-pointer transition duration-500"
      >
        Close
      </button>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block mb-1 font-semibold text-[#2A7B9B] text-xl">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border-2 border-[#1D6E91] p-2 rounded focus:outline-none caret-[#57C785] text-gray-500 font-semibold cursor-pointer"
            required
          >
            <option value="wage">Wage</option>
            <option value="salary">Salary</option>
            <option value="commission">Commission</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 font-semibold text-[#2A7B9B] text-xl">
            Amount
          </label>
          <input
            type="number"
            value={amount}
            placeholder="Enter amount"
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border-2 border-[#1D6E91] px-3 py-2 rounded focus:outline-none caret-[#57C785] text-gray-500 font-semibold"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold text-[#2A7B9B] text-xl">
            Date
          </label>
          <DatePicker
            selected={date}
            onChange={(selectedDate) => setDate(selectedDate)}
            dateFormat="yyyy-MM-dd"
            className="w-full border-2 border-[#1D6E91] p-2 rounded focus:outline-none caret-[#57C785] text-gray-500 font-semibold"
            calendarClassName="my-calendar"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold text-[#2A7B9B] text-xl">
            Note
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full border-2 border-[#1D6E91] px-3 py-2 rounded focus:outline-none caret-[#57C785] text-gray-500 font-semibold"
            placeholder="Optional"
          />
        </div>

        <div className="flex justify-between items-center md:mt-10">
          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-tr from-[#46e2e7] to-[#bf8ef7] text-white rounded hover:bg-gradient-to-bl hover:from-[#3F5EFB] hover:to-[#FC466B] font-semibold cursor-pointer transition duration-500"
          >
            {editingIncome ? "Update" : "Add Income"}
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 text-white rounded font-semibold bg-gradient-to-tr from-[#ABADB0] to-[#7585BA] hover:bg-gradient-to-bl hover:from-[#ABADB0] hover:to-[#7585BA] transition duration-500 cursor-pointer"
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddIncomeForm;
