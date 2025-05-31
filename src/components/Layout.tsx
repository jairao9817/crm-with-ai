import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { TopNavbar } from "./TopNavbar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navbar */}
      <TopNavbar
        onMobileMenuToggle={() => setMobileMenuOpen(true)}
        showMobileMenuButton={true}
      />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          isCollapsed={sidebarCollapsed}
          setIsCollapsed={setSidebarCollapsed}
          isMobileOpen={mobileMenuOpen}
          setIsMobileOpen={setMobileMenuOpen}
        />

        {/* Main content */}
        <div
          className={`
            flex-1 transition-all duration-300 ease-in-out
            lg:ml-64 ${sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"}
          `}
        >
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
