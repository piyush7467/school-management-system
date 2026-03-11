import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "@/api/axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Users, UserPlus, GraduationCap, Shield, Search, UserCheck } from "lucide-react";
import { motion } from "framer-motion";

const AddStudents = () => {
  const { id: classId, sectionId } = useParams();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [classInfo, setClassInfo] = useState({});
  const [sectionInfo, setSectionInfo] = useState({ students: [] });

  // Fetch class info first, then fetch students
  useEffect(() => {
    if (classId && sectionId) fetchClassInfo();
  }, [classId, sectionId]);

  const fetchClassInfo = async () => {
    try {
      const res = await API.get(`/admin/auth/classes/${classId}`);
      const classData = res.data.data;
      setClassInfo(classData);

      const section = classData.sections?.find(s => s._id === sectionId);
      setSectionInfo(section || { students: [] });

      // Fetch students after section info
      fetchStudents(section);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch class info");
    }
  };

  const fetchStudents = async (section) => {
    try {
      setLoading(true);
      const res = await API.get(`/admin/auth/students/viewstudent/class/${classId}`);
      let allStudents = res.data.students || [];

      // Exclude students already in this section
      if (section?.students?.length > 0) {
        allStudents = allStudents.filter(
          s => !section.students.some(st => st._id === s._id)
        );
      }

      setStudents(allStudents);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  const assignStudents = async () => {
    if (selectedStudents.length === 0) {
      toast.error("Please select at least one student");
      return;
    }

    try {
      setLoading(true);
      const res = await API.post(
        `/admin/auth/classes/${classId}/sections/${sectionId}/assign-student`,
        { studentIds: selectedStudents }
      );
      toast.success(res.data.message);

      // Remove assigned students from available list
      setStudents(prev => prev.filter(s => !selectedStudents.includes(s._id)));
      setSelectedStudents([]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error assigning students");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (studentId) => {
    setSelectedStudents(prev =>
      prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s._id));
    }
  };

  const filteredStudents = students.filter(student =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const StudentCard = ({ student }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl ${
        selectedStudents.includes(student._id) ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
      }`}>
        <CardContent className="p-4 flex items-center gap-4">
          <Checkbox
            checked={selectedStudents.includes(student._id)}
            onCheckedChange={() => handleSelect(student._id)}
            className="h-5 w-5 rounded-lg border-2 border-gray-300 dark:border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
          />

          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
            <Users className="h-6 w-6 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {student.name}
              </h3>
              <Badge variant={student.status === 'active' ? 'default' : 'secondary'}
                className={`text-xs ${student.status === 'active' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
                {student.status}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <span className="font-medium text-purple-600 dark:text-purple-400">@{student.username}</span>
              </span>
              <span className="truncate">{student.email}</span>
              {student.class && (
                <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
                  {student.class}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 p-4 lg:p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              size="sm"
              className="rounded-full h-12 w-12 p-0 flex items-center justify-center border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800 shadow-sm"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Add Students
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Assign students to {classInfo.name} - {sectionInfo.name}
              </p>
            </div>
          </div>

          <Badge variant="outline" className="px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300">
            <UserPlus className="h-3 w-3 mr-1" />
            {selectedStudents.length} Selected
          </Badge>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{classInfo.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Section {sectionInfo.name}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
                  <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Total Students</span>
                  <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">{students.length}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Selected</span>
                  <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">{selectedStudents.length}</Badge>
                </div>

                <Button
                  onClick={assignStudents}
                  disabled={loading || selectedStudents.length === 0}
                  className="w-full rounded-xl bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 transition-all duration-300"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Assigning...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <UserCheck className="h-4 w-4" />
                      Assign Students
                    </div>
                  )}
                </Button>

                <Button
                  onClick={handleSelectAll}
                  variant="outline"
                  className="w-full rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                >
                  {selectedStudents.length === filteredStudents.length ? 'Deselect All' : 'Select All'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-t-2xl border-b dark:border-gray-700">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-3 text-xl text-gray-900 dark:text-white">
                      <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      Available Students
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Select students to add to this section
                    </CardDescription>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <Input
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700"
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading students...</p>
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {searchTerm ? 'No students found' : 'No students available'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {searchTerm ? 'Try adjusting your search criteria' : 'All students are already assigned or no students exist'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredStudents.map((student) => (
                      <StudentCard key={student._id} student={student} />
                    ))}
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

export default AddStudents;
