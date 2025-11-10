import React, { useRef } from "react";
import { FiSettings, FiLogOut } from "react-icons/fi";
import { MdClose } from "react-icons/md";
import avatar from "../utils/avatar.jpg";
import { Inertia } from "@inertiajs/inertia";
import { useStateContext } from "../contexts/ContextProvider";
import { useLanguage } from "../contexts/LanguageContext";
import { translations } from "../utils/lang";

const UserProfile = ({ user }) => {
  const profileRef = useRef();
  const { handleReset } = useStateContext();
  const { language } = useLanguage();
  const t = translations[language]; 

  const handleLogout = () => {
    Inertia.post("/logout");
    handleReset();
  };

  const handleUserSettings = () => {
    handleReset();
    Inertia.visit("/profile/edit");
  };

  return (
    <div
      ref={profileRef}
      className="absolute right-4 top-14 w-64 bg-white rounded-md shadow-md z-50 text-sm"
    >
      {/* Close Button */}
      <button
        onClick={handleReset}
        className="absolute top-2 right-2 p-1 rounded hover:bg-gray-200"
        aria-label={t.close || "Close profile"}
      >
        <MdClose className="text-gray-600" size={20} />
      </button>

      {/* User Info */}
      <div className="flex items-center gap-3 px-4 py-3 border-b">
        <img
          className="w-10 h-10 rounded-full object-cover"
          src={user?.avatar || avatar}
          alt="User"
        />
        <div className="leading-tight">
          <p className="font-medium text-gray-800">{user?.name || t.admin}</p>
          {user?.agent?.id && (
            <p className="text-xs text-gray-500">
              {t.agentId} {user.agent.agent_id}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col">
        <button
          onClick={handleUserSettings}
          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-left"
        >
          <FiSettings className="text-gray-600" />
          <span>{t.userSetting}</span>
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-left"
        >
          <FiLogOut className="text-gray-600" />
          <span>{t.logout}</span>
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
