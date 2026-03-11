import React, { useEffect, useState } from "react";
import API from "@/api/axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Calendar, 
  UserCheck, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Download,
  BarChart3,
  User,
  RefreshCcw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MyTeacherAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // all, present, absent

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await API.get("/teacher/auth/me/my-attendance");
      setAttendance(res.data);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to fetch attendance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case "Present":
        return <CheckCircle2 className="h-4 w-4" />;
      case "Absent":
        return <XCircle className="h-4 w-4" />;
      case "Leave":
        return <Clock className="h-4 w-4" />;
      default:
        return <CheckCircle2 className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Present":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800";
      case "Absent":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800";
      case "Leave":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700";
    }
  };

  const filteredAttendance = attendance.filter(record => {
    if (filter === "all") return true;
    return record.status === filter;
  });

  const stats = {
    present: attendance.filter(a => a.status === "Present").length,
    absent: attendance.filter(a => a.status === "Absent").length,
    leave: attendance.filter(a => a.status === "Leave").length,
    total: attendance.length
  };

  const exportToCSV = () => {
    if (attendance.length === 0) {
      toast.error("No data to export");
      return;
    }

    const csvRows = [
      ["Date", "Status", "Marked By", "Day"].join(","),
      ...filteredAttendance.map(record => 
        `"${new Date(record.date).toLocaleDateString()}","${record.status}","${record.markedBy?.name || "Admin"}","${new Date(record.date).toLocaleDateString('en-US', { weekday: 'long' })}"`
      ),
    ];

    const csvData = csvRows.join("\n");
    const blob = new Blob([csvData], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `my-attendance-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success("Attendance exported successfully");
  };

  const getAttendanceRate = () => {
    if (stats.total === 0) return 0;
    return Math.round((stats.present / stats.total) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 p-4 lg:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              My Attendance
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track your attendance records and statistics
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={exportToCSV}
              variant="outline"
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              disabled={attendance.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button 
              onClick={fetchAttendance}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Days</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500 opacity-80" />
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 border border-green-200 dark:border-green-800 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Present</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.present}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500 opacity-80" />
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 border border-red-200 dark:border-red-800 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Absent</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.absent}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500 opacity-80" />
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 border border-yellow-200 dark:border-yellow-800 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Leave</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.leave}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500 opacity-80" />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 border border-purple-200 dark:border-purple-800 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Attendance Rate</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {getAttendanceRate()}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500 opacity-80" />
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-2xl rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Filter Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => setFilter("all")}
                className={`${
                  filter === "all" 
                    ? "bg-blue-600 text-white" 
                    : "bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600"
                } rounded-xl transition-all duration-200`}
              >
                All Records ({stats.total})
              </Button>
              <Button
                variant={filter === "Present" ? "default" : "outline"}
                onClick={() => setFilter("Present")}
                className={`${
                  filter === "Present" 
                    ? "bg-green-600 text-white" 
                    : "bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600"
                } rounded-xl transition-all duration-200`}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Present ({stats.present})
              </Button>
              <Button
                variant={filter === "Absent" ? "default" : "outline"}
                onClick={() => setFilter("Absent")}
                className={`${
                  filter === "Absent" 
                    ? "bg-red-600 text-white" 
                    : "bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600"
                } rounded-xl transition-all duration-200`}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Absent ({stats.absent})
              </Button>
              <Button
                variant={filter === "Leave" ? "default" : "outline"}
                onClick={() => setFilter("Leave")}
                className={`${
                  filter === "Leave" 
                    ? "bg-yellow-600 text-white" 
                    : "bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600"
                } rounded-xl transition-all duration-200`}
              >
                <Clock className="h-4 w-4 mr-2" />
                Leave ({stats.leave})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Records */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-2xl rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              Attendance History
              {attendance.length > 0 && (
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                  ({filteredAttendance.length} records)
                </span>
              )}
            </CardTitle>
            <CardDescription>
              Your personal attendance records and history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatePresence>
              {loading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center py-12"
                >
                  <div className="text-center">
                    <RefreshCcw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Loading attendance records...</p>
                  </div>
                </motion.div>
              ) : attendance.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12"
                >
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Attendance Records
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Your attendance records will appear here once marked
                  </p>
                </motion.div>
              ) : filteredAttendance.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12"
                >
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Matching Records
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    No records match your current filter
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-3"
                >
                  {filteredAttendance.map((record, index) => (
                    <motion.div
                      key={record._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 bg-white dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {new Date(record.date).getDate()}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                            {new Date(record.date).toLocaleDateString('en-US', { month: 'short' })}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {new Date(record.date).toLocaleDateString('en-US', { 
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Marked by {record.markedBy?.name || "Admin"}
                          </p>
                        </div>
                      </div>
                      
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 font-semibold ${getStatusColor(record.status)}`}>
                        {getStatusIcon(record.status)}
                        {record.status}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyTeacherAttendance;