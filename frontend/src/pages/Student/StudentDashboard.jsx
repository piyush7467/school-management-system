import React, { useEffect, useState } from "react";
import {
  BookOpen,
  Calendar,
  Bell,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import API from "@/api/axios";
import DashboardCalendar from "@/components/DashboardCalendar";

const StudentDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    myClasses: [],
    announcements: 0,
    myComplaints: 0,
    attendancePercent: 0,
  });

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStatsAndComplaints = async () => {
      try {
        setLoading(true);
        setError("");

        const [classesRes, announcementsRes, complaintsRes, attendanceRes] =
          await Promise.allSettled([
            API.get("/student/auth/classe"),
            API.get("/student/auth/announcement/all"),
            API.get("/student/auth/complaint/my"),
            API.get("/student/auth/attendance/class/me/my-attendance"), // ✅ student attendance route
          ]);

        // Calculate attendance %
        let attendancePercent = 0;
        if (attendanceRes.status === "fulfilled") {
          const records = attendanceRes.value.data.records || [];
          if (records.length > 0) {
            const presentCount = records.filter((r) => r.status === "Present").length;
            attendancePercent = Math.round((presentCount / records.length) * 100);
          }
        }


        setStats({
          myClasses:
            classesRes.status === "fulfilled"
              ? classesRes.value.data.classes || []
              : [],
          announcements:
            announcementsRes.status === "fulfilled"
              ? announcementsRes.value.data.announcements?.length || 0
              : 0,
          myComplaints:
            complaintsRes.status === "fulfilled"
              ? complaintsRes.value.data.complaints?.length || 0
              : 0,
          attendancePercent,
        });

        if (complaintsRes.status === "fulfilled") {
          setComplaints(complaintsRes.value.data.complaints || []);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError("Failed to load statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStatsAndComplaints();
  }, []);

  const cardData = [
    {
      title: "My Classes",
      value: stats.myClasses.length,
      icon: <BookOpen className="w-12 h-12 text-white" />,
      bg: "from-purple-500 to-pink-500",
       link: "/student/classes", 
      details: stats.myClasses.map(
        (c) => `${c.className} - ${c.sectionName || "N/A"}`
      ),
    },
    {
      title: "My Attendance",
      value: `${stats.attendancePercent}%`,
      icon: <Calendar className="w-12 h-12 text-white" />,
      bg: "from-blue-500 to-indigo-500",
      link: "/student/my-attendance", // ✅ redirect to attendance page
    },
    {
      title: "Announcements",
      value: stats.announcements,
      icon: <Bell className="w-12 h-12 text-white" />,
      bg: "from-green-500 to-emerald-400",
      link: "/student/announcements",
    },
    {
      title: "My Complaints",
      value: stats.myComplaints,
      icon: <MessageSquare className="w-12 h-12 text-white" />,
      bg: "from-yellow-500 to-orange-400",
      link: "/student/complaints",
    },
  ];

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
        Welcome,{" "}
        <span className="text-blue-600 dark:text-blue-400">
          {user?.firstName || "Student"} {user?.lastName}
        </span>
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="flex items-center space-x-3 text-blue-600 dark:text-blue-400">
            <div className="w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="font-medium">Loading statistics...</span>
          </div>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-48 text-red-600 dark:text-red-400">
          <AlertTriangle className="mr-2" /> {error}
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cardData.map((card, i) => (
              <div
                key={i}
                onClick={() => card.link && navigate(card.link)}
                className={`cursor-pointer bg-gradient-to-r ${card.bg} text-white p-6 rounded-2xl flex flex-col justify-between shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl`}
              >
                <div>
                  <h3 className="text-lg font-semibold">{card.title}</h3>
                  <p className="text-3xl font-bold mt-1">{card.value}</p>
                  {card.details && card.details.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                      {card.details.map((d, idx) => (
                        <span
                          key={idx}
                          className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="bg-white/20 p-4 rounded-full flex items-center justify-center animate-pulse mt-4">
                  {card.icon}
                </div>
              </div>
            ))}
          </div>

          {/* Calendar */}
          <div className="mt-8 grid grid-cols-1">
            <DashboardCalendar role={user?.role?.toLowerCase() || "student"} />
          </div>

          {/* Recent Complaints */}
          <div className="mt-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 max-h-[300px] overflow-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-700 dark:text-gray-200">
              🛑 Recent Complaints
            </h2>

            {complaints.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center">
                No complaints yet.
              </p>
            ) : (
              <ul className="space-y-4">
                {complaints.slice(0, 2).map((c) => (
                  <li
                    key={c._id}
                    className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800 border-l-4 border-red-500"
                  >
                    <p className="font-semibold">{c.title}</p>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-1">
                      {c.description}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Status: <span className="font-medium">{c.status}</span> |{" "}
                      Submitted on:{" "}
                      {new Date(c.createdAt).toLocaleDateString()}
                    </p>
                    {c.adminReply && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                        Reply: {c.adminReply}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4 text-center">
              <a
                href="/student/complaints"
                className="text-blue-500 dark:text-blue-400 hover:underline font-medium"
              >
                View All / Create Complaint
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StudentDashboard;
