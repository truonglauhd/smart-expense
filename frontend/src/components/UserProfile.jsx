import React from "react";
import { UserCircleIcon } from "@heroicons/react/24/solid";

const UserProfile = ({ username }) => {
  const displayName = username || "Guest";

  return (
    <div className="bg-white p-6 rounded-md shadow-md w-full max-w-md border border-[#E6EEF7]">
      <div className="flex items-center gap-4">
        <UserCircleIcon className="w-16 h-16 text-[#127487]" />
        <div>
          <h2 className="text-2xl font-bold text-[#127487]">Profile</h2>
          <p className="text-[#2A7B9B] font-semibold">Username: {displayName}</p>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;


