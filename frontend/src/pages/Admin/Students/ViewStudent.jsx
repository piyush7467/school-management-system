import React, { useEffect, useState } from "react";
import API from "@/api/axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  Shield,
  User,
  IdCard,
  Edit,
  Home,
  GraduationCap,
  Users,
  MapPin,
  Cake,
  VenetianMask,
  School,
  Download,
  Printer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import userLogo from "../../../assets/user.jpg";

const ViewStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await API.get(`/admin/auth/students/getstudent/${id}`);
        setStudent(res.data.student);
      } catch (err) {
        console.error(err);
        toast.error(`Failed to fetch student: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id]);

  const InfoItem = ({ icon: Icon, label, value, className = "" }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${className}`}
    >
      <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg shadow-sm">
        <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1 truncate">
          {value || <span className="text-gray-400 dark:text-gray-500 italic">Not provided</span>}
        </p>
      </div>
    </motion.div>
  );

  const SectionCard = ({ title, icon: Icon, children, className = "", gradient = "from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20" }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm ${className}`}>
        <CardHeader className={`pb-3 bg-gradient-to-r ${gradient} rounded-t-lg border-b dark:border-gray-700`}>
          <CardTitle className="text-lg font-bold flex items-center gap-3 text-gray-900 dark:text-white">
            <div className="p-2 bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-sm">
              <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">{children}</CardContent>
      </Card>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-2xl" />
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex flex-col items-center space-y-4">
                  <Skeleton className="w-32 h-32 rounded-2xl" />
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </CardContent>
            </Card>
            <div className="lg:col-span-2 space-y-6">
              {[1, 2, 3].map((item) => (
                <Card key={item} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-6 w-48" />
                    <div className="grid grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map((subItem) => (
                        <Skeleton key={subItem} className="h-16 rounded-xl" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center p-6">
        <Card className="max-w-md w-full text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-2xl">
          <CardContent className="p-8">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <User className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Student Not Found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The student you're looking for doesn't exist or has been removed.
            </p>
            <Button 
              onClick={() => navigate(-1)}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Students
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-gray-700/50"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-xl h-12 w-12 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Student Profile
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Detailed information about {student.firstName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant={student.status === "active" ? "default" : "secondary"}
              className={`px-4 py-2 text-sm font-semibold rounded-xl ${
                student.status === "active"
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25"
                  : "bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg shadow-red-500/25"
              }`}
            >
              {student.status === "active" ? "🟢 Active" : "🔴 Inactive"}
            </Badge>
            <Button
              onClick={() => navigate(`/admin/student/edit/${id}`)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-2xl border-4 border-white dark:border-gray-800 shadow-2xl overflow-hidden">
                        <img
                          src={student.profilePic || userLogo}
                          alt={`${student.firstName} ${student.lastName}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-2 rounded-full shadow-lg">
                        <School className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {student.firstName} {student.lastName}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Student</p>
                      {student.rollNumber && (
                        <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
                          Roll No: {student.rollNumber}
                        </Badge>
                      )}
                    </div>
                    <div className="w-full pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                      <InfoItem icon={Mail} label="Email" value={student.email} />
                      <InfoItem icon={Phone} label="Phone" value={student.phone} />
                      <InfoItem icon={IdCard} label="Username" value={student.username} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                    <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Student Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Status</span>
                    <Badge variant={student.status === "active" ? "default" : "secondary"} className={
                      student.status === "active" 
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" 
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                    }>
                      {student.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Member Since</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Academic Information */}
            <SectionCard 
              title="Academic Information" 
              icon={GraduationCap}
              gradient="from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem
                  icon={BookOpen}
                  label="Class"
                  value={student.classId?.name || "N/A"}
                />
                <InfoItem
                  icon={Shield}
                  label="Section"
                  value={student.sectionId?.name || "N/A"}
                />
                <InfoItem 
                  icon={Calendar} 
                  label="Admission Date" 
                  value={student.createdAt ? new Date(student.createdAt).toLocaleDateString() : "N/A"} 
                />
                <InfoItem 
                  icon={VenetianMask}
                  label="Student ID"
                  value={student._id?.slice(-8).toUpperCase() || "N/A"}
                />
              </div>
            </SectionCard>

            {/* Personal Information */}
            <SectionCard 
              title="Personal Details" 
              icon={User}
              gradient="from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem 
                  icon={Cake} 
                  label="Date of Birth" 
                  value={student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : "N/A"} 
                />
                <InfoItem 
                  icon={User} 
                  label="Gender" 
                  value={student.gender} 
                />
                <InfoItem 
                  icon={MapPin} 
                  label="Address" 
                  value={student.address} 
                  className="md:col-span-2"
                />
              </div>
            </SectionCard>

            {/* Parent Information */}
            {student.parentInfo && (
              <SectionCard 
                title="Parent Information" 
                icon={Users}
                gradient="from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20"
              >
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-5 border border-blue-200 dark:border-blue-700/50">
                    <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-4 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Father's Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoItem icon={User} label="Full Name" value={student.parentInfo.father?.name} />
                      <InfoItem icon={Mail} label="Email Address" value={student.parentInfo.father?.email} />
                      <InfoItem icon={Phone} label="Phone Number" value={student.parentInfo.father?.phone} />
                      <InfoItem icon={Home} label="Occupation" value={student.parentInfo.father?.occupation} />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-xl p-5 border border-pink-200 dark:border-pink-700/50">
                    <h4 className="font-bold text-pink-900 dark:text-pink-300 mb-4 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Mother's Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoItem icon={User} label="Full Name" value={student.parentInfo.mother?.name} />
                      <InfoItem icon={Mail} label="Email Address" value={student.parentInfo.mother?.email} />
                      <InfoItem icon={Phone} label="Phone Number" value={student.parentInfo.mother?.phone} />
                      <InfoItem icon={Home} label="Occupation" value={student.parentInfo.mother?.occupation} />
                    </div>
                  </div>
                </div>
              </SectionCard>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-700"
        >
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin/students')}
            className="rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Students List
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-xl flex items-center gap-2">
              <Printer className="h-4 w-4" />
              Print Profile
            </Button>
            <Button className="rounded-xl bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Profile
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ViewStudent;