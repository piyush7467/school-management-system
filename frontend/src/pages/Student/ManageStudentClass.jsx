import React, { useEffect, useState } from "react";
import API from "@/api/axios";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  BookOpen,
  Users,
  Mail,
  Phone,
  GraduationCap,
  UserCheck,
  Calendar,
  RefreshCw,
  FileText,
  Clock,
  Copy,
  Check,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import userLogo from '../../assets/user.jpg'

const ManageStudentClass = () => {
  const [classDetails, setClassDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState('');

  const fetchClassDetails = async () => {
    try {
      setLoading(true);
      const res = await API.get("/student/auth/my-class-details");
      if (res.data.success) {
        setClassDetails(res.data.class);
      } else {
        toast.error(res.data.message || "Failed to fetch class details");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching class details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassDetails();
  }, []);

  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const handleEmailClick = (email, teacherName, subjectName = "") => {
    const subject = subjectName ? `Regarding ${subjectName}` : "Regarding Class";
    window.open(`mailto:${email}?subject=${subject} - ${teacherName}`, '_blank');
  };

  const handleCallClick = (phone) => {
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    window.open(`tel:${cleanPhone}`, '_blank');
  };

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
    toast.success("Copied to clipboard!");
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 flex justify-center items-center">
        <div className="text-center">
          <RefreshCw className="animate-spin h-8 w-8 mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading your class details...</p>
        </div>
      </div>
    );

  if (!classDetails)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 flex justify-center items-center">
        <div className="text-center max-w-sm">
          <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Class Details Found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Unable to load your class information.
          </p>
          <Button onClick={fetchClassDetails}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );

  const { className, sectionName, classTeacher, subjects } = classDetails;

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
              My Class Details
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              View your class information, teacher details, and subjects
            </p>
          </div>
          <Button
            onClick={fetchClassDetails}
            variant="outline"
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Class</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{className}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500 opacity-80" />
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
                <p className="text-sm text-gray-500 dark:text-gray-400">Section</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{sectionName || "N/A"}</p>
              </div>
              <Users className="h-8 w-8 text-green-500 opacity-80" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 border border-purple-200 dark:border-purple-800 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Subjects</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{subjects?.length || 0}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-500 opacity-80" />
            </div>
          </motion.div>
        </div>

        {/* Class Teacher Card */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-2xl rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <UserCheck className="h-6 w-6 text-blue-600" />
              Class Teacher
            </CardTitle>
            <CardDescription>
              Your class teacher information and contact details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatePresence>
              {classTeacher ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col lg:flex-row items-center lg:items-start gap-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800"
                >
                  <Avatar className="h-20 w-20 border-4 border-white dark:border-gray-800 shadow-lg">
                    <AvatarImage src={classTeacher.profilePic || userLogo} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-semibold">
                      {getInitials(classTeacher.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 text-center lg:text-left">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {classTeacher.name}
                        </h3>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 mt-2">
                          Class Teacher
                        </Badge>
                      </div>
                      <div className="flex gap-2 justify-center lg:justify-start">
                        {classTeacher.email && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            onClick={() => handleEmailClick(classTeacher.email, classTeacher.name)}
                          >
                            <Mail className="h-4 w-4" />
                            Email
                          </Button>
                        )}
                        {classTeacher.phone && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 hover:bg-green-50 dark:hover:bg-green-900/20"
                            onClick={() => handleCallClick(classTeacher.phone)}
                          >
                            <Phone className="h-4 w-4" />
                            Call
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {classTeacher.email && (
                        <div className="flex items-center gap-3 p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                          <Mail className="h-4 w-4 text-blue-500 flex-shrink-0" />
                          <span className="truncate text-gray-600 dark:text-gray-400 flex-1">{classTeacher.email}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => handleCopy(classTeacher.email, 'classTeacher-email')}
                          >
                            {copiedField === 'classTeacher-email' ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      )}
                      {classTeacher.phone && (
                        <div className="flex items-center gap-3 p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                          <Phone className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-gray-600 dark:text-gray-400 flex-1">{classTeacher.phone}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => handleCopy(classTeacher.phone, 'classTeacher-phone')}
                          >
                            {copiedField === 'classTeacher-phone' ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Class Teacher Assigned
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Your class teacher information is not available at the moment.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Subjects Card */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-2xl rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BookOpen className="h-6 w-6 text-green-600" />
              Subjects & Teachers
            </CardTitle>
            <CardDescription>
              All subjects for your class and their respective teachers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatePresence>
              {subjects && subjects.length > 0 ? (
                <div className="space-y-4">
                  {subjects.map((subject, index) => (
                    <motion.div
                      key={subject.subjectId || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-white dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                              <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-lg text-gray-900 dark:text-white">
                                {subject.name || "Unnamed Subject"}
                              </h4>
                              {subject.code && (
                                <Badge variant="outline" className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                  {subject.code}
                                </Badge>
                              )}
                            </div>
                          </div>

                          {subject.teacher && (
                            <div className="ml-11 space-y-3">
                              {Array.isArray(subject.teacher) ? (
                                // Multiple Teachers
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-blue-500" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                      {subject.teacher.length} {subject.teacher.length === 1 ? 'Teacher' : 'Teachers'}
                                    </span>
                                  </div>
                                  {subject.teacher.map((teacher, teacherIndex) => (
                                    <div 
                                      key={teacherIndex} 
                                      className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
                                    >
                                      <Avatar className="h-10 w-10 border-2 border-white dark:border-gray-800 shadow-sm">
                                        <AvatarImage src={teacher.profilePic || userLogo} />
                                        <AvatarFallback className="text-sm bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                                          {getInitials(teacher.name)}
                                        </AvatarFallback>
                                      </Avatar>
                                      
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                          <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                            {teacher.name}
                                          </p>
                                          <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs">
                                            Teacher
                                          </Badge>
                                        </div>
                                        
                                        <div className="space-y-2">
                                          {teacher.email && (
                                            <div className="flex items-center gap-2 group">
                                              <Mail className="h-3 w-3 text-blue-500 flex-shrink-0" />
                                              <span className="text-xs text-gray-600 dark:text-gray-400 truncate flex-1">
                                                {teacher.email}
                                              </span>
                                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  className="h-5 w-5 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                                                  onClick={() => handleEmailClick(teacher.email, teacher.name, subject.name)}
                                                >
                                                  <Mail className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  className="h-5 w-5 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                  onClick={() => handleCopy(teacher.email, `email-${index}-${teacherIndex}`)}
                                                >
                                                  {copiedField === `email-${index}-${teacherIndex}` ? (
                                                    <Check className="h-3 w-3 text-green-500" />
                                                  ) : (
                                                    <Copy className="h-3 w-3" />
                                                  )}
                                                </Button>
                                              </div>
                                            </div>
                                          )}
                                          
                                          {teacher.phone && (
                                            <div className="flex items-center gap-2 group">
                                              <Phone className="h-3 w-3 text-green-500 flex-shrink-0" />
                                              <span className="text-xs text-gray-600 dark:text-gray-400 flex-1">
                                                {teacher.phone}
                                              </span>
                                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  className="h-5 w-5 p-0 hover:bg-green-100 dark:hover:bg-green-900/30"
                                                  onClick={() => handleCallClick(teacher.phone)}
                                                >
                                                  <Phone className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  className="h-5 w-5 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                  onClick={() => handleCopy(teacher.phone, `phone-${index}-${teacherIndex}`)}
                                                >
                                                  {copiedField === `phone-${index}-${teacherIndex}` ? (
                                                    <Check className="h-3 w-3 text-green-500" />
                                                  ) : (
                                                    <Copy className="h-3 w-3" />
                                                  )}
                                                </Button>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                // Single Teacher
                                <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                  <Avatar className="h-10 w-10 border-2 border-white dark:border-gray-800 shadow-sm">
                                    <AvatarImage src={subject.teacher.profilePic || userLogo} />
                                    <AvatarFallback className="text-sm bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                                      {getInitials(subject.teacher.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                  
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                      <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                        {subject.teacher.name}
                                      </p>
                                      <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs">
                                        Teacher
                                      </Badge>
                                    </div>
                                    
                                    <div className="space-y-2">
                                      {subject.teacher.email && (
                                        <div className="flex items-center gap-2 group">
                                          <Mail className="h-3 w-3 text-blue-500 flex-shrink-0" />
                                          <span className="text-xs text-gray-600 dark:text-gray-400 truncate flex-1">
                                            {subject.teacher.email}
                                          </span>
                                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-5 w-5 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                                              onClick={() => handleEmailClick(subject.teacher.email, subject.teacher.name, subject.name)}
                                            >
                                              <Mail className="h-3 w-3" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-5 w-5 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                                              onClick={() => handleCopy(subject.teacher.email, `email-${index}`)}
                                            >
                                              {copiedField === `email-${index}` ? (
                                                <Check className="h-3 w-3 text-green-500" />
                                              ) : (
                                                <Copy className="h-3 w-3" />
                                              )}
                                            </Button>
                                          </div>
                                        </div>
                                      )}
                                      
                                      {subject.teacher.phone && (
                                        <div className="flex items-center gap-2 group">
                                          <Phone className="h-3 w-3 text-green-500 flex-shrink-0" />
                                          <span className="text-xs text-gray-600 dark:text-gray-400 flex-1">
                                            {subject.teacher.phone}
                                          </span>
                                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-5 w-5 p-0 hover:bg-green-100 dark:hover:bg-green-900/30"
                                              onClick={() => handleCallClick(subject.teacher.phone)}
                                            >
                                              <Phone className="h-3 w-3" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-5 w-5 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                                              onClick={() => handleCopy(subject.teacher.phone, `phone-${index}`)}
                                            >
                                              {copiedField === `phone-${index}` ? (
                                                <Check className="h-3 w-3 text-green-500" />
                                              ) : (
                                                <Copy className="h-3 w-3" />
                                              )}
                                            </Button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 self-start lg:self-auto">
                          <Button variant="outline" size="sm">
                            <Clock className="h-4 w-4 mr-2" />
                            Schedule
                          </Button>
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-2" />
                            Materials
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Subjects Found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    No subjects are currently assigned to your class.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManageStudentClass;