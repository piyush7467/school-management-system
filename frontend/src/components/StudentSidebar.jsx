import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, User, ClipboardList, Bell, Calendar, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { MdEmojiTransportation } from "react-icons/md";

const StudentSidebar = ({ isOpen, onClose }) => {
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
    `w-full flex  items-center gap-2 p-3 rounded-lg transition-colors duration-200 
     ${activeItem === path
      ? "bg-blue-500 text-white dark:bg-blue-600"
      : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200"
    }`;

  const dropdownClass = (isOpen) =>
    `w-full flex  items-center justify-between p-3 rounded-lg transition-colors duration-200
     ${isOpen ? "bg-gray-200 dark:bg-gray-800" : "hover:bg-gray-100 dark:hover:bg-gray-800"} 
     text-gray-800 dark:text-gray-200`;

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
          onClick={() => {
            navigate("/student");
            onClose();
          }}
        >
          <span className="text-xl font-bold text-gray-800 dark:text-gray-200">
            Student Panel
          </span>
        </div>
        <hr />

        {/* Scrollable Navigation */}
        <nav className="flex-1 px-4 space-y-1 mt-4 md:mt-0 overflow-y-auto custom-scrollbar">
          {/* Dashboard */}
          <button
            className={menuClass("/student")}
            onClick={() => {
              setActiveItem("/student");
              navigate("/student");
              onClose();
            }}
          >
            <Home /> Dashboard
          </button>
          <hr />

          {/* Profile */}
          <button
            className={menuClass("/student/profile")}
            onClick={() => {
              setActiveItem("/student/profile");
              navigate("/student/profile");
              onClose();
            }}
          >
            <User /> Profile
          </button>
          <hr />

          {/* Classes */}
        
          <button
            className={menuClass("/student/classes")}
            onClick={() => {
              setActiveItem("/student/classes");
              navigate("/student/classes");
              onClose();
            }}
          >
            <ClipboardList />  <span className="mr-auto">My Classes</span>
          </button>

          <hr />

          {/* Attendance */}
          <button
            className={menuClass("/student/my-attendance")}
            onClick={() => {
              setActiveItem("/student/my-attendance");
              navigate("/student/my-attendance");
              onClose();
            }}
          >
            <Calendar /> Attendance
          </button>
          <hr />

          {/* Announcements */}
          <button
            className={menuClass("/student/announcements")}
            onClick={() => {
              setActiveItem("/student/announcements");
              navigate("/student/announcements");
              onClose();
            }}
          >
            <Bell /> Announcements
          </button>
          <hr />

          {/* Complaints */}
          <button
            className={menuClass("/student/complaints")}
            onClick={() => {
              setActiveItem("/student/complaints");
              navigate("/student/complaints");
              onClose();
            }}
          >
            <MessageSquare /> Complaints
          </button>
          <hr />

          {/* Transport */}
          <button
            className={menuClass("/student/transport")}
            onClick={() => {
              setActiveItem("/student/transport");
              navigate("/student/transport");
              onClose();
            }}
          >
            <MdEmojiTransportation /> Transport
          </button>
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

export default StudentSidebar;
