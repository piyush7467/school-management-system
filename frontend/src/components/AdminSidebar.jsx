import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "@/redux/slices/authSlice";
import {
  Home,
  User,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiGoogleclassroom } from "react-icons/si";
import { FaRegCalendarAlt } from "react-icons/fa";
import { MdEmojiTransportation } from "react-icons/md";

const AdminSidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [openDropdown, setOpenDropdown] = useState(null);
  const [activeItem, setActiveItem] = useState(location.pathname);

  useEffect(() => {
    setActiveItem(location.pathname);
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/admin/login");
  };

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  // Utility to apply active class
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
          onClick={() => navigate("/admin/dashboard")}
        >
          <span className="text-xl font-bold text-gray-800 dark:text-gray-200">
            Admin Panel
          </span>
        </div>
        <hr />

        {/* Scrollable Navigation */}
        <nav className="flex-1 px-4 space-y-1 mt-4 md:mt-0 overflow-y-auto custom-scrollbar">
          {/* Dashboard */}
          <button
            className={menuClass("/admin/dashboard")}
            onClick={() => {
              setActiveItem("/admin/dashboard");
              navigate("/admin/dashboard");
              onClose();
            }}
          >
            <Home /> Dashboard
          </button>
          <hr />

          {/* Students */}
          <button
            className={menuClass("/admin/students")}
            onClick={() => {
              setActiveItem("/admin/students");
              navigate("/admin/students");
              onClose();
            }}
          >
            <Users /> Students
          </button>
          <hr />

          {/* Teachers */}
          <button
            className={menuClass("/admin/teachers")}
            onClick={() => {
              setActiveItem("/admin/teachers");
              navigate("/admin/teachers");
              onClose();
            }}
          >
            <User /> Teachers
          </button>
          <hr />

          {/* Classes Dropdown */}
          <div>
            <button
              className={`w-full flex items-center gap-4 p-3 rounded-lg 
                ${openDropdown === "classes" ? "bg-gray-200 dark:bg-gray-800" : "hover:bg-gray-100 dark:hover:bg-gray-800"} 
                text-gray-800 dark:text-gray-200`}
              onClick={() => toggleDropdown("classes")}
            >
              <SiGoogleclassroom /> Classes
              <div className="ml-auto">
                {openDropdown === "classes" ? <ChevronUp /> : <ChevronDown />}
              </div>
            </button>
            {openDropdown === "classes" && (
              <div className="pl-8 flex flex-col gap-1 mt-1">
                {[
                  { label: "Classes", path: "/admin/class" },
                  { label: "Subjects", path: "/admin/subjects" },
                  { label: "Subject Mark Fields", path: "/admin/subject-mark-fields" },
                  { label: "Marks", path: "/admin/marks" },
                  { label: "Exams", path: "/admin/exams" },
                  { label: "Room", path: "/admin/rooms" },
                  { label: "Time Table", path: "/admin/time-table" },
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
          </div>
          <hr />

          {/* Attendance Dropdown */}
          <div>
            <button
              className={`w-full flex items-center gap-4 p-3 rounded-lg 
                ${openDropdown === "attendance" ? "bg-gray-200 dark:bg-gray-800" : "hover:bg-gray-100 dark:hover:bg-gray-800"} 
                text-gray-800 dark:text-gray-200`}
              onClick={() => toggleDropdown("attendance")}
            >
              <SiGoogleclassroom /> Attendance
              <div className="ml-auto">
                {openDropdown === "attendance" ? <ChevronUp /> : <ChevronDown />}
              </div>
            </button>
            {openDropdown === "attendance" && (
              <div className="pl-8 flex flex-col gap-1 mt-1">
                {[
                  { label: "Student Attendance", path: "/admin/student-attendance" },
                  { label: "Teacher Attendance", path: "/admin/teacher-attendance" },
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
          </div>
          <hr />

          {/* Profile */}
          <button
            className={menuClass("/admin/profile")}
            onClick={() => {
              setActiveItem("/admin/profile");
              navigate("/admin/profile");
              onClose();
            }}
          >
            <User /> Profile
          </button>
          <hr />

          {/* Events */}
          <button
            className={menuClass("/admin/events")}
            onClick={() => {
              setActiveItem("/admin/events");
              navigate("/admin/events");
              onClose();
            }}
          >
            <FaRegCalendarAlt /> Events
          </button>
          <hr />

          {/* Transport */}
          <button
            className={menuClass("/admin/transport")}
            onClick={() => {
              setActiveItem("/admin/transport");
              navigate("/admin/transport");
              onClose();
            }}
          >
            <MdEmojiTransportation /> Transport
          </button>
          <hr />

          {/* Settings */}
          <button
            className={menuClass("/admin/settings")}
            onClick={() => {
              setActiveItem("/admin/settings");
              navigate("/admin/settings");
              onClose();
            }}
          >
            <Settings /> Settings
          </button>

          {/* Logout at Bottom (fixed) */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            <Button
              variant="destructive"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" /> Logout
            </Button>
          </div>
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

export default AdminSidebar;
