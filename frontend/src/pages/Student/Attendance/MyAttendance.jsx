import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import API from "@/api/axios";
import { toast } from "sonner";
import { 
  RefreshCcw, 
  FileDown, 
  Calendar, 
  UserCheck, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Download,
  BarChart3,
  User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const MyAttendance = () => {
  const [date, setDate] = useState("");
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAttendance = async () => {
    if (!date) {
      toast.error("Please select a date");
      return;
    }

    try {
      setLoading(true);
      const res = await API.get(`/student/auth/attendance/class/me/my-attendance?date=${date}`);
      setAttendanceRecords(res.data.records || []);
    } catch (err) {
      console.error("Error fetching attendance:", err);
      toast.error(err.response?.data?.message || "Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (attendanceRecords.length === 0) {
      toast.error("No data to export");
      return;
    }

    const csvRows = [
      ["Date", "Status", "Marked By", "Day"].join(","),
      ...attendanceRecords.map(
        (r) =>
          `"${new Date(r.date).toLocaleDateString()}","${r.status}","${r.markedBy?.name || ""}","${new Date(r.date).toLocaleDateString('en-US', { weekday: 'long' })}"`
      ),
    ];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `MyAttendance_${date}.csv`;
    link.click();
    toast.success("Attendance exported successfully");
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Present":
        return <CheckCircle2 className="h-4 w-4" />;
      case "Absent":
        return <XCircle className="h-4 w-4" />;
      case "Late":
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
      case "Late":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700";
    }
  };

  const stats = {
    present: attendanceRecords.filter(r => r.status === "Present").length,
    absent: attendanceRecords.filter(r => r.status === "Absent").length,
    late: attendanceRecords.filter(r => r.status === "Late").length,
    total: attendanceRecords.length
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
              View your daily attendance records and status
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={exportToCSV}
              variant="outline"
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              disabled={attendanceRecords.length === 0}
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
        {attendanceRecords.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Records</p>
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
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 border border-purple-200 dark:border-purple-800 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Attendance Rate</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {getAttendanceRate()}%
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-500 opacity-80" />
              </div>
            </motion.div>
          </div>
        )}

        {/* Date Selection */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-2xl rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
              Select Date
            </CardTitle>
            <CardDescription>
              Choose a date to view your attendance records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label className="text-sm font-medium">Select Date</Label>
                <div className="relative mt-2">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={fetchAttendance} 
                  disabled={!date}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] py-3"
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Load Attendance
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Records */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-2xl rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              Attendance Records
              {attendanceRecords.length > 0 && (
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                  ({attendanceRecords.length} records)
                </span>
              )}
            </CardTitle>
            <CardDescription>
              Your attendance status for the selected date
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
              ) : attendanceRecords.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12"
                >
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Records Found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {date ? "No attendance records found for the selected date" : "Select a date to view your attendance records"}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="grid gap-3">
                    {attendanceRecords.map((record, index) => (
                      <motion.div
                        key={record._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-6 bg-white dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-200"
                      >
                        <div className="flex items-center gap-6">
                          <div className="text-center bg-blue-50 dark:bg-blue-900/30 rounded-xl p-3 min-w-20">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              {new Date(record.date).getDate()}
                            </div>
                            <div className="text-xs text-blue-600 dark:text-blue-400 uppercase font-medium">
                              {new Date(record.date).toLocaleDateString('en-US', { month: 'short' })}
                            </div>
                            <div className="text-xs text-blue-500 dark:text-blue-300 mt-1">
                              {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short' })}
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                              {new Date(record.date).toLocaleDateString('en-US', { 
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </h3>
                            <div className="flex items-center gap-4 mt-2">
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <User className="h-4 w-4" />
                                Marked by {record.markedBy?.name || "Admin"}
                              </div>
                              {record.classId?.className && (
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  Class: {record.classId.className}
                                </div>
                              )}
                              {record.sectionId?.sectionName && (
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  Section: {record.sectionId.sectionName}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className={`flex items-center gap-3 px-6 py-3 rounded-full border-2 font-semibold text-lg ${getStatusColor(record.status)}`}>
                          {getStatusIcon(record.status)}
                          {record.status}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Summary */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                          Daily Summary
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {stats.present} Present • {stats.absent} Absent • {stats.late} Late
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {getAttendanceRate()}%
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Attendance Rate
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyAttendance;