import React from "react";
import { Link, usePage } from "@inertiajs/inertia-react";
import { FaBoxOpen, FaHome, FaBell, FaCog } from "react-icons/fa";

export default function DriverMain({ children }) {
    const page = usePage();
    const auth = page?.props?.auth;
    const user = auth?.user;
    const currentUrl = page?.url || "";   // SAFE URL VALUE

    return (
        <div className="flex flex-col min-h-screen bg-gray-100">

            {/* PAGE CONTENT */}
            <div className="pb-4"> 
                {children}
            </div>

            {/* BOTTOM NAV */}
            <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg py-2 flex justify-between px-8 z-20">
                <NavItem
                    href="/driver/dashboard"
                    icon={<FaHome size={22} />}
                    url={currentUrl}
                />
                <NavItem
                    href="/driver/trips"
                    icon={<FaBoxOpen size={22} />}
                    url={currentUrl}
                />
                <NavItem
                    href="/driver/notifications"
                    icon={<FaBell size={22} />}
                    url={currentUrl}
                />
                <NavItem
                    href="/driver/settings"
                    icon={<FaCog size={22} />}
                    url={currentUrl}
                />
            </div>
        </div>
    );
}

function NavItem({ href, icon, url }) {
    const isActive = url === href || url.startsWith(href);

    return (
        <Link
            href={href}
            className={`flex flex-col items-center gap-1 px-3 ${
                isActive ? "text-blue-600" : "text-gray-500"
            }`}
        >
            {icon}
            {isActive && <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>}
        </Link>
    );
}
