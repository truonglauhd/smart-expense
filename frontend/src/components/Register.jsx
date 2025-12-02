import React, { useState } from "react";
import { toast } from "react-toastify";
import { ArrowLeftCircleIcon } from "@heroicons/react/24/outline";
import { apiRegister } from "../services/api";

const Register = ({ setActiveSection }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim()) {
      toast.error("Username is required.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRegister({
        username: username.trim(),
        password,
      });
      toast.success("Account created! Please log in.");
      setActiveSection("login");
    } catch (err) {
      console.error(err);
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Registration failed. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setUsername("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="bg-[#ffff] p-4 md:px-4 md:py-2 rounded-md shadow relative w-full max-w-md">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl lg:text-3xl font-bold md:mt-2 mb-4 text-[#127487]">
          📝Register
        </h2>
        <button
          className="sm:hidden"
          onClick={() => setActiveSection("login")}
          aria-label="Back to login"
        >
          <ArrowLeftCircleIcon className="w-8 h-8 text-[#127487]" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-semibold text-[#2A7B9B] text-xl">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border-2 border-[#1D6E91] px-3 py-2 rounded focus:outline-none caret-[#57C785] text-gray-500 font-semibold"
            placeholder="Choose a username"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold text-[#2A7B9B] text-xl">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-2 border-[#1D6E91] px-3 py-2 rounded focus:outline-none caret-[#57C785] text-gray-500 font-semibold"
            placeholder="Create a password"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold text-[#2A7B9B] text-xl">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border-2 border-[#1D6E91] px-3 py-2 rounded focus:outline-none caret-[#57C785] text-gray-500 font-semibold"
            placeholder="Confirm your password"
            required
          />
        </div>

        <button
          type="button"
          onClick={() => setActiveSection("login")}
          className="text-[#127487] font-semibold hover:underline self-start"
        >
          Already have an account? Login
        </button>

        <div className="flex justify-between items-center md:mt-3">
          <button
          type="submit"
          disabled={isSubmitting}
          className={`px-4 py-2 bg-gradient-to-tr from-[#46e2e7] to-[#a766f1] text-white rounded font-semibold transition duration-500 ${
            isSubmitting
              ? "opacity-70 cursor-not-allowed"
              : "hover:bg-gradient-to-bl hover:from-[#3F5EFB] hover:to-[#FC466B] cursor-pointer"
          }`}
          >
          {isSubmitting ? "Registering..." : "Register"}
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

export default Register;


