import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';

export default function AppLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navbar */}
        <TopNavbar onMobileMenuOpen={() => setIsMobileOpen(true)} />

        {/* Scrollable Main Content Area — keyed on pathname triggers page-fade-in */}
        <main
          key={location.pathname}
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 page-fade-in"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
