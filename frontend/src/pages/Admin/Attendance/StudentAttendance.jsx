import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "@/api/axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  ArrowLeft, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Download,
  Filter,
  RotateCcw,
  UserCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import userLogo from "@/assets/user.jpg";

const StudentAttendance = () => {
    const navigate = useNavigate();
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedSection, setSelectedSection] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

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
                setLoading(true);
                const res = await API.get(`/admin/auth/classes/${selectedClass}/sections`);

                // Normalize API response for frontend (_id and name)
                const normalizedSections = (res.data.sections || []).map(sec => ({
                    _id: sec.sectionId,    // map sectionId to _id
                    name: sec.sectionName  // map sectionName to name
                }));

                setSections(normalizedSections);

                if (normalizedSections.length) setSelectedSection(normalizedSections[0]._id);
                else setSelectedSection(""); // reset if no sections
            } catch (err) {
                console.error(err);
                toast.error("Error fetching sections");
            } finally {
                setLoading(false);
            }
        };

        fetchSections();
    }, [selectedClass]);

    // Fetch students
    const loadStudents = async () => {
        if (!selectedClass || !selectedSection) return;
        try {
            setLoading(true);
            const res = await API.get(
                `/admin/auth/students/viewstudent/class/${selectedClass}/section/${selectedSection}`
            );
            console.log("Students API response:", res.data);
            const studentList = (res.data.students || []).map((s) => ({ 
                ...s, 
                status: "Present",
                avatar: s.profilePic || userLogo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.username}`
            }));
            setStudents(studentList);
        } catch (err) {
            console.error(err);
            toast.error("Error fetching students");
        } finally {
            setLoading(false);
        }
    };

    // Toggle attendance status
    const toggleStatus = (index) => {
        const updated = [...students];
        updated[index].status =
            updated[index].status === "Present" ? "Absent" :
                updated[index].status === "Absent" ? "Late" : "Present";
        setStudents(updated);
    };

    // Submit attendance
    const submitAttendance = async () => {
        if (students.length === 0) return;
        try {
            setSubmitLoading(true);
            await API.post(
                `/admin/auth/attendance/class/${selectedClass}/section/${selectedSection}/mark`,
                { 
                    students: students.map(s => ({ studentId: s._id, status: s.status })),
                    date: date
                }
            );
            toast.success("Attendance marked successfully!");
        } catch (err) {
            console.error(err);
            toast.error("Attendance already marked for today. Please use the update option");
        } finally {
            setSubmitLoading(false);
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
                return "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300";
            case "Absent":
                return "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300";
            case "Late":
                return "bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300";
            default:
                return "bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300";
        }
    };

    const getStatusStats = () => {
        const present = students.filter(s => s.status === "Present").length;
        const absent = students.filter(s => s.status === "Absent").length;
        const late = students.filter(s => s.status === "Late").length;
        return { present, absent, late, total: students.length };
    };

    const stats = getStatusStats();

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
                                Student Attendance
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Select class, section, and mark student attendance
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <Link to='attendance-report'>
                            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                                <UserCheck className="h-4 w-4 mr-2" />
                                View Reports
                            </Button>
                        </Link>
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

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Selection Panel */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-2xl rounded-2xl">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Filter className="h-5 w-5 text-blue-600" />
                                    Filters & Selection
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <Label className="text-sm font-medium">Date</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        />
                                    </div>
                                </div>
                                
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
                                
                                <Button 
                                    onClick={loadStudents} 
                                    disabled={!selectedClass || !selectedSection || loading}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                                >
                                    {loading ? (
                                        <>
                                            <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                                            Loading...
                                        </>
                                    ) : (
                                        <>
                                            <Users className="h-4 w-4 mr-2" />
                                            Load Students
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Students List */}
                    <div className="lg:col-span-3">
                        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-2xl rounded-2xl h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" /> 
                                    Students List
                                    {students.length > 0 && (
                                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                                            ({students.length} students)
                                        </span>
                                    )}
                                </CardTitle>
                                <CardDescription>
                                    Click on status badges to toggle between Present / Absent / Late
                                </CardDescription>
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
                                                <RotateCcw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                                                <p className="text-gray-600 dark:text-gray-400">Loading students...</p>
                                            </div>
                                        </motion.div>
                                    ) : students.length === 0 ? (
                                        <motion.div 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="text-center py-12"
                                        >
                                            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                                No Students Loaded
                                            </h3>
                                            <p className="text-gray-500 dark:text-gray-400">
                                                Select a class and section to load students
                                            </p>
                                        </motion.div>
                                    ) : (
                                        <motion.div 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="space-y-4"
                                        >
                                            <div className="grid gap-3">
                                                {students.map((student, index) => (
                                                    <motion.div
                                                        key={student._id}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: index * 0.1 }}
                                                        className="flex items-center justify-between p-4 bg-white dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-200"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-6">
                                                                    {index + 1}.
                                                                </span>
                                                                <img 
                                                                    src={student.avatar} 
                                                                    alt={student.firstName}
                                                                    className="h-10 w-10 rounded-full border-2 border-gray-200 dark:border-gray-600"
                                                                />
                                                            </div>
                                                            <div>
                                                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                                                    {student.firstName} {student.lastName}
                                                                </h3>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                    @{student.username}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        
                                                        <motion.button
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => toggleStatus(index)}
                                                            className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 font-semibold transition-all duration-200 hover:shadow-lg ${getStatusColor(student.status)}`}
                                                        >
                                                            {getStatusIcon(student.status)}
                                                            {student.status}
                                                        </motion.button>
                                                    </motion.div>
                                                ))}
                                            </div>
                                            
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.5 }}
                                            >
                                                <Button 
                                                    onClick={submitAttendance} 
                                                    disabled={submitLoading}
                                                    size="lg"
                                                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] text-base py-3"
                                                >
                                                    {submitLoading ? (
                                                        <>
                                                            <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                                                            Submitting Attendance...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle2 className="h-5 w-5 mr-2" />
                                                            Submit Attendance for {stats.total} Students
                                                        </>
                                                    )}
                                                </Button>
                                            </motion.div>
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

export default StudentAttendance;