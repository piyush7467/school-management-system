import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "@/redux/slices/themeSlice";
import { logout } from "@/redux/slices/authSlice";
import { Sun, Moon, Bell, User, LogOut, Menu } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import logo from "../assets/hpaLogo.png";
import userLogo from "../assets/user.jpg";
import { messaging } from "@/firebase";
import { onMessage } from "firebase/messaging";
import notificationSound from "../assets/notification.mp3";

const Navbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme } = useSelector((state) => state.theme);
  const { user, role } = useSelector((state) => state.auth);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // Listen for foreground FCM notifications
  useEffect(() => {
    const audio = new Audio(notificationSound);

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Notification received: ", payload);

      // Add new notification at the top
      setNotifications((prev) => [payload, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Play notification sound
      audio.play();
    });

    return () => unsubscribe();
  }, []);

  // Toggle notification dropdown
  const handleToggleNotif = () => {
    setShowNotifDropdown(!showNotifDropdown);
    if (!showNotifDropdown) setUnreadCount(0);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate(`/${role}/login`);
  };

  return (
    <nav className="fixed top-0 left-0 w-full flex items-center justify-between p-4 bg-white dark:bg-gray-900 shadow-md z-50">
      {/* Mobile Sidebar Toggle */}
      <button
        className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 md:hidden"
        onClick={toggleSidebar}
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Logo */}
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => navigate(`/${role}/dashboard`)}
      >
        <img src={logo} alt="Logo" className="h-10 w-10" />
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">
          School System
        </h1>
      </div>

      {/* Right Side: Notifications, Theme, Profile */}
      <div className="flex items-center gap-4 relative">
        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            className="p-2 rounded-full relative"
            onClick={handleToggleNotif}
          >
            <Bell className="w-5 h-5 text-gray-800 dark:text-gray-200" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
                {unreadCount}
              </span>
            )}
          </Button>

          {/* Notification Dropdown */}
          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg z-50">
              {notifications.length === 0 ? (
                <p className="p-2 text-sm text-gray-500">No new notifications</p>
              ) : (
                notifications.map((n, idx) => (
                  <div
                    key={idx}
                    className="p-2 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-200"
                  >
                    <p className="font-medium">{n.notification?.title}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">
                      {n.notification?.body}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          className="p-2 rounded-full"
          onClick={() => dispatch(toggleTheme())}
        >
          {theme === "light" ? (
            <Moon className="w-5 h-5 text-gray-800" />
          ) : (
            <Sun className="w-5 h-5 text-yellow-400" />
          )}
        </Button>

        {/* Profile Dropdown */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="w-10 h-10">
                <AvatarImage src={user?.profilePic || userLogo} />
                <AvatarFallback>{user?.name?.slice(0, 2)}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56 dark:bg-gray-800">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem onSelect={() => navigate(`/${role}/profile`)}>
                  <User className="mr-2 h-4 w-4" /> Profile
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button>
            <Link to="/login">Login</Link>
          </Button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
