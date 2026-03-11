import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "@/api/axios";
import { toast } from "sonner";
import { ArrowLeft, Upload, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const CreateTeacher = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [subjects, setSubjects] = useState([]);

  const [formData, setFormData] = useState({
    username: "",
    name: "",
    password: "",
    email: "",
    phone: "",
    address: "",
    employeeId: "",
    qualification: "",
    experience: "",
    gender: "",
    dob: "",
    emergencyContact: "",
    aadharNo: "",
    joiningDate: "",
    profilePic: null,
    status: "active",
    subjects: [],
  });

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await API.get("/admin/auth/getallsubjects");
        setSubjects(res.data.subjects || []);
      } catch (err) {
        console.error(err);
        toast.error(`Error fetching subjects: ${err.response?.data?.message || err.message}`);
      }
    };
    fetchSubjects();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profilePic" && files && files[0]) {
      const file = files[0];
      setFormData(prev => ({ ...prev, profilePic: file }));
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubjectsChange = (subjectId) => {
    setFormData(prev => {
      const exists = prev.subjects.includes(subjectId);
      return {
        ...prev,
        subjects: exists ? prev.subjects.filter(id => id !== subjectId) : [...prev.subjects, subjectId]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.subjects.length === 0) {
      toast.error("Please select at least one subject");
      return;
    }
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "subjects") data.append(key, JSON.stringify(value));
        else if (value !== null && value !== "") data.append(key, value);
      });
      await API.post("/admin/auth/teachers/createteacher", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("Teacher created successfully! 🎉");
      navigate("/admin/teachers");
    } catch (err) {
      console.error(err);
      toast.error(`Error creating teacher: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 lg:p-6 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Teacher</h1>
            <p className="text-gray-600 dark:text-gray-400">Add a new teacher to the system</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture Card */}
          <Card className="border-0 shadow-lg dark:shadow-slate-800/50">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-lg">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <Label htmlFor="profilePic" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Profile Picture
                  </Label>
                  <div className="mt-2 flex items-center gap-3">
                    <label htmlFor="profilePic" className="cursor-pointer">
                      <Button type="button" variant="outline" className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Upload Image
                      </Button>
                      <input
                        id="profilePic"
                        name="profilePic"
                        type="file"
                        accept="image/*"
                        onChange={handleChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">JPG, PNG or WEBP. Max 2MB.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Info Card */}
          <Card className="border-0 shadow-lg dark:shadow-slate-800/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">Full Name *</Label>
                  <Input id="name" name="name" placeholder="Enter full name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">Username *</Label>
                  <Input id="username" name="username" placeholder="Enter username" value={formData.username} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Password *</Label>
                  <Input id="password" name="password" type="password" placeholder="Enter password" value={formData.password} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="Enter email" value={formData.email} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">Phone</Label>
                  <Input id="phone" name="phone" placeholder="Enter phone number" value={formData.phone} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm font-medium">Gender</Label>
                  <Select value={formData.gender} onValueChange={value => setFormData(prev => ({ ...prev, gender: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob" className="text-sm font-medium">Date of Birth</Label>
                  <Input id="dob" name="dob" type="date" value={formData.dob} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employeeId" className="text-sm font-medium">Employee ID</Label>
                  <Input id="employeeId" name="employeeId" placeholder="Enter employee ID" value={formData.employeeId} onChange={handleChange} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Details Card */}
          <Card className="border-0 shadow-lg dark:shadow-slate-800/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <div className="w-2 h-6 bg-green-600 rounded-full"></div>
                Professional Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="qualification" className="text-sm font-medium">Qualification</Label>
                  <Input id="qualification" name="qualification" placeholder="Enter qualification" value={formData.qualification} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience" className="text-sm font-medium">Experience (years)</Label>
                  <Input id="experience" name="experience" type="number" placeholder="Enter years of experience" value={formData.experience} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="joiningDate" className="text-sm font-medium">Joining Date *</Label>
                  <Input id="joiningDate" name="joiningDate" type="date" value={formData.joiningDate} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium">Address</Label>
                  <Input id="address" name="address" placeholder="Enter address" value={formData.address} onChange={handleChange} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information Card */}
          <Card className="border-0 shadow-lg dark:shadow-slate-800/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <div className="w-2 h-6 bg-purple-600 rounded-full"></div>
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact" className="text-sm font-medium">Emergency Contact</Label>
                  <Input id="emergencyContact" name="emergencyContact" placeholder="Enter emergency contact" value={formData.emergencyContact} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aadharNo" className="text-sm font-medium">Aadhar Number</Label>
                  <Input id="aadharNo" name="aadharNo" placeholder="Enter Aadhar number" value={formData.aadharNo} onChange={handleChange} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subjects Card */}
          <Card className="border-0 shadow-lg dark:shadow-slate-800/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <div className="w-2 h-6 bg-orange-600 rounded-full"></div>
                Assigned Subjects *
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">Select subjects this teacher will teach</p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {subjects.map(sub => (
                  <Button
                    key={sub._id}
                    type="button"
                    variant={formData.subjects.includes(sub._id) ? "default" : "outline"}
                    className={`rounded-full transition-all duration-200 ${
                      formData.subjects.includes(sub._id) 
                        ? "bg-blue-600 hover:bg-blue-700 text-white" 
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    onClick={() => handleSubjectsChange(sub._id)}
                  >
                    {sub.name}
                  </Button>
                ))}
              </div>
              {formData.subjects.length === 0 && (
                <p className="text-sm text-red-500 mt-3">Please select at least one subject</p>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-lg transition-colors duration-200"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </div>
              ) : (
                "Create Teacher"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTeacher;