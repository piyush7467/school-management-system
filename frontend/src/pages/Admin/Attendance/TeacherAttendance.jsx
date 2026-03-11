import React, { useEffect, useState } from "react";
import API from "@/api/axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, 
  Users, 
  BarChart, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ArrowRight 
} from "lucide-react";

const TeacherAttendance = () => {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [status, setStatus] = useState("Present");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await API.get("/admin/auth/teachers/viewteacher");
        setTeachers(res.data.teachers || []);
      } catch (error) {
        toast.error("Failed to load teachers");
      }
    };
    fetchTeachers();
  }, []);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await API.post(
        "/admin/auth/teacher-attendance/mark/",
        { teacherId: selectedTeacher, status, date },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Attendance marked successfully");
      // Reset form
      setSelectedTeacher("");
      setDate("");
      setStatus("Present");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error marking attendance");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Present":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "Absent":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "Leave":
        return <Clock className="h-5 w-5 text-orange-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Present":
        return "border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800";
      case "Absent":
        return "border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800";
      case "Leave":
        return "border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800";
      default:
        return "border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  Teacher Attendance
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Mark and manage teacher attendance records
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => navigate('report')}
              className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 
                       border border-gray-200 dark:border-gray-700 rounded-xl 
                       hover:bg-gray-50 dark:hover:bg-gray-750 
                       transition-all duration-200 shadow-sm hover:shadow-md
                       text-gray-700 dark:text-gray-300 font-medium"
            >
              <BarChart className="h-4 w-4" />
              <span>View Attendance Report</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Attendance Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 md:p-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            <span>Mark Attendance</span>
          </h2>

          <div className="space-y-6">
            {/* Teacher Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Teacher
              </label>
              <div className="relative">
                <select
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 
                           rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           transition-all duration-200 appearance-none cursor-pointer
                           hover:border-gray-400 dark:hover:border-gray-500"
                >
                  <option value="" className="text-gray-500">Choose a teacher...</option>
                  {teachers.map((t) => (
                    <option key={t._id} value={t._id} className="py-2">
                      {t.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Date
              </label>
              <input
                type="date"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 
                         rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            {/* Status Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Attendance Status
              </label>
              <div className="grid grid-cols-3 gap-3">
                {["Present", "Absent", "Leave"].map((option) => (
                  <button
                    key={option}
                    onClick={() => setStatus(option)}
                    className={`p-3 border-2 rounded-xl text-center transition-all duration-200 
                             ${status === option 
                               ? getStatusColor(option) + " ring-2 ring-offset-2 ring-opacity-50 " + 
                                 (option === "Present" ? "ring-green-500" : 
                                  option === "Absent" ? "ring-red-500" : "ring-orange-500")
                               : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                             }`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      {getStatusIcon(option)}
                      <span className={`text-sm font-medium ${
                        status === option 
                          ? option === "Present" ? "text-green-700 dark:text-green-300" :
                            option === "Absent" ? "text-red-700 dark:text-red-300" :
                            "text-orange-700 dark:text-orange-300"
                          : "text-gray-600 dark:text-gray-400"
                      }`}>
                        {option}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!selectedTeacher || !date || loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 
                       disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed
                       text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 
                       transform hover:scale-[1.02] disabled:hover:scale-100
                       shadow-lg hover:shadow-xl disabled:shadow-none
                       flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Marking Attendance...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  <span>Mark Attendance</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats Preview */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Teachers</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{teachers.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Today's Date</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Selected Status</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{status}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherAttendance;