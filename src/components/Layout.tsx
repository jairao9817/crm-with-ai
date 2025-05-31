import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { Bars3Icon } from "@heroicons/react/24/outline";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
        isMobileOpen={mobileMenuOpen}
        setIsMobileOpen={setMobileMenuOpen}
      />

      {/* Mobile header */}
      <div className="lg:hidden bg-surface border-b border-border shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-background-secondary transition-colors"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold text-text-primary">CRM AI</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Main content */}
      <div
        className={`
          transition-all duration-300 ease-in-out
          lg:pl-64 ${sidebarCollapsed ? "lg:pl-16" : "lg:pl-64"}
        `}
      >
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
