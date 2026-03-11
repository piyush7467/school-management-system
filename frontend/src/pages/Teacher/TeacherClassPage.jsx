import React, { useEffect, useState } from "react";
import API from "@/api/axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import userLogo from '../../assets/user.jpg'
import { 
  Loader2, 
  Search, 
  Users, 
  ClipboardList, 
  BookOpen, 
  UserCheck,
  Mail,
  Phone,
  GraduationCap,
  BarChart3,
  Filter,
  Download,
  Calendar,
  Eye,
  MoreVertical,
  ChevronDown
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TeacherClassPage = () => {
  const [loading, setLoading] = useState(true);
  const [teacherData, setTeacherData] = useState(null);
  const [search, setSearch] = useState("");
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [activeTab, setActiveTab] = useState("classTeacher");
  const [selectedClass, setSelectedClass] = useState(null);

  const fetchClassDetails = async () => {
    try {
      setLoading(true);
      const res = await API.get("/teacher/auth/my/class-details");
      if (res.data.success) {
        setTeacherData(res.data.teacher);
        setFilteredClasses(res.data.teacher.classSections || []);
      } else {
        toast.error(res.data.message || "Failed to fetch details");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error loading class details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassDetails();
  }, []);

  // 🔍 Filter by search
  useEffect(() => {
    if (!teacherData?.classSections) return;
    const lower = search.toLowerCase();
    const filtered = teacherData.classSections.filter(
      (cls) =>
        cls.className.toLowerCase().includes(lower) ||
        cls.sectionName.toLowerCase().includes(lower) ||
        cls.subjects?.some((s) => s.name.toLowerCase().includes(lower))
    );
    setFilteredClasses(filtered);
  }, [search, teacherData]);

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getStats = () => {
    if (!teacherData) return {};
    
    const totalStudents = teacherData.classTeacherOf?.reduce((sum, ct) => 
      sum + (ct.totalStudents || 0), 0
    ) || 0;
    
    const totalClasses = teacherData.classSections?.length || 0;
    const totalSubjects = teacherData.classSections?.reduce((sum, cls) => 
      sum + (cls.subjects?.filter(s => s.isHandledByMe)?.length || 0), 0
    ) || 0;

    return { totalStudents, totalClasses, totalSubjects };
  };

  const stats = getStats();

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 flex justify-center items-center p-4">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading your class details...</p>
        </div>
      </div>
    );

  if (!teacherData)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 flex justify-center items-center p-4">
        <div className="text-center max-w-sm">
          <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Class Details Found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            No class details found for this teacher.
          </p>
          <Button onClick={fetchClassDetails}>
            Try Again
          </Button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
        >
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent break-words">
              My Classes
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
              Manage your classes, students, and teaching schedule
            </p>
          </div>
          <Button 
            onClick={fetchClassDetails}
            variant="outline"
            size="sm"
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 shrink-0"
          >
            <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Refresh</span>
            <span className="sm:hidden">Reload</span>
          </Button>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">Total Classes</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">{stats.totalClasses}</p>
              </div>
              <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 opacity-80 flex-shrink-0 ml-2" />
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-green-200 dark:border-green-800 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">Total Students</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400 truncate">{stats.totalStudents}</p>
              </div>
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 opacity-80 flex-shrink-0 ml-2" />
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-purple-200 dark:border-purple-800 shadow-lg col-span-2 lg:col-span-1"
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">Subjects Teaching</p>
                <p className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400 truncate">{stats.totalSubjects}</p>
              </div>
              <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500 opacity-80 flex-shrink-0 ml-2" />
            </div>
          </motion.div>
        </div>

        {/* Teacher Profile Card */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl sm:shadow-2xl rounded-xl sm:rounded-2xl">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <Avatar className="h-12 w-12 sm:h-16 sm:w-16 border-2 border-blue-200 dark:border-blue-800 flex-shrink-0 mx-auto sm:mx-0">
                <AvatarImage src={teacherData.profilePic || userLogo} />
                <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-sm sm:text-lg font-semibold">
                  {getInitials(teacherData.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                  {teacherData.name}
                </h2>
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 justify-center sm:justify-start">
                  <div className="flex items-center gap-1 justify-center sm:justify-start">
                    <Mail className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate">{teacherData.email}</span>
                  </div>
                  {teacherData.phone && (
                    <div className="flex items-center gap-1 justify-center sm:justify-start">
                      <Phone className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="truncate">{teacherData.phone}</span>
                    </div>
                  )}
                </div>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 mx-auto sm:mx-0 mt-2 sm:mt-0 w-fit">
                Teacher
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl sm:shadow-2xl rounded-xl sm:rounded-2xl">
            <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
              <TabsList className="grid grid-cols-3 w-full p-1">
                <TabsTrigger value="classTeacher" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 py-1.5">
                  <UserCheck className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Class Teacher</span>
                  <span className="xs:hidden">Teacher</span>
                </TabsTrigger>
                <TabsTrigger value="allClasses" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 py-1.5">
                  <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">All Sections</span>
                  <span className="xs:hidden">Sections</span>
                </TabsTrigger>
                <TabsTrigger value="students" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 py-1.5">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                  Students
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
              {/* Class Teacher Tab */}
              <TabsContent value="classTeacher" className="space-y-3 sm:space-y-4">
                <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    Class Teacher Responsibilities
                  </h3>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 w-fit">
                    {teacherData.classTeacherOf?.length || 0} Classes
                  </Badge>
                </div>

                <AnimatePresence>
                  {teacherData.classTeacherOf?.length > 0 ? (
                    <div className="grid gap-3 sm:gap-4">
                      {teacherData.classTeacherOf.map((ct, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                        >
                          <Card className="border-2 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-200">
                            <CardHeader className="p-4 sm:p-6">
                              <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
                                    <UserCheck className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <span className="text-blue-600 dark:text-blue-400 text-sm sm:text-base font-semibold block truncate">
                                      Class {ct.className} - Section {ct.sectionName}
                                    </span>
                                    <p className="text-xs sm:text-sm font-normal text-gray-600 dark:text-gray-400 mt-1">
                                      {ct.totalStudents} students • Class Teacher
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-1 sm:gap-2 self-end sm:self-auto">
                                  {/* <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="outline" size="sm" className="sm:hidden">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem>
                                        <ClipboardList className="h-4 w-4 mr-2" />
                                        Attendance
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <BarChart3 className="h-4 w-4 mr-2" />
                                        Reports
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu> */}
                                  {/* <div className="hidden sm:flex gap-2">
                                    <Button variant="outline" size="sm">
                                      <ClipboardList className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                      <span className="hidden sm:inline">Attendance</span>
                                    </Button>
                                    <Button variant="outline" size="sm">
                                      <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                      <span className="hidden sm:inline">Reports</span>
                                    </Button>
                                  </div> */}
                                </div>
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6 pt-0">
                              <div className="overflow-x-auto -mx-4 sm:mx-0">
                                <div className="min-w-full inline-block align-middle">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="px-2 sm:px-4 py-2 text-xs sm:text-sm">Roll No</TableHead>
                                        <TableHead className="px-2 sm:px-4 py-2 text-xs sm:text-sm">Student Name</TableHead>
                                        <TableHead className="px-2 sm:px-4 py-2 text-xs sm:text-sm  xs:table-cell">Gender</TableHead>
                                        <TableHead className="px-2 sm:px-4 py-2 text-xs sm:text-sm">Actions</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {ct.students?.slice(0, 3).map((s) => (
                                        <TableRow key={s._id}>
                                          <TableCell className="px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium">{s.rollNumber}</TableCell>
                                          <TableCell className="px-2 sm:px-4 py-2 text-xs sm:text-sm">
                                            <div className="flex items-center gap-2">
                                              <Avatar className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0">
                                                <AvatarImage src={s.profilePic || userLogo} />
                                                <AvatarFallback className="text-xs">
                                                  {getInitials(`${s.firstName} ${s.lastName}`)}
                                                </AvatarFallback>
                                              </Avatar>
                                              <span className="truncate">{s.firstName} {s.lastName}</span>
                                            </div>
                                          </TableCell>
                                          <TableCell className="px-2 sm:px-4 py-2 text-xs sm:text-sm  xs:table-cell">
                                            <Badge variant="outline" className="text-xs">
                                              {s.gender}
                                            </Badge>
                                          </TableCell>
                                          <TableCell className="px-2 sm:px-4 py-2 text-xs sm:text-sm">
                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                            </Button>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                              {ct.students?.length > 3 && (
                                <div className="text-center mt-3">
                                  <Button variant="outline" size="sm">
                                    View All {ct.totalStudents} Students
                                  </Button>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-6 sm:py-8"
                    >
                      <UserCheck className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No Class Teacher Assignments
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                        You are not assigned as a class teacher for any section.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </TabsContent>

              {/* All Sections Tab */}
              <TabsContent value="allClasses" className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                    <Input
                      placeholder="Search class, section, or subject..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-8 sm:pl-10 bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 text-sm sm:text-base"
                    />
                  </div>
                  <div className="flex gap-2 self-end sm:self-auto">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="sm:hidden">
                          <Filter className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Filter className="h-4 w-4 mr-2" />
                          Filter
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <div className="hidden sm:flex gap-2">
                      <Button variant="outline" size="sm">
                        <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        Filter
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        Export
                      </Button>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {filteredClasses.length > 0 ? (
                    <div className="grid gap-3 sm:gap-4">
                      {filteredClasses.map((cls, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                        >
                          <Card className="border-2 border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-200">
                            <CardHeader className="p-4 sm:p-6">
                              <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <div className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-900/30 rounded-lg flex-shrink-0">
                                    <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <span className="text-green-600 dark:text-green-400 text-sm sm:text-base font-semibold block truncate">
                                      Class {cls.className} - Section {cls.sectionName}
                                    </span>
                                    <p className="text-xs sm:text-sm font-normal text-gray-600 dark:text-gray-400 mt-1">
                                      {cls.totalStudents} students
                                    </p>
                                  </div>
                                </div>
                                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 w-fit self-end sm:self-auto">
                                  Teaching
                                </Badge>
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6 pt-0">
                              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                                <div>
                                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base mb-2">
                                    Subjects You Handle:
                                  </h4>
                                  <div className="space-y-2">
                                    {cls.subjects
                                      ?.filter((s) => s.isHandledByMe)
                                      .map((s) => (
                                        <div key={s._id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                          <span className="font-medium text-sm truncate mr-2">{s.name}</span>
                                          <Badge variant="outline" className="text-xs flex-shrink-0">
                                            {s.code}
                                          </Badge>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                  <Button variant="outline" size="sm" className="justify-start">
                                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                                    View Schedule
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-6 sm:py-8"
                    >
                      <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No Classes Found
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                        {search ? "No classes match your search criteria" : "No teaching assignments found"}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </TabsContent>

              {/* Students Tab */}
              <TabsContent value="students" className="space-y-3 sm:space-y-4">
                <AnimatePresence>
                  {teacherData.classTeacherOf?.length > 0 ? (
                    <div className="grid gap-3 sm:gap-4">
                      {teacherData.classTeacherOf.map((ct, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                        >
                          <Card className="border-2 border-purple-200 dark:border-purple-800">
                            <CardHeader className="p-4 sm:p-6">
                              <CardTitle className="flex items-center gap-2 sm:gap-3">
                                <div className="p-1.5 sm:p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex-shrink-0">
                                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <span className="text-purple-600 dark:text-purple-400 text-sm sm:text-base font-semibold block truncate">
                                    Class {ct.className} - Section {ct.sectionName}
                                  </span>
                                  <p className="text-xs sm:text-sm font-normal text-gray-600 dark:text-gray-400 mt-1">
                                    {ct.totalStudents} students under your supervision
                                  </p>
                                </div>
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6 pt-0">
                              <div className="overflow-x-auto -mx-4 sm:mx-0">
                                <div className="min-w-full inline-block align-middle">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="px-2 sm:px-4 py-2 text-xs sm:text-sm">Roll No</TableHead>
                                        <TableHead className="px-2 sm:px-4 py-2 text-xs sm:text-sm">Student</TableHead>
                                        <TableHead className="px-2 sm:px-4 py-2 text-xs sm:text-sm  xs:table-cell">Gender</TableHead>
                                        <TableHead className="px-2 sm:px-4 py-2 text-xs sm:text-sm  sm:table-cell">Contact</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {ct.students?.slice(0, 5).map((s) => (
                                        <TableRow key={s._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                          <TableCell className="px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium">{s.rollNumber}</TableCell>
                                          <TableCell className="px-2 sm:px-4 py-2 text-xs sm:text-sm">
                                            <div className="flex items-center gap-2 sm:gap-3">
                                              <Avatar className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
                                                <AvatarImage src={s.profilePic || userLogo} />
                                                <AvatarFallback className="text-xs">
                                                  {getInitials(`${s.firstName} ${s.lastName}`)}
                                                </AvatarFallback>
                                              </Avatar>
                                              <div className="min-w-0 flex-1">
                                                <div className="font-medium text-xs sm:text-sm truncate">{s.firstName} {s.lastName}</div>
                                                <div className="text-gray-500 dark:text-gray-400 text-xs truncate">@{s.username}</div>
                                              </div>
                                            </div>
                                          </TableCell>
                                          <TableCell className="px-2 sm:px-4 py-2 text-xs sm:text-sm  xs:table-cell">
                                            <Badge variant="outline" className="text-xs">{s.gender}</Badge>
                                          </TableCell>
                                          <TableCell className="px-2 sm:px-4 py-2 text-xs sm:text-sm  sm:table-cell">
                                            <div className="text-gray-500 dark:text-gray-400 text-xs truncate">
                                              {s.phone || "No contact"}
                                            </div>
                                          </TableCell>
                                          
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                              {ct.students?.length > 5 && (
                                <div className="text-center mt-3">
                                  <Button variant="outline" size="sm">
                                    View All {ct.totalStudents} Students
                                  </Button>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-6 sm:py-8"
                    >
                      <Users className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No Students Assigned
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                        No students are currently assigned under your supervision.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </div>
  );
};

export default TeacherClassPage;