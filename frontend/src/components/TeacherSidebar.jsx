import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, User, ClipboardList, Bell, Calendar, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const TeacherSidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [activeItem, setActiveItem] = useState(location.pathname);

  useEffect(() => {
    setActiveItem(location.pathname);
  }, [location.pathname]);

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const menuClass = (path) =>
    `w-full flex items-center gap-2 p-3 rounded-lg transition-colors duration-200 
     ${
       activeItem === path
         ? "bg-blue-500 text-white dark:bg-blue-600"
         : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200"
     }`;

  return (
    <>
      {/* Sidebar */}
      <div
        className={`overflow-auto fixed md:relative top-16 md:top-0 left-0 h-[calc(100vh-64px)] md:h-screen w-64 bg-white dark:bg-gray-900 shadow-lg flex flex-col
        transform ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        transition-transform duration-300 ease-in-out z-50 md:translate-x-0`}
      >
        {/* Logo */}
        <div
          className="hidden md:flex p-6 items-center gap-2 cursor-pointer flex-shrink-0"
          onClick={() => navigate("/teacher")}
        >
          <span className="text-xl font-bold text-gray-800 dark:text-gray-200">
            Teacher Panel
          </span>
        </div>
        <hr />

        {/* Scrollable Navigation */}
        <nav className="flex-1 px-4 space-y-1 mt-4 md:mt-0 overflow-y-auto custom-scrollbar">
          {/* Dashboard */}
          <button
            className={menuClass("/teacher")}
            onClick={() => {
              setActiveItem("/teacher");
              navigate("/teacher");
              onClose();
            }}
          >
            <Home /> Dashboard
          </button>
          <hr />

          {/* Profile */}
          <button
            className={menuClass("/teacher/profile")}
            onClick={() => {
              setActiveItem("/teacher/profile");
              navigate("/teacher/profile");
              onClose();
            }}
          >
            <User /> Profile
          </button>
          <hr />

          {/* Classes Dropdown */}
          {/* <div>
            <button
              className={`w-full flex items-center gap-4 p-3 rounded-lg 
                ${openDropdown === "classes" ? "bg-gray-200 dark:bg-gray-800" : "hover:bg-gray-100 dark:hover:bg-gray-800"} 
                text-gray-800 dark:text-gray-200`}
              onClick={() => toggleDropdown("classes")}
            >
              <ClipboardList /> My Classes
              <div className="ml-auto">
                {openDropdown === "classes" ? <ChevronUp /> : <ChevronDown />}
              </div>
            </button>
            {openDropdown === "classes" && (
              <div className="pl-8 flex flex-col gap-1 mt-1">
                {[
                  { label: "Class & Section", path: "/teacher/classes" },
                  { label: "Subjects", path: "/teacher/subjects" },
                ].map((item) => (
                  <button
                    key={item.path}
                    className={`p-2 rounded text-left w-full ${
                      activeItem === item.path
                        ? "bg-blue-500 text-white dark:bg-blue-600"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200"
                    }`}
                    onClick={() => {
                      setActiveItem(item.path);
                      navigate(item.path);
                      onClose();
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div> */}
          {/* <hr /> */}


          <button
            className={menuClass("/teacher/classes")}
            onClick={() => {
              setActiveItem("/teacher/classes");
              navigate("/teacher/classes");
              onClose();
            }}
          >
            <ClipboardList /> My Classes
          </button>
          <hr />

          {/* Attendance */}
          <button
            className={menuClass("/teacher/attendance")}
            onClick={() => {
              setActiveItem("/teacher/attendance");
              navigate("/teacher/attendance");
              onClose();
            }}
          >
            <Calendar /> Attendance
          </button>
          <hr />

          {/* Announcements */}
          <button
            className={menuClass("/teacher/announcements")}
            onClick={() => {
              setActiveItem("/teacher/announcements");
              navigate("/teacher/announcements");
              onClose();
            }}
          >
            <Bell /> Announcements
          </button>
          <hr />

          {/* Complaints */}
          <button
            className={menuClass("/teacher/complaints")}
            onClick={() => {
              setActiveItem("/teacher/complaints");
              navigate("/teacher/complaints");
              onClose();
            }}
          >
            <MessageSquare /> Complaints
          </button>
          <hr />
        </nav>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-30 z-40 md:hidden"
          onClick={onClose}
        />
      )}
    </>
  );
};

export default TeacherSidebar;
