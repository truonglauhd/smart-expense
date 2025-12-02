import React from "react";
import WelcomeIcon from "../assets/images/accounting.png";

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <h1 className="text-3xl sm:text-4xl text-[#0C0596] font-bold mb-6">
        Welcome to Smart Expense Tracker
      </h1>
      <div>
        <img
          src={WelcomeIcon}
          alt="welcome illustration"
          className="w-64 sm:w-80 md:w-96 h-auto"
        />
      </div>
    </div>
  );
};

export default Home;
