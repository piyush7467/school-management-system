import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "@/api/axios";
import { toast } from "sonner";
import { ArrowLeft, Upload, User, Shield, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const CreateStudent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [classes, setClasses] = useState([]);
  // const [sections, setSections] = useState([]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    class: "",
    // section: "",
    rollNumber: "",
    gender: "",
    dateOfBirth: "",
    phone: "",
    profilePic: null,
    status: "active",
    parentInfo: {
      father: { name: "", email: "", phone: "" },
      mother: { name: "", email: "", phone: "" },
    },
  });

  // Fetch all classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await API.get("/admin/auth/classes/");
        setClasses(res.data.classes);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch classes");
      }
    };
    fetchClasses();
  }, []);

  // Update sections when class changes
  // useEffect(() => {
  //   if (formData.class) {
  //     const selectedClass = classes.find(cls => cls._id === formData.class);
  //     setSections(selectedClass?.sections || []);
  //     setFormData(prev => ({ ...prev, section: "" })); // reset section
  //   } else {
  //     setSections([]);
  //     setFormData(prev => ({ ...prev, section: "" }));
  //   }
  // }, [formData.class, classes]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, files, dataset } = e.target;

    if (name === "profilePic" && files && files[0]) {
      const file = files[0];
      setFormData(prev => ({ ...prev, [name]: file }));
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    } else if (dataset.parent) {
      setFormData(prev => ({
        ...prev,
        parentInfo: {
          ...prev.parentInfo,
          [dataset.parent]: {
            ...prev.parentInfo[dataset.parent],
            [name]: value
          }
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== "") {
          if (key === "parentInfo") {
            data.append(key, JSON.stringify(value));
          } else {
            data.append(key, value);
          }
        }
      });

      await API.post("/admin/auth/students/createstudent", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      toast.success("Student created successfully! 🎉");
      navigate("/admin/students");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create student");
    } finally {
      setLoading(false);
    }
  };

  const requiredFields = ["firstName", "lastName", "username", "password", "class",  "rollNumber"];
  const filledFields = Object.keys(formData).filter(key => formData[key] && formData[key] !== "").length;
  const progress = Math.round((filledFields / Object.keys(formData).length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 lg:p-6 text-gray-900 dark:text-gray-100">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Create New Student
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Add a new student to your institution</p>
            </div>
          </div>
          <Badge>{`Progress: ${progress}%`}</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-2">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <User className="h-12 w-12 text-gray-400 dark:text-gray-300 mx-auto mt-10" />
                  )}
                  <label htmlFor="profilePic" className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-2 rounded-full cursor-pointer">
                    <Upload className="h-4 w-4" />
                  </label>
                  <input id="profilePic" name="profilePic" type="file" accept="image/*" onChange={handleChange} className="hidden" />
                </div>
                <p>{formData.firstName || "New Student"}</p>
                <p className="text-xs text-gray-400">@{formData.username || "username"}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Required Fields</CardTitle>
              </CardHeader>
              <CardContent>
                {requiredFields.map(field => (
                  <div key={field} className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${formData[field] ? 'bg-green-500' : 'bg-red-400'}`}></div>
                    <span>{field}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {["firstName","lastName","username","password","email","phone","rollNumber"].map(field => (
                    <div key={field}>
                      <Label>{field}</Label>
                      <Input name={field} value={formData[field]} onChange={handleChange} />
                    </div>
                  ))}

                  <div>
                    <Label>Date of birth</Label>
                    <Input type='date'
                    name='dateOfBirth'
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    
                    />
                  </div>

                  {/* Class */}
                  <div>
                    <Label>Class</Label>
                    <Select value={formData.class} onValueChange={(val)=>setFormData(prev=>({...prev, class: val}))}>
                      <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
                      <SelectContent>
                        {classes.map(cls => (
                          <SelectItem key={cls._id} value={cls._id}>{cls.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Section */}
                  {/* <div>
                    <Label>Section</Label>
                    <Select value={formData.section} onValueChange={(val)=>setFormData(prev=>({...prev, section: val}))} disabled={!formData.class}>
                      <SelectTrigger><SelectValue placeholder="Select Section" /></SelectTrigger>
                      <SelectContent>
                        {sections.map(sec => (
                          <SelectItem key={sec._id} value={sec._id}>{sec.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div> */}

                  {/* Gender */}
                  <div>
                    <Label>Gender</Label>
                    <Select value={formData.gender} onValueChange={(val)=>setFormData(prev=>({...prev, gender: val}))}>
                      <SelectTrigger><SelectValue placeholder="Select Gender" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Parent Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Parent Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {["father","mother"].map(parent=>(
                    <div key={parent}>
                      <h3 className="capitalize">{parent}</h3>
                      <Input name="name" data-parent={parent} value={formData.parentInfo[parent].name} onChange={handleChange} placeholder="Name" />
                      <Input name="email" data-parent={parent} value={formData.parentInfo[parent].email} onChange={handleChange} placeholder="Email" className="mt-2"/>
                      <Input name="phone" data-parent={parent} value={formData.parentInfo[parent].phone} onChange={handleChange} placeholder="Phone" className="mt-2"/>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardContent className="flex justify-end gap-3">
                  <Button type="button" onClick={()=>navigate(-1)}><X /> Cancel</Button>
                  <Button type="submit" disabled={loading}>{loading ? "Creating..." : <><Save /> Create</>}</Button>
                </CardContent>
              </Card>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateStudent;
