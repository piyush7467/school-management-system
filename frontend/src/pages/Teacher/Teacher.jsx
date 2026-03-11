import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import TeacherSidebar from "@/components/TeacherSidebar";
import { Outlet } from "react-router-dom";

const Teacher = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      {/* Navbar at the top */}
      <div className="flex-shrink-0">
        <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      </div>

      <div className="flex flex-1 overflow-hidden pt-16">
        {/* Sidebar */}
        <TeacherSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main content */}
        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Teacher;
