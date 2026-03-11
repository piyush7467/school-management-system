import React, { useEffect, useState } from "react";
import userLogo from "../../assets/user.jpg";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  Loader2, Edit, Mail, Phone, MapPin, User, Calendar, Award, 
  BookOpen, Users, Shield, GraduationCap, Briefcase, 
  IdCard, Heart, Star, Zap
} from "lucide-react";
import API from "@/api/axios";

const TeacherProfile = () => {
  const { user } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(user || null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileComplete, setProfileComplete] = useState(0);

  const [input, setInput] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    profilePic: null,
    emergencyContact: "",
  });

  const calculateProfileCompletion = (profile) => {
    const fields = ['name', 'email', 'phone', 'address', 'qualification', 'experience', 'gender'];
    const filledFields = fields.filter(field => profile[field] && profile[field].toString().trim() !== '');
    return Math.round((filledFields.length / fields.length) * 100);
  };

  const fetchProfile = async () => {
    try {
      const res = await API.get("/teacher/auth/profile");
      if (res.data.success) {
        setProfile(res.data.teacher);
        setProfileComplete(calculateProfileCompletion(res.data.teacher));
        setInput({
          name: res.data.teacher.name || "",
          email: res.data.teacher.email || "",
          phone: res.data.teacher.phone || "",
          address: res.data.teacher.address || "",
          profilePic: null,
          emergencyContact: res.data.teacher.emergencyContact || "",
        });
      }
    } catch (err) {
      console.error(err);
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

  const changeFileHandler = (e) => {
    setInput((prev) => ({ ...prev, profilePic: e.target.files?.[0] }));
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(input).forEach((key) => {
      if (input[key] !== null) formData.append(key, input[key]);
    });

    try {
      setLoading(true);
      const res = await API.put("/teacher/auth/profile/update", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        toast.success("🎉 Profile updated successfully!");
        setOpen(false);
        fetchProfile();
      }
    } catch (err) {
      console.error(err);
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Profile Card */}
          <Card className="lg:col-span-2 border-0 shadow-2xl bg-white/10 backdrop-blur-md text-white">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                {/* Avatar with Glow Effect */}
                <div className="relative">
                  <div className="relative">
                    <Avatar className="w-32 h-32 border-4 border-white/20 shadow-2xl">
                      <AvatarImage src={profile.profilePic || userLogo} />
                      <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white text-2xl font-bold">
                        {profile.name?.charAt(0) || "T"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -inset-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full blur-lg opacity-30 animate-pulse"></div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full p-2 border-4 border-white dark:border-slate-900 shadow-lg">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-3 mb-3">
                    <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-pink-100 bg-clip-text text-transparent">
                      {profile.name}
                    </h1>
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 border-0">
                      <Star className="h-3 w-3 mr-1" />
                      Pro
                    </Badge>
                  </div>
                  
                  <p className="text-purple-200 text-lg mb-6 flex items-center justify-center lg:justify-start gap-2">
                    <GraduationCap className="h-5 w-5" />
                    {profile.qualification || "Qualification not specified"}
                  </p>
                  
                  {/* Profile Completion */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-purple-200">Profile Completion</span>
                      <span className="text-white font-semibold">{profileComplete}%</span>
                    </div>
                    <Progress value={profileComplete} className="h-2 bg-white/20">
                      <div className="h-full bg-gradient-to-r from-green-400 to-cyan-400 rounded-full transition-all duration-500" 
                           style={{ width: `${profileComplete}%` }} />
                    </Progress>
                  </div>

                  {/* Quick Stats */}
                  <div className="flex flex-wrap gap-4 mt-6 justify-center lg:justify-start">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{profile.experience || 0}</div>
                      <div className="text-xs text-purple-200">Years Exp</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{profile.subjects?.length || 0}</div>
                      <div className="text-xs text-purple-200">Subjects</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{profile.classSections?.length || 0}</div>
                      <div className="text-xs text-purple-200">Classes</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Card */}
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white">
            <CardContent className="p-6 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-6 w-6" />
                  <CardTitle className="text-white">Teacher Status</CardTitle>
                </div>
                <Badge variant="secondary" className="bg-white text-orange-600 font-semibold">
                  {profile.status || "Active"}
                </Badge>
                <p className="text-amber-100 text-sm mt-3">
                  You are currently active and available for teaching assignments.
                </p>
              </div>
              
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-white text-orange-600 hover:bg-white/90 shadow-lg font-semibold mt-4">
                    <Edit className="h-4 w-4 mr-2" />
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
            {/* Contact Information */}
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <User className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { icon: User, label: "Full Name", value: input.name },
                    { icon: Mail, label: "Email", value: input.email },
                    { icon: Phone, label: "Phone", value: input.phone },
                    { icon: Heart, label: "Emergency Contact", value: input.emergencyContact },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm text-cyan-100">{item.label}</p>
                        <p className="font-semibold">{item.value || "Not provided"}</p>
                      </div>
                    </div>
                  ))}
                  <div className="md:col-span-2 flex items-start gap-3 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm text-cyan-100">Address</p>
                      <p className="font-semibold">{input.address || "Not provided"}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Details */}
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Briefcase className="h-5 w-5" />
                  Professional Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { icon: IdCard, label: "Employee ID", value: profile.employeeId },
                    { icon: Award, label: "Experience", value: profile.experience ? `${profile.experience} years` : null },
                    { icon: GraduationCap, label: "Qualification", value: profile.qualification },
                    { icon: Calendar, label: "Joining Date", value: profile.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : null },
                  ].map((item, index) => (
                    <div key={index} className="text-center p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                      <div className="p-2 bg-white/20 rounded-lg w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <p className="text-emerald-100 text-sm mb-1">{item.label}</p>
                      <p className="font-bold text-lg">{item.value || "N/A"}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Teaching Details */}
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-violet-600 to-purple-600 text-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <BookOpen className="h-5 w-5" />
                  Teaching Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Subjects */}
                <div>
                  <Label className="text-sm text-purple-200 mb-3 block">Assigned Subjects</Label>
                  <div className="flex flex-wrap gap-2">
                    {profile.subjects?.length > 0 ? (
                      profile.subjects.map((subject, index) => (
                        <Badge key={index} className="bg-white/20 text-white border-0 backdrop-blur-sm">
                          {subject.name}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-purple-200">No subjects assigned</p>
                    )}
                  </div>
                </div>

                {/* Classes & Sections */}
                <div>
                  <Label className="text-sm text-purple-200 mb-3 block">Classes & Sections</Label>
                  <div className="space-y-3">
                    {profile.classSections?.length > 0 ? (
                      profile.classSections.map((cs, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                          <div>
                            <p className="font-semibold">Class {cs.class?.name}</p>
                            <p className="text-sm text-purple-200">Section</p>
                          </div>
                          <Badge className="bg-white text-purple-600 font-bold">
                            {cs.section?.name || "N/A"}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-purple-200">No classes assigned</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-rose-600 to-pink-600 text-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Users className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Username", value: profile.username },
                  { label: "Gender", value: profile.gender },
                  { label: "Date of Birth", value: profile.dob ? new Date(profile.dob).toLocaleDateString() : null },
                  { label: "Aadhar Number", value: profile.aadharNo },
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-2 border-b border-white/20">
                    <span className="text-pink-200 text-sm">{item.label}</span>
                    <span className="font-semibold text-right">{item.value || "N/A"}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px] border-0 bg-gradient-to-br from-slate-900 to-purple-900 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl bg-gradient-to-r from-white to-pink-200 bg-clip-text text-transparent">
              <Edit className="h-6 w-6" />
              Edit Profile
            </DialogTitle>
            <DialogDescription className="text-purple-200">
              Update your personal information. All changes will be reflected immediately.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submitHandler} className="space-y-6">
            <div className="space-y-4">
              {["name", "email", "phone", "address", "emergencyContact"].map(field => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={field} className="text-sm font-medium text-purple-200">
                    {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                  </Label>
                  <Input
                    id={field}
                    name={field}
                    type="text"
                    value={input[field]}
                    onChange={changeEventHandler}
                    className="bg-white/10 border-white/20 text-white placeholder:text-purple-300"
                    placeholder={`Enter your ${field}`}
                  />
                </div>
              ))}

              <div className="space-y-2">
                <Label htmlFor="profilePic" className="text-sm font-medium text-purple-200">
                  Profile Picture
                </Label>
                <Input 
                  type="file" 
                  id="profilePic" 
                  accept="image/*" 
                  onChange={changeFileHandler} 
                  className="bg-white/10 border-white/20 text-white file:text-white file:bg-purple-600 file:border-0"
                />
              </div>
            </div>

            <DialogFooter>
              {loading ? (
                <Button disabled className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Saving Changes...
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold shadow-lg"
                >
                  <Zap className="mr-2 h-4 w-4" />
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

export default TeacherProfile;