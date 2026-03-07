import React from 'react';
import { Bell, Menu, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { getNavigationItemByPath } from '../../config/navigation';

const Header = ({ user, notifications = [], onToggleSidebar, isSidebarOpen }) => {
  const location = useLocation();
  
  // Get current page title from navigation config
  const currentPath = location.pathname.replace('/dashboard/', '');
  const navItem = getNavigationItemByPath(currentPath);
  const pageTitle = navItem?.label || 'Dashboard';

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6">
      {/* Left side - Mobile menu toggle & Page title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-md"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{pageTitle}</h1>
          <p className="text-sm text-gray-500 hidden sm:block">
            Welcome back, {user?.first_name}
          </p>
        </div>
      </div>

      {/* Right side - Notifications & User */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          {notifications.length > 0 && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {notifications.length > 9 ? '9+' : notifications.length}
            </span>
          )}
        </button>

        {/* User Avatar (visible on larger screens) */}
        <div className="hidden md:flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
