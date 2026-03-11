import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import API from "@/api/axios";
import { toast } from "sonner";
import { 
  FileDown, 
  RefreshCcw, 
  Filter, 
  Calendar, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Download,
  BarChart3,
  Edit,
  Save
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import userLogo from "@/assets/user.jpg";

const AttendanceReportTeacherSide = () => {
  const [assignedSections, setAssignedSections] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [date, setDate] = useState("");
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [tempRecords, setTempRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // 🔹 Fetch sections assigned to teacher
  const fetchAssignedSections = async () => {
    try {
      const res = await API.get("/teacher/auth/assigned-class-sections");
      const data = res.data.assignedSections || [];
      const classTeacherSections = data.filter((s) => s.isClassTeacher);

      setAssignedSections(classTeacherSections);
      if (classTeacherSections.length > 0) {
        setSelectedClass(String(classTeacherSections[0].classId));
        setSelectedSection(String(classTeacherSections[0].sectionId));
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load assigned sections");
    }
  };

  useEffect(() => {
    fetchAssignedSections();
  }, []);

  // 🔹 Fetch attendance records
  const fetchAttendance = async () => {
    if (!selectedClass || !selectedSection || !date) {
      toast.error("Please select class, section, and date");
      return;
    }

    try {
      setLoading(true);
      const res = await API.get(
        `/teacher/auth/attendance/class/${selectedClass}/section/${selectedSection}/report?date=${date}`
      );

      const recordsWithStudent = res.data.records.map((r) => ({
        ...r,
        student: r.studentId || {},
        avatar: r.profilePic || userLogo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.studentId?.username || r._id}`
      }));

      setAttendanceRecords(recordsWithStudent);
      setTempRecords(recordsWithStudent.map((r) => ({ ...r })));
      setHasChanges(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Toggle status on tempRecords only
  const toggleStatus = (index) => {
    const updated = [...tempRecords];
    const currentStatus = updated[index].status;
    updated[index].status =
      currentStatus === "Present"
        ? "Absent"
        : currentStatus === "Absent"
        ? "Late"
        : "Present";
    setTempRecords(updated);
    setHasChanges(true);
  };

  // 🔹 Save updated attendance
  const updateAttendance = async () => {
    try {
      setUpdating(true);
      const res = await API.put(
        `/teacher/auth/attendance/class/${selectedClass}/section/${selectedSection}/update`,
        {
          date,
          students: tempRecords.map((s) => ({
            studentId: s.student?._id,
            status: s.status,
          })),
        }
      );
      toast.success(res.data.message || "Attendance updated successfully");

      setAttendanceRecords(tempRecords.map((r) => ({ ...r })));
      setHasChanges(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error updating attendance");
    } finally {
      setUpdating(false);
    }
  };

  // 🔹 Export to CSV
  const exportToCSV = () => {
    if (attendanceRecords.length === 0) {
      toast.error("No data to export");
      return;
    }

    const csvRows = [
      ["First Name", "Last Name", "Username", "Roll Number", "Status"].join(","),
      ...attendanceRecords.map(
        (r) =>
          `"${r.student?.firstName || ""}","${r.student?.lastName || ""}","${r.student?.username || ""}","${r.student?.rollNumber || ""}","${r.status}"`
      ),
    ];

    const csvData = csvRows.join("\n");
    const blob = new Blob([csvData], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Attendance_${selectedClass}_${selectedSection}_${date}.csv`;
    link.click();
    toast.success("CSV exported successfully");
  };

  const filteredSections = assignedSections.filter(
    (s) => String(s.classId) === selectedClass
  );

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
        return "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300";
      case "Absent":
        return "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300";
      case "Late":
        return "bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300";
      default:
        return "bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300";
    }
  };

  const stats = {
    present: tempRecords.filter(r => r.status === "Present").length,
    absent: tempRecords.filter(r => r.status === "Absent").length,
    late: tempRecords.filter(r => r.status === "Late").length,
    total: tempRecords.length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Attendance Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              View and update student attendance records
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
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500 opacity-80" />
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
                  <p className="text-sm text-gray-500 dark:text-gray-400">Late</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.late}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500 opacity-80" />
              </div>
            </motion.div>
          </div>
        )}

        {/* Filters */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-2xl rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5 text-blue-600" />
              Report Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Class</Label>
                <select
                  className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(String(e.target.value))}
                >
                  <option value="">Select Class</option>
                  {[...new Map(
                    assignedSections.map((a) => [String(a.classId), a.className])
                  )].map(([id, name]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Section</Label>
                <select
                  className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(String(e.target.value))}
                >
                  <option value="">Select Section</option>
                  {filteredSections.map((sec) => (
                    <option key={sec.sectionId} value={sec.sectionId}>
                      {sec.sectionName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Date</Label>
                <div className="relative">
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
                  disabled={!selectedClass || !selectedSection || !date}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Load Records
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Records */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-2xl rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              Student Attendance
              {attendanceRecords.length > 0 && (
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                  ({attendanceRecords.length} students)
                </span>
              )}
            </CardTitle>
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
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Records Found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Select class, section, and date to load attendance records
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="grid gap-3">
                    {tempRecords.map((record, index) => (
                      <motion.div
                        key={record._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 bg-white dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-6">
                              {index + 1}.
                            </span>
                            <img 
                              src={record.avatar} 
                              alt={record.student?.firstName}
                              className="h-10 w-10 rounded-full border-2 border-gray-200 dark:border-gray-600"
                            />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {record.student?.firstName} {record.student?.lastName}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Roll No: {record.student?.rollNumber || "N/A"}
                            </p>
                          </div>
                        </div>
                        
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleStatus(index)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 font-semibold transition-all duration-200 hover:shadow-lg ${getStatusColor(record.status)}`}
                        >
                          {getStatusIcon(record.status)}
                          {record.status}
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>

                  {hasChanges && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl"
                    >
                      <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                        <Edit className="h-4 w-4" />
                        <span className="text-sm font-medium">You have unsaved changes</span>
                      </div>
                      <Button
                        onClick={updateAttendance}
                        disabled={updating}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                      >
                        {updating ? (
                          <>
                            <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AttendanceReportTeacherSide;