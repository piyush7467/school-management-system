import React, { useEffect, useState } from "react";
import { Users, UserCheck, UsersRound, BookOpen, AlertTriangle } from "lucide-react";
import { useSelector } from "react-redux";
import API from "@/api/axios";
import DashboardCalendar from "@/components/DashboardCalendar";
import Complaint from "@/components/Complaint";

const StatCards = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    parents: 0,
    classes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch all data in parallel
        const [studentRes, teacherRes, classRes, parentRes] = await Promise.allSettled([
          API.get("/admin/auth/students/getstudent"),
          API.get("/admin/auth/teachers/viewteacher"),
          API.get("/admin/auth/classes/"),
          API.get("/admin/auth/parents/getparents"), // optional route
        ]);

        setStats({
          students:
            studentRes.status === "fulfilled"
              ? studentRes.value.data.total ||
                studentRes.value.data.TotalStudents ||
                0
              : 0,
          teachers:
            teacherRes.status === "fulfilled"
              ? teacherRes.value.data.total ||
                teacherRes.value.data.TotalTeacher ||
                0
              : 0,
          parents:
            parentRes.status === "fulfilled"
              ? parentRes.value.data.total ||
                parentRes.value.data.TotalParents ||
                0
              : 0,
          classes:
            classRes.status === "fulfilled"
              ? classRes.value.data.totalClasses ||
                classRes.value.data.TotalClasses ||
                0
              : 0,
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError("Failed to load statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cardData = [
    {
      title: "Students",
      value: stats.students,
      icon: <Users className="w-12 h-12 text-white" />,
      bg: "from-blue-500 to-indigo-500",
    },
    {
      title: "Teachers",
      value: stats.teachers,
      icon: <UserCheck className="w-12 h-12 text-white" />,
      bg: "from-green-500 to-emerald-400",
    },
    {
      title: "Parents",
      value: stats.parents,
      icon: <UsersRound className="w-12 h-12 text-white" />,
      bg: "from-yellow-500 to-orange-400",
    },
    {
      title: "Classes",
      value: stats.classes,
      icon: <BookOpen className="w-12 h-12 text-white" />,
      bg: "from-purple-500 to-pink-500",
    },
  ];

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
        Welcome,{" "}
        <span className="text-blue-600 dark:text-blue-400">
          {user?.name || "Admin"}
        </span>
      </h1>

      {/* Loading or Error */}
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
                className={`bg-gradient-to-r ${card.bg} text-white p-6 rounded-2xl shadow-lg flex items-center justify-between transform transition-all duration-300 hover:scale-105 hover:shadow-2xl`}
              >
                <div>
                  <h3 className="text-lg font-semibold">{card.title}</h3>
                  <p className="text-3xl font-bold mt-1">{card.value}+</p>
                </div>
                <div className="bg-white/20 p-4 rounded-full flex items-center justify-center animate-pulse">
                  {card.icon}
                </div>
              </div>
            ))}
          </div>

          {/* Calendar */}
          <div className="mt-8">
            <DashboardCalendar role={user?.role} />
          </div>

          {/* Complaints */}
          <div className="mt-8">
            <Complaint />
          </div>
        </>
      )}
    </div>
  );
};

export default StatCards;
