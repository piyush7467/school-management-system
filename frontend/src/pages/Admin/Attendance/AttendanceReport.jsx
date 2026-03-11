import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "@/api/axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  ArrowLeft, 
  Calendar, 
  Filter, 
  Download, 
  BarChart3, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Search,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AttendanceReport = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [date, setDate] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch classes
  const fetchClasses = async () => {
    try {
      const res = await API.get("/admin/auth/classes/");
      const cls = res.data.classes || [];
      setClasses(cls);
      if (cls.length) setSelectedClass(cls[0]._id);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch classes");
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // Fetch sections whenever class changes
  useEffect(() => {
    if (!selectedClass) return;

    const fetchSections = async () => {
      try {
        const res = await API.get(`/admin/auth/classes/${selectedClass}/sections`);
        const normalizedSections = (res.data.sections || []).map(sec => ({
          _id: sec.sectionId,
          name: sec.sectionName
        }));
        setSections(normalizedSections);
        if (normalizedSections.length) setSelectedSection(normalizedSections[0]._id);
        else setSelectedSection("");
      } catch (err) {
        console.error(err);
        toast.error("Error fetching sections");
      }
    };

    fetchSections();
  }, [selectedClass]);

  // Load attendance records
  const loadRecords = async () => {
    if (!selectedClass || !selectedSection) return;
    try {
      setLoading(true);

      // Build query params
      const params = {};
      if (date) params.date = date;
      else if (fromDate && toDate) {
        params.fromDate = fromDate;
        params.toDate = toDate;
      }

      const res = await API.get(
        `/admin/auth/attendance/class/${selectedClass}/section/${selectedSection}/report`,
        { params }
      );

      setRecords(res.data.records || []);
    } catch (err) {
      console.error(err);
      toast.error("Error fetching attendance records");
    } finally {
      setLoading(false);
    }
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

  const filteredRecords = records.filter(record =>
    record.studentId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.studentId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.studentId?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToCSV = () => {
    const headers = ["Date", "Student Name", "Roll Number", "Status", "Marked By"];
    const csvData = filteredRecords.map(record => [
      new Date(record.date).toLocaleDateString(),
      `${record.studentId?.firstName} ${record.studentId?.lastName}`,
      record.studentId?.username || record.studentId?.rollNumber || "N/A",
      record.status,
      record.markedBy?.name || "N/A"
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(","))
      .join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-report-${date || "range"}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Report exported successfully");
  };

  const stats = {
    present: filteredRecords.filter(r => r.status === "Present").length,
    absent: filteredRecords.filter(r => r.status === "Absent").length,
    late: filteredRecords.filter(r => r.status === "Late").length,
    total: filteredRecords.length
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
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => navigate(-1)} 
              variant="outline" 
              size="sm" 
              className="rounded-full h-12 w-12 p-0 flex items-center justify-center border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Attendance Analytics
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Comprehensive attendance reports and insights
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              onClick={exportToCSV}
              variant="outline"
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
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
              <FileText className="h-8 w-8 text-blue-500 opacity-80" />
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

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-2xl rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Filter className="h-5 w-5 text-blue-600" />
                  Report Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Class</Label>
                  <select 
                    className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    value={selectedClass} 
                    onChange={(e) => setSelectedClass(e.target.value)}
                  >
                    <option value="">Select Class</option>
                    {classes.map(cls => (
                      <option key={cls._id} value={cls._id}>{cls.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Section</Label>
                  <select 
                    className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    value={selectedSection} 
                    onChange={(e) => setSelectedSection(e.target.value)}
                  >
                    <option value="">Select Section</option>
                    {sections.map(sec => (
                      <option key={sec._id} value={sec._id}>{sec.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Single Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input 
                      type="date" 
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      value={date} 
                      onChange={(e) => {
                        setDate(e.target.value);
                        setFromDate("");
                        setToDate("");
                      }} 
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Date Range</Label>
                  <div className="space-y-2">
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input 
                        type="date" 
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        value={fromDate} 
                        onChange={(e) => {
                          setFromDate(e.target.value);
                          setDate("");
                        }} 
                        placeholder="From Date"
                      />
                    </div>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input 
                        type="date" 
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        value={toDate} 
                        onChange={(e) => {
                          setToDate(e.target.value);
                          setDate("");
                        }} 
                        placeholder="To Date"
                      />
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={loadRecords} 
                  disabled={!selectedClass || !selectedSection || loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Report Content */}
          <div className="lg:col-span-3">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-2xl rounded-2xl h-full">
              <CardHeader>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" /> 
                      Attendance Records
                      {records.length > 0 && (
                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                          ({filteredRecords.length} records)
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {date ? `Showing records for ${new Date(date).toLocaleDateString()}` : 
                       fromDate && toDate ? `Showing records from ${new Date(fromDate).toLocaleDateString()} to ${new Date(toDate).toLocaleDateString()}` :
                       "Select filters to generate report"}
                    </CardDescription>
                  </div>
                  
                  {records.length > 0 && (
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search records..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 w-64"
                      />
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <AnimatePresence>
                  {loading ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center py-12"
                    >
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-400">Loading attendance records...</p>
                      </div>
                    </motion.div>
                  ) : records.length === 0 ? (
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
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        Select a class, section, and date range to generate attendance report
                      </p>
                    </motion.div>
                  ) : filteredRecords.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-12"
                    >
                      <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No Matching Records
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        No records match your search criteria
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                            <tr>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Student
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Roll Number
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Date
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Marked By
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredRecords.map((record, index) => (
                              <motion.tr 
                                key={record._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150"
                              >
                                <td className="px-6 py-4">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {record.studentId?.firstName} {record.studentId?.lastName}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-900 dark:text-white">
                                    {record.studentId?.username || record.studentId?.rollNumber || "N/A"}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(record.status)}`}>
                                    {getStatusIcon(record.status)}
                                    {record.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-900 dark:text-white">
                                    {new Date(record.date).toLocaleDateString()}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-900 dark:text-white">
                                    {record.markedBy?.name || "System"}
                                  </div>
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <span>
                          Showing {filteredRecords.length} of {records.length} records
                        </span>
                        <span>
                          {stats.present} Present • {stats.absent} Absent • {stats.late} Late
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceReport;