import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./DashboardCalendar.css";
import Announcement from "@/components/Announcement";
import { useSelector } from "react-redux";

const DashboardCalendar = () => {
  const [date, setDate] = useState(new Date());
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-[600px] p-2 md:p-6 gap-6">
      {/* Left: Calendar */}
      <div className="w-full lg:w-1/2 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-4 md:p-6 shadow-xl flex flex-col items-center">
        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-blue-700 dark:text-blue-300 text-center">📅 Activities Calendar</h2>
        <Calendar onChange={setDate} value={date} className="rounded-2xl overflow-x-auto dark-calendar" />
        <p className="mt-4 text-gray-700 dark:text-gray-300 text-center text-sm md:text-lg">
          Selected Date: <span className="font-semibold text-blue-600 dark:text-blue-400">{date.toDateString()}</span>
        </p>
      </div>

      {/* Right: Announcements */}
      <div className="w-full lg:w-1/2">
        <Announcement />
      </div>
    </div>
  );
};

export default DashboardCalendar;
