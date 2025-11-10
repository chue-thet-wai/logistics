import React, { useState } from "react";
import { Link, usePage } from "@inertiajs/inertia-react";
import { Inertia } from "@inertiajs/inertia";
import { links } from "../utils/menu";
import { useLanguage } from "../contexts/LanguageContext";

const Sidebar = () => {
  const { url, props } = usePage();
  const userPermissions = props.auth?.permissions || [];
  const [openSections, setOpenSections] = useState({});
  const { language } = useLanguage();

  const hasPermission = (permission) =>
    !permission || userPermissions.includes(permission);

  const isActive = (route) => (route ? url.startsWith(`/${route}`) : false);

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = () => {
    Inertia.post("/logout");
  };

  const renderSubLinks = (subLinks, parentKey = "") => {
    return subLinks.map((link, idx) => {
      if (!hasPermission(link.permission)) return null;

      const hasChildren = link.links && link.links.length > 0;
      const key = `${parentKey}-${idx}`;
      const isOpen = openSections[key];

      return (
        <div key={key}>
          {hasChildren ? (
            <button
              onClick={() => toggleSection(key)}
              className={`flex justify-between items-center w-full py-2 px-4 rounded-md text-sm transition-all ${
                isActive(link.route)
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              <span>{link.name}</span>
              <span>{isOpen ? "▾" : "▸"}</span>
            </button>
          ) : (
            <Link
              href={`/${link.route}`}
              className={`block py-2 px-4 rounded-md text-sm transition-all ${
                isActive(link.route)
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              {link.name}
            </Link>
          )}

          {hasChildren && isOpen && (
            <div className="ml-4 border-l border-gray-700">
              {renderSubLinks(link.links, key)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <aside className="fixed top-14 left-0 z-40 h-[calc(100vh-3.5rem)] w-64 bg-gray-900 text-gray-200 shadow-xl">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-gray-700 px-5">
        <Link
          href="/"
          className="flex items-center gap-3 text-lg font-semibold text-white tracking-wide"
        >
          <img
            src="/assets/images/menu/truck.png"
            alt="Logo"
            className="w-8 h-8 object-contain"
          />
          <span>Super Light Logistic</span>
        </Link>
      </div>

      {/* Menu */}
      <div className="flex flex-col h-[calc(100%-4rem)]">
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
          {links.map((section, idx) => {
            const sectionKey = `section-${idx}`;

            // Check if section has a direct route
            if (section.route) {
              if (!hasPermission(section.permission)) return null;
              return (
                <Link
                  key={sectionKey}
                  href={`/${section.route}`}
                  className={`flex items-center gap-3 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                    isActive(section.route)
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  {typeof section.icon === "string" ? (
                    <img
                      src={section.icon}
                      alt={section.title}
                      className="w-5 h-5 object-contain"
                    />
                  ) : (
                    section.icon
                  )}
                  {section.title}
                </Link>
              );
            }

            // Section with sub-links
            const visibleLinks =
              section.links?.filter((l) => hasPermission(l.permission)) || [];
            if (visibleLinks.length === 0) return null;

            const isOpen = openSections[sectionKey];

            return (
              <div key={sectionKey}>
                <button
                  onClick={() => toggleSection(sectionKey)}
                  className="w-full flex items-center justify-between py-2 px-3 rounded-md text-sm font-semibold text-gray-100 hover:bg-gray-700 transition-all"
                >
                  <span className="flex items-center gap-2">
                    {typeof section.icon === "string" ? (
                      <img
                        src={section.icon}
                        alt={section.title}
                        className="w-5 h-5 object-contain"
                      />
                    ) : (
                      section.icon
                    )}
                    {section.title}
                  </span>
                  <span className="text-xs">{isOpen ? "▾" : "▸"}</span>
                </button>

                {isOpen && (
                  <div className="mt-1 space-y-1 pl-3 border-l border-gray-700">
                    {renderSubLinks(visibleLinks, sectionKey)}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-gray-700 p-4">
          <button
            onClick={handleLogout}
            className="block w-full text-left text-sm text-gray-300 hover:text-red-400"
          >
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
