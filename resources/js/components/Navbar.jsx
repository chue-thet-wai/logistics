import React from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { MdNotifications, MdSettings } from "react-icons/md";
import { Link, usePage } from "@inertiajs/inertia-react";
import avatar from "../utils/avatar.jpg";
import { useStateContext } from "../contexts/ContextProvider";
import { UserProfile } from ".";

const Navbar = () => {
  const { auth } = usePage().props;
  const user = auth.user;

  const {
    activeMenu,
    setactiveMenu,
    isClicked,
    handleClick,
  } = useStateContext();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-6 py-2 h-14">
      {/* Left Section - Logo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-gray-400">
            <AiOutlineSearch className="text-lg" />
            <input
                type="text"
                placeholder="Search..."
                className="bg-transparent text-sm text-gray-500 placeholder-gray-400 focus:outline-none focus:ring-0 w-32 sm:w-40"
            />
        </div>
      </div>

      {/* Center Search */}
      <div className="flex items-center w-full max-w-xs mx-4 relative">
        <AiOutlineSearch className="absolute left-3 text-gray-400 text-lg" />
        <input
          type="text"
          placeholder="Search shipment ID..."
          className="w-full pl-10 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
        />
      </div>

      {/* Right Section */}
      <div className="relative flex items-center gap-5">
        {/* Notifications */}
        <button
          type="button"
          className="relative text-gray-600 hover:text-blue-600"
          title="Notifications"
        >
          <MdNotifications size={20} />
          <span className="absolute top-0 right-0 bg-red-500 text-white text-[9px] rounded-full px-[4px] py-[1px] -translate-y-1/2 translate-x-1/2">
            3
          </span>
        </button>

        {/* Settings */}
        <Link
          href="/profile/edit"
          className="text-gray-600 hover:text-blue-600"
          title="Settings"
        >
          <MdSettings size={20} />
        </Link>

        {/* User Avatar */}
        <div
          onClick={() => handleClick("userProfile")}
          className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-full transition"
        >
          <img
            src={user?.avatar || avatar}
            alt="user"
            className="w-8 h-8 rounded-full object-cover border border-gray-200"
          />
        </div>

        {/* User Dropdown */}
        {isClicked.userProfile && (
          <div className="absolute top-2 right-0 animate-fadeIn">
            <UserProfile user={user} />
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
