import React, { useEffect, useState } from "react";
import userLogo from "../../assets/user.jpg";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  Loader2, Edit3, Mail, Phone, MapPin, User, Calendar, 
  GraduationCap, Users, Shield, BookOpen, Briefcase, 
  IdCard, Heart, Star, Building, Clock
} from "lucide-react";
import API from "@/api/axios";

const StudentProfile = () => {
  const { user } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(user || null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileComplete, setProfileComplete] = useState(0);

  const [input, setInput] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    parentInfo: { father: {}, mother: {} },
    profilePic: null,
  });

  const calculateProfileCompletion = (profile) => {
    const fields = ['firstName', 'lastName', 'email', 'phone', 'address', 'dateOfBirth', 'gender'];
    const filledFields = fields.filter(field => profile[field] && profile[field].toString().trim() !== '');
    return Math.round((filledFields.length / fields.length) * 100);
  };

  const fetchProfile = async () => {
    try {
      const res = await API.get("/student/auth/profile");
      if (res.data.success) {
        setProfile(res.data.student);
        setProfileComplete(calculateProfileCompletion(res.data.student));
        setInput({
          firstName: res.data.student.firstName || "",
          lastName: res.data.student.lastName || "",
          email: res.data.student.email || "",
          phone: res.data.student.phone || "",
          address: res.data.student.address || "",
          parentInfo: res.data.student.parentInfo || { father: {}, mother: {} },
          profilePic: null,
        });
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
      toast.error("Failed to fetch profile");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const changeEventHandler = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
  };

  const changeParentHandler = (e, type, field) => {
    const { value } = e.target;
    setInput((prev) => ({
      ...prev,
      parentInfo: {
        ...prev.parentInfo,
        [type]: { ...prev.parentInfo[type], [field]: value },
      },
    }));
  };

  const changeFileHandler = (e) => {
    setInput((prev) => ({ ...prev, profilePic: e.target.files?.[0] }));
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(input).forEach((key) => {
      if (key === "parentInfo") {
        formData.append("parentInfo", JSON.stringify(input.parentInfo));
      } else if (input[key] !== null) {
        formData.append(key, input[key]);
      }
    });

    try {
      setLoading(true);
      const res = await API.put("/student/profile/update", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        toast.success("🎉 Profile updated successfully!");
        setOpen(false);
        fetchProfile();
      }
    } catch (err) {
      console.error("Profile update error:", err);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white text-lg font-medium">Loading your profile...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 py-8 px-4 lg:px-8">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row gap-8 mb-8">
          {/* Profile Overview Card */}
          <Card className="flex-1 border-0 shadow-2xl bg-white/10 backdrop-blur-md text-white">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                {/* Avatar Section */}
                <div className="relative">
                  <div className="relative">
                    <Avatar className="w-28 h-28 border-4 border-white/20 shadow-2xl">
                      <AvatarImage src={profile?.profilePic || userLogo} />
                      <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white text-xl font-semibold">
                        {profile?.firstName?.charAt(0) || "S"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -inset-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full blur-lg opacity-30 animate-pulse"></div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full p-1.5 border-4 border-white">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-4">
                    <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white to-pink-100 bg-clip-text text-transparent">
                      {profile?.firstName} {profile?.lastName}
                    </h1>
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 border-0">
                      <Star className="h-3 w-3 mr-1" />
                      {profile?.status || "Active"}
                    </Badge>
                  </div>
                  
                  <p className="text-purple-200 text-lg mb-2 flex items-center justify-center lg:justify-start gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Class {profile?.classId?.name || "N/A"} • Section {profile?.sectionId?.name || "N/A"}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-purple-200 justify-center lg:justify-start">
                    <div className="flex items-center gap-1">
                      <IdCard className="h-4 w-4" />
                      <span>Roll No: {profile?.rollNumber || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>Since {profile?.academicYear || "N/A"}</span>
                    </div>
                  </div>

                  {/* Profile Completion */}
                  <div className="mt-6 space-y-2 max-w-md">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-purple-200">Profile Completion</span>
                      <span className="font-semibold text-white">{profileComplete}%</span>
                    </div>
                    <Progress value={profileComplete} className="h-2 bg-white/20">
                      <div className="h-full bg-gradient-to-r from-green-400 to-cyan-400 rounded-full transition-all duration-500" 
                           style={{ width: `${profileComplete}%` }} />
                    </Progress>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats Card */}
          <Card className="w-full lg:w-80 border-0 shadow-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white">
            <CardContent className="p-6 h-full flex flex-col">
              <CardTitle className="text-lg mb-6 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Student Overview
              </CardTitle>
              
              <div className="space-y-4 flex-1">
                <div className="flex items-center justify-between p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <div>
                    <p className="text-2xl font-bold">{profile?.attendance?.percentage || 0}%</p>
                    <p className="text-amber-100 text-sm">Attendance</p>
                  </div>
                  <div className="p-2 bg-white/30 rounded-lg">
                    <Calendar className="h-5 w-5" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <div>
                    <p className="text-2xl font-bold">{profile?.subjects?.length || 0}</p>
                    <p className="text-amber-100 text-sm">Subjects</p>
                  </div>
                  <div className="p-2 bg-white/30 rounded-lg">
                    <BookOpen className="h-5 w-5" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <div>
                    <p className="text-2xl font-bold">A</p>
                    <p className="text-amber-100 text-sm">Current Grade</p>
                  </div>
                  <div className="p-2 bg-white/30 rounded-lg">
                    <Star className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full mt-6 bg-white text-orange-600 hover:bg-white/90 font-semibold">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </DialogTrigger>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information */}
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription className="text-cyan-100">
                  Basic student details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { icon: User, label: "First Name", value: input.firstName },
                    { icon: User, label: "Last Name", value: input.lastName },
                    { icon: Mail, label: "Email Address", value: input.email },
                    { icon: Phone, label: "Phone Number", value: input.phone },
                    { icon: Calendar, label: "Date of Birth", value: profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : "N/A" },
                    { icon: Users, label: "Gender", value: profile?.gender || "N/A" },
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <Label className="text-sm font-medium text-cyan-100 flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Label>
                      <p className="font-medium p-2 bg-white/10 rounded-md backdrop-blur-sm">
                        {item.value || "Not provided"}
                      </p>
                    </div>
                  ))}
                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-sm font-medium text-cyan-100 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Address
                    </Label>
                    <p className="font-medium p-2 bg-white/10 rounded-md backdrop-blur-sm min-h-[44px]">
                      {input.address || "Not provided"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Academic Information */}
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <GraduationCap className="h-5 w-5" />
                  Academic Information
                </CardTitle>
                <CardDescription className="text-emerald-100">
                  Class and section details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { icon: BookOpen, label: "Class", value: profile?.classId?.name },
                    { icon: Users, label: "Section", value: profile?.sectionId?.name },
                    { icon: IdCard, label: "Roll Number", value: profile?.rollNumber },
                    { icon: Building, label: "Academic Year", value: profile?.academicYear },
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <Label className="text-sm font-medium text-emerald-100 flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Label>
                      <p className="font-medium p-2 bg-white/10 rounded-md backdrop-blur-sm">
                        {item.value || "N/A"}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Parent Information */}
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-violet-600 to-purple-600 text-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Users className="h-5 w-5" />
                  Parent Information
                </CardTitle>
                <CardDescription className="text-purple-100">
                  Father and mother details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Father's Info */}
                <div>
                  <Label className="text-sm font-medium text-purple-100 mb-3  flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Father's Information
                  </Label>
                  <div className="space-y-3 bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                    {[
                      { label: "Name", value: profile?.parentInfo?.father?.name },
                      { label: "Email", value: profile?.parentInfo?.father?.email },
                      { label: "Phone", value: profile?.parentInfo?.father?.phone },
                      { label: "Occupation", value: profile?.parentInfo?.father?.occupation },
                    ].map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-purple-200">{item.label}</span>
                        <span className="font-medium text-right">{item.value || "N/A"}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="bg-white/20" />

                {/* Mother's Info */}
                <div>
                  <Label className="text-sm font-medium text-purple-100 mb-3  flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Mother's Information
                  </Label>
                  <div className="space-y-3 bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                    {[
                      { label: "Name", value: profile?.parentInfo?.mother?.name },
                      { label: "Email", value: profile?.parentInfo?.mother?.email },
                      { label: "Phone", value: profile?.parentInfo?.mother?.phone },
                      { label: "Occupation", value: profile?.parentInfo?.mother?.occupation },
                    ].map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-purple-200">{item.label}</span>
                        <span className="font-medium text-right">{item.value || "N/A"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-rose-600 to-pink-600 text-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Briefcase className="h-5 w-5" />
                  Additional Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Username", value: profile?.username },
                  { label: "Admission Date", value: profile?.admissionDate ? new Date(profile.admissionDate).toLocaleDateString() : null },
                  { label: "Blood Group", value: profile?.bloodGroup },
                  { label: "Medical Info", value: profile?.medicalInfo || "No medical conditions" },
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-white/20 last:border-0">
                    <span className="text-sm text-pink-200">{item.label}</span>
                    <span className="font-medium text-right">{item.value || "N/A"}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] border-0 bg-gradient-to-br from-slate-900 to-purple-900 text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl bg-gradient-to-r from-white to-pink-200 bg-clip-text text-transparent">
              <Edit3 className="h-5 w-5" />
              Edit Profile
            </DialogTitle>
            <DialogDescription className="text-purple-200">
              Update your personal and parent information
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submitHandler} className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-white">Personal Information</h3>
              {[
                { field: "firstName", label: "First Name" },
                { field: "lastName", label: "Last Name" },
                { field: "email", label: "Email Address", type: "email" },
                { field: "phone", label: "Phone Number" },
                { field: "address", label: "Address" },
              ].map((item) => (
                <div key={item.field} className="space-y-2">
                  <Label htmlFor={item.field} className="text-sm font-medium text-purple-200">
                    {item.label}
                  </Label>
                  <Input
                    id={item.field}
                    name={item.field}
                    type={item.type || "text"}
                    value={input[item.field]}
                    onChange={changeEventHandler}
                    className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-white/40"
                    placeholder={`Enter your ${item.label.toLowerCase()}`}
                  />
                </div>
              ))}

              {/* Parent Information */}
              <h3 className="font-semibold text-lg text-white mt-6">Parent Information</h3>
              
              {["father", "mother"].map((type) => (
                <div key={type} className="space-y-3">
                  <h4 className="font-medium text-white capitalize">{type}'s Information</h4>
                  {["name", "email", "phone", "occupation"].map((field) => (
                    <div key={field} className="space-y-2">
                      <Label htmlFor={`${type}-${field}`} className="text-sm font-medium text-purple-200 capitalize">
                        {type} {field}
                      </Label>
                      <Input
                        id={`${type}-${field}`}
                        type="text"
                        value={input.parentInfo[type][field] || ""}
                        onChange={(e) => changeParentHandler(e, type, field)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-white/40"
                        placeholder={`Enter ${type}'s ${field}`}
                      />
                    </div>
                  ))}
                </div>
              ))}

              {/* Profile Picture */}
              <div className="space-y-2">
                <Label htmlFor="profilePic" className="text-sm font-medium text-purple-200">
                  Profile Picture
                </Label>
                <Input 
                  type="file" 
                  id="profilePic" 
                  accept="image/*" 
                  onChange={changeFileHandler} 
                  className="bg-white/10 border-white/20 text-white file:text-white file:bg-purple-600 file:border-0 file:mr-4 file:py-2 file:px-4 file:rounded-md"
                />
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                className="mr-2 border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              {loading ? (
                <Button disabled className="bg-gradient-to-r from-purple-600 to-pink-600">
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Saving...
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold"
                >
                  Save Changes
                </Button>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentProfile;