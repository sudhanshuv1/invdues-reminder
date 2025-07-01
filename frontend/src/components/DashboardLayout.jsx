import React from 'react';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex h-[calc(100vh-7.5rem)] bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <Sidebar />
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;