import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "@/api/axios";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Save, 
  User, 
  Loader2, 
  Upload, 
  X, 
  Shield,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  GraduationCap,
  Users,
  Cake,
  MapPin,
  VenetianMask
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const EditStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  
  const genders = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" }
  ];

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    if (!student.firstName?.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!student.lastName?.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (student.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email)) {
      newErrors.email = "Invalid email format";
    }
    if (student.phone && !/^\+?[\d\s-()]+$/.test(student.phone)) {
      newErrors.phone = "Invalid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fetch student and classes
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [classesRes, studentRes] = await Promise.all([
        API.get("/admin/auth/classes/"),
        API.get(`/admin/auth/students/getstudent/${id}`)
      ]);

      const studentData = studentRes.data.student;
      
      if (!studentData) {
        toast.error("Student not found");
        navigate("/admin/students");
        return;
      }

      setClasses(classesRes.data.classes || []);

      // Find student's current class to populate sections
      const selectedClass = classesRes.data.classes.find(
        (cls) => cls._id === studentData.classId?._id
      );
      setSections(selectedClass?.sections || []);

      const formattedStudent = {
        ...studentData,
        classId: studentData.classId?._id || "",
        sectionId: studentData.sectionId?._id || "",
        dateOfBirth: studentData.dateOfBirth?.split("T")[0] || "",
        parentInfo: {
          father: {
            name: studentData.parentInfo?.father?.name || "",
            email: studentData.parentInfo?.father?.email || "",
            phone: studentData.parentInfo?.father?.phone || "",
            occupation: studentData.parentInfo?.father?.occupation || ""
          },
          mother: {
            name: studentData.parentInfo?.mother?.name || "",
            email: studentData.parentInfo?.mother?.email || "",
            phone: studentData.parentInfo?.mother?.phone || "",
            occupation: studentData.parentInfo?.mother?.occupation || ""
          }
        }
      };

      setStudent(formattedStudent);
      setImagePreview(studentData.profilePic || null);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error(`Failed to fetch data: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // General input change
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setErrors(prev => ({ ...prev, [name]: "" }));

    if (name === "profilePic" && files && files[0]) {
      const file = files[0];
      
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("Image size should be less than 5MB");
        return;
      }

      setStudent((prev) => ({ ...prev, profilePic: file }));

      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setStudent((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle selects
  const handleSelectChange = (name, value) => {
    setErrors(prev => ({ ...prev, [name]: "" }));
    setStudent((prev) => ({ ...prev, [name]: value }));
  };

  // Handle class change (update sections dynamically)
  const handleClassChange = (classId) => {
    handleSelectChange("classId", classId);

    const selectedClass = classes.find((cls) => cls._id === classId);
    setSections(selectedClass?.sections || []);
    // Reset section if class changed
    handleSelectChange("sectionId", "");
  };

  // Parent info change
  const handleParentChange = (parentType, field, value) => {
    setStudent((prev) => ({
      ...prev,
      parentInfo: {
        ...prev.parentInfo,
        [parentType]: {
          ...prev.parentInfo?.[parentType],
          [field]: value,
        },
      },
    }));
  };

  // Remove profile image
  const removeImage = () => {
    setStudent((prev) => ({ ...prev, profilePic: null }));
    setImagePreview(null);
  };

  // Submit update
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();

      // Append student fields
      const studentFields = ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'gender', 'address', 'classId', 'sectionId'];
      studentFields.forEach(field => {
        if (student[field] !== undefined && student[field] !== null) {
          formData.append(field, student[field]);
        }
      });

      // Append profile picture if changed
      if (student.profilePic instanceof File) {
        formData.append("profilePic", student.profilePic);
      }

      // Append parent info
      if (student.parentInfo) {
        formData.append("parentInfo", JSON.stringify(student.parentInfo));
      }

      await API.put(`/admin/auth/students/updatestudent/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Student updated successfully!");
      navigate(`/admin/student/view/${id}`);
    } catch (err) {
      console.error("Update error:", err);
      toast.error(`Update failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="h-12 w-12 rounded-2xl" />
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          {[1, 2, 3, 4].map((item) => (
            <Card key={item} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((subItem) => (
                    <Skeleton key={subItem} className="h-10 rounded-lg" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
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
      <div className="max-w-4xl mx-auto space-y-6">
        
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
                Edit Student
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Update information for {student.firstName} {student.lastName}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="px-4 py-2 text-sm font-semibold rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
            ID: {student._id?.slice(-8).toUpperCase() || "N/A"}
          </Badge>
        </motion.div>



        {/* Profile Picture */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl">
              <CardHeader className="pb-3 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-t-2xl border-b dark:border-gray-700">
                <CardTitle className="text-lg font-bold flex items-center gap-3 text-gray-900 dark:text-white">
                  <div className="p-2 bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-sm">
                    <VenetianMask className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  Profile Picture
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-2xl border-4 border-white dark:border-gray-800 shadow-2xl overflow-hidden">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Profile preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <User className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full shadow-lg hover:bg-red-700 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div>
                      <Label htmlFor="profilePic" className="text-sm font-medium mb-2 block">
                        Upload New Photo
                      </Label>
                      <div className="flex items-center gap-4">
                        <label
                          htmlFor="profilePic"
                          className="cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                        >
                          <Upload className="h-4 w-4" />
                          Choose Image
                        </label>
                        <input
                          type="file"
                          id="profilePic"
                          name="profilePic"
                          accept="image/*"
                          onChange={handleChange}
                          className="hidden"
                        />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          JPG, PNG or WEBP. Max 5MB.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl">
              <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-t-2xl border-b dark:border-gray-700">
                <CardTitle className="text-lg font-bold flex items-center gap-3 text-gray-900 dark:text-white">
                  <div className="p-2 bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-sm">
                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={student.firstName || ""}
                      onChange={handleChange}
                      className={errors.firstName ? "border-red-500" : ""}
                      required
                    />
                    {errors.firstName && <p className="text-red-500 text-xs">{errors.firstName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={student.lastName || ""}
                      onChange={handleChange}
                      className={errors.lastName ? "border-red-500" : ""}
                      required
                    />
                    {errors.lastName && <p className="text-red-500 text-xs">{errors.lastName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      value={student.email || ""}
                      onChange={handleChange}
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={student.phone || ""}
                      onChange={handleChange}
                      className={errors.phone ? "border-red-500" : ""}
                    />
                    {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="text-sm font-medium flex items-center gap-2">
                      <Cake className="h-4 w-4" />
                      Date of Birth
                    </Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      name="dateOfBirth"
                      value={student.dateOfBirth || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-sm font-medium">Gender</Label>
                    <Select
                      value={student.gender || ""}
                      onValueChange={(val) => handleSelectChange("gender", val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        {genders.map((gender) => (
                          <SelectItem key={gender.value} value={gender.value}>
                            {gender.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="address" className="text-sm font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Address
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      value={student.address || ""}
                      onChange={handleChange}
                      placeholder="Enter full address"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Academic Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl">
              <CardHeader className="pb-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-t-2xl border-b dark:border-gray-700">
                <CardTitle className="text-lg font-bold flex items-center gap-3 text-gray-900 dark:text-white">
                  <div className="p-2 bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-sm">
                    <GraduationCap className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  Academic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="classId" className="text-sm font-medium flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Class
                    </Label>
                    <Select value={student.classId || ""} onValueChange={handleClassChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls._id} value={cls._id}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sectionId" className="text-sm font-medium flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Section
                    </Label>
                    <Select
                      value={student.sectionId || ""}
                      onValueChange={(val) => handleSelectChange("sectionId", val)}
                      disabled={!student.classId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={student.classId ? "Select section" : "Select class first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {sections.map((sec) => (
                          <SelectItem key={sec._id} value={sec._id}>
                            {sec.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!student.classId && (
                      <p className="text-xs text-gray-500">Please select a class first</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Parent Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl">
              <CardHeader className="pb-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-t-2xl border-b dark:border-gray-700">
                <CardTitle className="text-lg font-bold flex items-center gap-3 text-gray-900 dark:text-white">
                  <div className="p-2 bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-sm">
                    <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  Parent Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Father's Information */}
                  <div className="space-y-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-700/50">
                    <h4 className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Father's Information
                    </h4>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label className="text-xs font-medium">Full Name</Label>
                        <Input
                          placeholder="Father's name"
                          value={student.parentInfo?.father?.name || ""}
                          onChange={(e) => handleParentChange("father", "name", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-medium">Email Address</Label>
                        <Input
                          placeholder="father@example.com"
                          type="email"
                          value={student.parentInfo?.father?.email || ""}
                          onChange={(e) => handleParentChange("father", "email", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-medium">Phone Number</Label>
                        <Input
                          placeholder="Phone number"
                          value={student.parentInfo?.father?.phone || ""}
                          onChange={(e) => handleParentChange("father", "phone", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-medium">Occupation</Label>
                        <Input
                          placeholder="Occupation"
                          value={student.parentInfo?.father?.occupation || ""}
                          onChange={(e) => handleParentChange("father", "occupation", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Mother's Information */}
                  <div className="space-y-4 p-4 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-xl border border-pink-200 dark:border-pink-700/50">
                    <h4 className="font-bold text-pink-900 dark:text-pink-300 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Mother's Information
                    </h4>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label className="text-xs font-medium">Full Name</Label>
                        <Input
                          placeholder="Mother's name"
                          value={student.parentInfo?.mother?.name || ""}
                          onChange={(e) => handleParentChange("mother", "name", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-medium">Email Address</Label>
                        <Input
                          placeholder="mother@example.com"
                          type="email"
                          value={student.parentInfo?.mother?.email || ""}
                          onChange={(e) => handleParentChange("mother", "email", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-medium">Phone Number</Label>
                        <Input
                          placeholder="Phone number"
                          value={student.parentInfo?.mother?.phone || ""}
                          onChange={(e) => handleParentChange("mother", "phone", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-medium">Occupation</Label>
                        <Input
                          placeholder="Occupation"
                          value={student.parentInfo?.mother?.occupation || ""}
                          onChange={(e) => handleParentChange("mother", "occupation", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-700"
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              className="rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/admin/student/view/${id}`)}
                className="rounded-xl"
              >
                View Profile
              </Button>
              <Button 
                type="submit" 
                disabled={saving}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? "Saving Changes..." : "Save Changes"}
              </Button>
            </div>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default EditStudent;