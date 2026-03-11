import React, { useEffect, useState } from "react";
import API from "@/api/axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Users, GraduationCap, UserCheck, Search, Filter, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SubjectsPage = () => {
    const [classes, setClasses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [classId, setClassId] = useState("");
    const [sectionId, setSectionId] = useState("");
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch all classes + sections
    const fetchClasses = async () => {
        try {
            const res = await API.get("/admin/auth/classes/getclass");
            setClasses(res.data.classes || []);
        } catch (err) {
            toast.error("Failed to load classes");
        }
    };

    // Fetch all teachers
    const fetchTeachers = async () => {
        try {
            const res = await API.get("/admin/auth/teachers/viewteacher");
            setTeachers(res.data.teachers || []);
        } catch (err) {
            toast.error("Failed to load teachers");
        }
    };

    // Fetch subjects for selected class + section
    const fetchSubjects = async () => {
        if (!classId || !sectionId) return;
        setLoading(true);
        try {
            const res = await API.get(
                `/admin/auth/classes/${classId}/sections/${sectionId}/subjects`
            );
            setSubjects(res.data.subjects || []);
        } catch (err) {
            toast.error(
                `Failed to load subjects: ${err.response?.data?.message || err.message}`
            );
        } finally {
            setLoading(false);
        }
    };

    const refreshData = async () => {
        setRefreshing(true);
        await Promise.all([fetchClasses(), fetchTeachers(), fetchSubjects()]);
        setRefreshing(false);
    };

    // Assign teacher to subject
    const handleAssignTeacher = async (subjectName, teacherId) => {
        if (!teacherId) return toast.error("Please select a teacher");
        if (!classId || !sectionId) return toast.error("Class and Section must be selected");

        try {
            await API.post(`/admin/auth/classes/${classId}/sections/${sectionId}/assign-teacher`, {
                subjectName,
                teacherId,
            });
            toast.success("Teacher assigned successfully");
            fetchSubjects(); // refresh subjects list
        } catch (err) {
            toast.error(
                `Failed to assign teacher: ${err.response?.data?.message || err.message}`
            );
        }
    };


    // Remove teacher from a subject
    const handleRemoveTeacher = async (subjectName, teacherId) => {
        if (!teacherId) return toast.error("Invalid teacher");
        if (!classId || !sectionId) return toast.error("Class and Section must be selected");

        try {
            await API.post(`/admin/auth/classes/${classId}/sections/${sectionId}/remove-teacher`, {
                subjectName,
                teacherId,
            });
            toast.success("Teacher removed successfully");
            fetchSubjects(); // refresh subjects list
        } catch (err) {
            toast.error(
                `Failed to remove teacher: ${err.response?.data?.message || err.message}`
            );
        }
    };


    useEffect(() => {
        fetchClasses();
        fetchTeachers();
    }, []);

    useEffect(() => {
        fetchSubjects();
    }, [classId, sectionId]);

    // Sections of selected class
    const sections = classes.find((cls) => cls._id === classId)?.sections || [];
    const selectedClass = classes.find((cls) => cls._id === classId);
    const selectedSection = sections.find((sec) => sec._id === sectionId);

    const SubjectCard = ({ subject, index }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300"
        >
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                        <BookOpen className="h-6 w-6 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {subject.subject}
                        </h3>

                        <div className="flex flex-wrap items-center gap-2 mb-3">
                            {subject.teachers?.length > 0 ? (
                                subject.teachers.map((teacher, idx) => (
                                    <Badge
                                        key={idx}
                                        variant="secondary"
                                        className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700 flex items-center gap-1"
                                    >
                                        <UserCheck className="h-3 w-3" />
                                        {teacher.name}
                                        <button
                                            onClick={() => handleRemoveTeacher(subject.subject, teacher._id)}
                                            className="ml-1 text-red-500 hover:text-red-700 rounded-full"
                                            title="Remove teacher"
                                        >
                                            ×
                                        </button>
                                    </Badge>
                                ))
                            ) : (
                                <Badge variant="outline" className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700">
                                    No teacher assigned
                                </Badge>
                            )}

                        </div>
                    </div>
                </div>

                <div className="flex-shrink-0 ml-4">
                    <Select onValueChange={(value) => handleAssignTeacher(subject.subject, value)}>
                        <SelectTrigger className="w-48 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700">
                            <SelectValue placeholder="Assign teacher" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                            {teachers.map((teacher) => (
                                <SelectItem key={teacher._id} value={teacher._id} className="text-gray-900 dark:text-white">
                                    <div className="flex items-center gap-2">
                                        <span>{teacher.name}</span>
                                        <Badge
                                            variant={teacher.status === 'active' ? 'default' : 'secondary'}
                                            className={`text-xs ${teacher.status === 'active'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                }`}
                                        >
                                            {teacher.status}
                                        </Badge>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 p-4 lg:p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
                >
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                            Subject Management
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Manage subjects and assign teachers to classes
                        </p>
                    </div>

                    <Button
                        onClick={refreshData}
                        variant="outline"
                        disabled={refreshing}
                        className="flex items-center gap-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    >
                        <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar - Filters */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
                                    <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    Filters
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Select Class
                                    </label>
                                    <Select value={classId} onValueChange={(value) => { setClassId(value); setSectionId(""); }}>
                                        <SelectTrigger className="rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700">
                                            <SelectValue placeholder="Choose class" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                                            {classes.map((cls) => (
                                                <SelectItem key={cls._id} value={cls._id} className="text-gray-900 dark:text-white">
                                                    {cls.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Select Section
                                    </label>
                                    <Select value={sectionId} onValueChange={setSectionId} disabled={!classId}>
                                        <SelectTrigger className="rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700">
                                            <SelectValue placeholder="Choose section" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                                            {sections.map((sec) => (
                                                <SelectItem key={sec._id} value={sec._id} className="text-gray-900 dark:text-white">
                                                    {sec.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Stats */}
                        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
                                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    Statistics
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Classes</span>
                                        <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                            {classes.length}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Available Teachers</span>
                                        <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                                            {teachers.length}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Subjects Found</span>
                                        <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                                            {subjects.length}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content - Subjects */}
                    <div className="lg:col-span-3">
                        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-t-2xl border-b dark:border-gray-700">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-3 text-xl text-gray-900 dark:text-white">
                                            <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                            Subjects
                                            {selectedClass && selectedSection && (
                                                <span className="text-lg font-normal text-gray-600 dark:text-gray-400">
                                                    • {selectedClass.name} - {selectedSection.name}
                                                </span>
                                            )}
                                        </CardTitle>
                                        <CardDescription className="text-gray-600 dark:text-gray-400">
                                            Manage subject assignments and teachers
                                        </CardDescription>
                                    </div>
                                    <Badge variant="outline" className="mt-2 sm:mt-0 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
                                        {subjects.length} Subjects
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                {loading ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                        <p className="text-gray-600 dark:text-gray-400">Loading subjects...</p>
                                    </div>
                                ) : !classId || !sectionId ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <Filter className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Select Class & Section</h3>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Please select a class and section to view subjects
                                        </p>
                                    </div>
                                ) : subjects.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <BookOpen className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Subjects Found</h3>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            No subjects available for {selectedClass?.name} - {selectedSection?.name}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <AnimatePresence>
                                            {subjects.map((subject, index) => (
                                                <SubjectCard key={subject._id || index} subject={subject} index={index} />
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubjectsPage;