import React, { useEffect, useState } from "react";
import API from "@/api/axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  Briefcase,
  User,
  IdCard,
  Shield,
  Edit3,
  Star,
  Award,
  GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import userLogo from '../../assets/user.jpg';

const ViewTeacherDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const res = await API.get(`/admin/auth/teachers/teacher/${id}`);
        setTeacher(res.data.teacher);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch teacher details");
      } finally {
        setLoading(false);
      }
    };
    fetchTeacher();
  }, [id]);

  const InfoItem = ({ icon: Icon, label, value, className = "" }) => (
    <div className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 group ${className}`}>
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/30 transition-colors">
        <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1">
          {label}
        </span>
        <span className="text-sm font-medium text-gray-900 dark:text-white truncate block">
          {value || <span className="text-gray-400 dark:text-gray-500 italic">Not provided</span>}
        </span>
      </div>
    </div>
  );

  const colorClasses = {
    blue: {
      container: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700/50",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      icon: "text-blue-600 dark:text-blue-400",
    },
    green: {
      container: "from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700/50",
      iconBg: "bg-green-100 dark:bg-green-900/30",
      icon: "text-green-600 dark:text-green-400",
    },
    purple: {
      container: "from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700/50",
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      icon: "text-purple-600 dark:text-purple-400",
    },
  };

  const StatCard = ({ icon: Icon, label, value, color = "blue" }) => {
    const styles = colorClasses[color] || colorClasses.blue;

    return (
      <div className={`p-4 rounded-xl bg-gradient-to-br ${styles.container}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${styles.iconBg}`}>
            <Icon className={`h-5 w-5 ${styles.icon}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{label}</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{value}</p>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900/10 dark:to-indigo-900/10 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-80 rounded-2xl" />
            <Skeleton className="h-80 lg:col-span-2 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900/10 dark:to-indigo-900/10 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/20">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-red-800 dark:text-red-300 mb-2">Teacher Not Found</h3>
              <p className="text-red-600 dark:text-red-400 mb-6">The requested teacher profile could not be found.</p>
              <Button
                onClick={() => navigate(-1)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Teachers List
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900/10 dark:to-indigo-900/10 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="rounded-full h-12 w-12 p-0 flex items-center justify-center border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800 shadow-sm hover:scale-105 transition-all duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Teacher Profile
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Detailed information about {teacher.name}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge
              variant={teacher.status === "active" ? "default" : "secondary"}
              className={`px-4 py-2 text-sm font-medium ${teacher.status === "active"
                  ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700"
                  : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700"
                }`}
            >
              {teacher.status?.toUpperCase()}
            </Badge>
            <Badge variant="outline" className="px-3 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
              ID: {teacher.employeeId || "N/A"}
            </Badge>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Sidebar - Profile & Quick Stats */}
          <div className="xl:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    <div className="relative w-32 h-32 rounded-2xl border-4 border-white dark:border-gray-800 shadow-2xl overflow-hidden">
                      <img
                        src={teacher.profilePic || userLogo}
                        alt={teacher.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 border-0 shadow-lg">
                        <GraduationCap className="h-3 w-3 mr-1" />
                        Teacher
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{teacher.name}</h2>
                    <p className="text-gray-600 dark:text-gray-400">{teacher.subjectsList || "Subject not specified"}</p>
                    <div className="flex items-center justify-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">5.0 Rating</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
                  <Award className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <StatCard icon={Calendar} label="Experience" value={`${teacher.experience || 0} years`} color="blue" />
                <StatCard icon={BookOpen} label="Subjects" value={teacher.subjectsList?.split(",").length || 0} color="green" />
                <StatCard icon={User} label="Students" value="45" color="purple" />
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="xl:col-span-3 space-y-6">
            {/* Professional Information Card */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-t-2xl border-b dark:border-gray-700">
                <CardTitle className="flex items-center gap-3 text-xl text-gray-900 dark:text-white">
                  <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  Professional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <InfoItem icon={BookOpen} label="Class" value={teacher.classList} />
                  <InfoItem icon={Shield} label="Section" value={teacher.sectionList} />
                  <InfoItem icon={User} label="Subjects" value={teacher.subjectsList} />
                  <InfoItem icon={IdCard} label="Employee ID" value={teacher.employeeId} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Personal Details */}
                  <div className="space-y-4 p-4 bg-gray-50/50 dark:bg-gray-700/30 rounded-xl">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 text-lg">
                      <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      Personal Details
                    </h3>
                    <div className="space-y-2">
                      <InfoItem icon={Calendar} label="Date of Birth" value={teacher.dob ? new Date(teacher.dob).toLocaleDateString() : "N/A"} />
                      <InfoItem icon={User} label="Gender" value={teacher.gender} />
                      <InfoItem icon={Phone} label="Emergency Contact" value={teacher.emergencyContact} />
                    </div>
                  </div>

                  {/* Professional Details */}
                  <div className="space-y-4 p-4 bg-gray-50/50 dark:bg-gray-700/30 rounded-xl">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 text-lg">
                      <Award className="h-5 w-5 text-green-600 dark:text-green-400" />
                      Professional Details
                    </h3>
                    <div className="space-y-2">
                      <InfoItem icon={Calendar} label="Joining Date" value={teacher.joiningDate ? new Date(teacher.joiningDate).toLocaleDateString() : "N/A"} />
                      <InfoItem icon={Briefcase} label="Experience" value={`${teacher.experience || 0} years`} />
                      <InfoItem icon={GraduationCap} label="Qualification" value={teacher.qualification} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information Card */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-t-2xl border-b dark:border-gray-700">
                <CardTitle className="flex items-center gap-3 text-xl text-gray-900 dark:text-white">
                  <MapPin className="h-6 w-6 text-green-600 dark:text-green-400" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem icon={Mail} label="Email Address" value={teacher.email} />
                  <InfoItem icon={Phone} label="Phone Number" value={teacher.phone} />
                  <InfoItem icon={MapPin} label="Full Address" value={teacher.address} className="md:col-span-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Last updated: {teacher.updatedAt ? new Date(teacher.updatedAt).toLocaleDateString() : "N/A"}
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="rounded-xl px-6 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to List
                </Button>
                <Button
                  onClick={() => navigate(`/admin/teacher/edit/${id}`)}
                  className="rounded-xl px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 text-white"
                >
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ViewTeacherDetails;
