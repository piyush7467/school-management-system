import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "@/api/axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, UserCheck, BookOpen, Users, Shield, X } from "lucide-react";
import { motion } from "framer-motion";



const AssignTeacher = () => {
  const { id: classId, sectionId } = useParams();
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [sectionInfo, setSectionInfo] = useState({});
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [classInfo, setClassInfo] = useState({});

  // Fetch teachers and class info
  useEffect(() => {
    fetchTeachers();
    fetchClassInfo();
  }, [classId, sectionId]);

  const fetchTeachers = async () => {
    try {
      const res = await API.get("/admin/auth/teachers/viewteacher");
      setTeachers(res.data.teachers || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch teachers");
    }
  };

  const fetchClassInfo = async () => {
    try {
      const res = await API.get(`/admin/auth/classes/${classId}`);
      const classData = res.data.data;
      setClassInfo(classData);
      const section = classData.sections?.find((s) => s._id === sectionId);
      setSectionInfo(section || {});
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch class info");
    }
  };

  const assignTeacher = async () => {
    if (!selectedTeacher || !selectedSubject) {
      toast.error("Please select both teacher and subject");
      return;
    }

    try {
      setLoading(true);
      const res = await API.post(`/admin/auth/classes/${classId}/sections/${sectionId}/assign-teacher`, {
        teacherId: selectedTeacher,
        subjectId: selectedSubject,
      });
      toast.success(res.data.message);
      setSelectedTeacher("");
      setSelectedSubject("");
      fetchClassInfo();
    } catch (err) {
      console.log(err);
      
      toast.error(err.response?.data?.message || "Error assigning teacher");
    } finally {
      setLoading(false);
    }
  };

  const removeTeacher = async (subjectId, teacherId) => {
    try {
      const res = await API.delete(`/admin/auth/classes/sections/${sectionId}/teachers`, {
        data: { subjectId, teacherId },
      });
      toast.success(res.data.message);
      fetchClassInfo();
    } catch (err) {
      console.log(err);
      
      toast.error(err.response?.data?.message || "Error removing teacher");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 p-4 lg:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center gap-4">
          <Button onClick={() => navigate(-1)} variant="outline" size="sm">
            <ArrowLeft />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Assign Teacher
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Assign teacher to {classInfo.name} - {sectionInfo.name}
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
              <CardContent className="p-6 text-center space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{classInfo.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Section: {sectionInfo.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Sections: {classInfo.sections?.length || 0}</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
                  <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Available Teachers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p>Total Teachers: {teachers.length}</p>
                  <p>Active Teachers: {teachers.filter((t) => t.status === "active").length}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Assignment Form */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle>Teacher Assignment Form</CardTitle>
                <CardDescription>Select teacher and subject to assign</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Subject */}
                <div>
                  <Label>Subject</Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {sectionInfo.subjects?.map((sub) => (
                        <SelectItem key={sub.subjectId} value={sub.subjectId}>
                          {sub.subjectName} {/* use subjectName directly */}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Teacher */}
                <div>
                  <Label>Teacher</Label>
                  <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((t) => (
                        <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={() => navigate(-1)} variant="outline">Cancel</Button>
                  <Button onClick={assignTeacher} disabled={!selectedTeacher || !selectedSubject || loading}>
                    {loading ? "Assigning..." : "Assign Teacher"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Assigned Teachers */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle>Assigned Teachers</CardTitle>
              </CardHeader>
              <CardContent>
                {sectionInfo.subjects?.map((sub) => (
                  <div key={sub.subjectId} className="space-y-2">
                    <h4 className="font-semibold">{sub.subjectName}</h4>
                    <div className="flex flex-wrap gap-2">
                      {sub.teachers?.length ? (
  sub.teachers.map((t) => (
    <Badge
      key={t._id}
      className="flex items-center gap-1 cursor-pointer"
      onClick={() => removeTeacher(sub.subjectId, t._id)}
    >
      {t.name} <X className="h-3 w-3" />
    </Badge>
  ))
) : (
  <span className="text-sm text-gray-500 dark:text-gray-400">No teachers assigned</span>
)}

                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignTeacher;
