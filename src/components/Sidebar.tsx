import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  UsersIcon,
  BriefcaseIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid,
  UsersIcon as UsersIconSolid,
  BriefcaseIcon as BriefcaseIconSolid,
} from "@heroicons/react/24/solid";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconSolid: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const navigation: NavigationItem[] = [
  {
    name: "Dashboard",
    href: "/home",
    icon: HomeIcon,
    iconSolid: HomeIconSolid,
  },
  {
    name: "Contacts",
    href: "/contacts",
    icon: UsersIcon,
    iconSolid: UsersIconSolid,
  },
  {
    name: "Deals",
    href: "/deals",
    icon: BriefcaseIcon,
    iconSolid: BriefcaseIconSolid,
  },
];

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const location = useLocation();

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-end p-4 border-b border-border">
        {/* Desktop collapse toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:block p-1 rounded-md hover:bg-background-secondary transition-colors"
        >
          {isCollapsed ? (
            <ChevronRightIcon className="h-5 w-5 text-text-secondary" />
          ) : (
            <ChevronLeftIcon className="h-5 w-5 text-text-secondary" />
          )}
        </button>

        {/* Mobile close button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden p-1 rounded-md hover:bg-background-secondary transition-colors"
        >
          <XMarkIcon className="h-5 w-5 text-text-secondary" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const active = isActive(item.href);
          const IconComponent = active ? item.iconSolid : item.icon;

          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={`
                flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${
                  active
                    ? "bg-primary-100 text-primary-700 border-l-4 border-primary-600"
                    : "text-text-secondary hover:text-text-primary hover:bg-background-secondary"
                }
                ${isCollapsed ? "justify-center" : ""}
              `}
              title={isCollapsed ? item.name : undefined}
            >
              <IconComponent className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span className="ml-3">{item.name}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <div
        className={`
          hidden lg:flex lg:flex-col lg:fixed lg:top-16 lg:bottom-0 lg:z-30
          bg-surface border-r border-border shadow-sm
          transition-all duration-300 ease-in-out
          ${isCollapsed ? "lg:w-16" : "lg:w-64"}
        `}
      >
        {sidebarContent}
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`
          fixed top-16 bottom-0 left-0 z-50 w-64 bg-surface border-r border-border shadow-lg
          transform transition-transform duration-300 ease-in-out lg:hidden
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {sidebarContent}
      </div>
    </>
  );
};

export default Sidebar;
