import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "@/api/axios";
import { toast } from "sonner";
import { ArrowLeft, Upload, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const EditTeacher = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);

  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    username: "",
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
    class: "",
    section: ""
  });

  // Fetch classes and subjects
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get("/admin/auth/classes"); // classes with sections
        setClasses(res.data.classes || []);

        const subRes = await API.get("/admin/auth/getallsubjects");
        setSubjects(subRes.data.subjects || []);
      } catch (err) {
        toast.error("Failed to fetch data");
      }
    };
    fetchData();
  }, []);

  // Fetch teacher data
  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        setFetchLoading(true);
        const res = await API.get(`/admin/auth/teachers/teacher/${id}`);
        const teacher = res.data.teacher;

        // Prefill form
        setFormData(prev => ({
          ...prev,
          name: teacher.name || "",
          username: teacher.username || "",
          email: teacher.email || "",
          phone: teacher.phone || "",
          address: teacher.address || "",
          employeeId: teacher.employeeId || "",
          qualification: teacher.qualification || "",
          experience: teacher.experience || "",
          gender: teacher.gender || "",
          dob: teacher.dob ? teacher.dob.split("T")[0] : "",
          emergencyContact: teacher.emergencyContact || "",
          aadharNo: teacher.aadharNo || "",
          joiningDate: teacher.joiningDate ? teacher.joiningDate.split("T")[0] : "",
          status: teacher.status || "active",
          subjects: teacher.subjects?.map(sub => sub._id) || [],
          class: teacher.classSections?.[0]?.class?._id || "",
          section: teacher.classSections?.[0]?.section?._id || ""
        }));

        // Prefill sections based on selected class
        if (teacher.classSections?.[0]?.class) {
          const selectedClass = classes.find(c => c._id === teacher.classSections[0].class._id);
          setSections(selectedClass?.sections || []);
        }

        setImagePreview(teacher.profilePic || null);
      } catch (err) {
        toast.error("Failed to fetch teacher data");
      } finally {
        setFetchLoading(false);
      }
    };
    fetchTeacher();
  }, [id, classes]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profilePic" && files && files[0]) {
      const file = files[0];
      setFormData(prev => ({ ...prev, [name]: file }));
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === "class") {
      const selectedClass = classes.find(c => c._id === value);
      setSections(selectedClass?.sections || []);
      setFormData(prev => ({ ...prev, section: "" }));
    }
  };

  const toggleSubject = (subjectId) => {
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

    if (!formData.class || !formData.section) {
      toast.error("Please select class and section");
      return;
    }

    setLoading(true);

    try {
      const payload = { ...formData };

      // Convert class & section to classSections array
      payload.classSections = [{ class: formData.class, section: formData.section }];
      delete payload.class;
      delete payload.section;

      const data = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (key === "subjects" || key === "classSections") {
          data.append(key, JSON.stringify(value));
        } else {
          data.append(key, value);
        }
      });

      await API.put(`/admin/auth/teachers/updateteacher/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Teacher updated successfully!");
      navigate("/admin/teachers");
    } catch (err) {
      console.log('error:',err);
      
      toast.error(err.response?.data?.message || "Failed to update teacher");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading teacher data...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-4 lg:p-6 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => navigate(-1)}><ArrowLeft /></Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Teacher</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile & Image */}
          <Card className="p-6">
            <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
            <CardContent className="flex items-center gap-6">
              <div className="relative w-32 h-32 rounded-xl border-4 border-white dark:border-gray-800 shadow-lg overflow-hidden">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-12 w-12 text-gray-400 dark:text-gray-500 m-auto" />
                )}
                <label htmlFor="profilePic" className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer">
                  <Upload className="w-4 h-4" />
                </label>
                <input type="file" name="profilePic" id="profilePic" className="hidden" onChange={handleChange} />
              </div>
              <div className="flex-1 space-y-3">
                <Input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
                <Input name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
                <Input name="password" type="password" placeholder="New Password" value={formData.password} onChange={handleChange} />
                <Input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} />
              </div>
            </CardContent>
          </Card>

          {/* Class & Section */}
          <Card className="p-6">
            <CardHeader><CardTitle>Class & Section</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Class</Label>
                <Select value={formData.class} onValueChange={v => handleSelectChange("class", v)}>
                  <SelectTrigger placeholder="Select Class"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {classes.map(cls => <SelectItem key={cls._id} value={cls._id}>{cls.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Section</Label>
                <Select value={formData.section} onValueChange={v => handleSelectChange("section", v)}>
                  <SelectTrigger placeholder="Select Section"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {sections.map(sec => <SelectItem key={sec._id} value={sec._id}>{sec.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Subjects */}
          <Card className="p-6">
            <CardHeader><CardTitle>Subjects</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2 mt-2">
              {subjects.map(sub => (
                <Button
                  key={sub._id}
                  type="button"
                  variant={formData.subjects.includes(sub._id) ? "secondary" : "outline"}
                  onClick={() => toggleSubject(sub._id)}
                >
                  {sub.name}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Other Info */}
          <Card className="p-6">
            <CardHeader><CardTitle>Details</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} />
              <Textarea name="address" placeholder="Address" value={formData.address} onChange={handleChange} />
              <Input name="employeeId" placeholder="Employee ID" value={formData.employeeId} onChange={handleChange} />
              <Input name="qualification" placeholder="Qualification" value={formData.qualification} onChange={handleChange} />
              <Input name="experience" type="number" placeholder="Experience" value={formData.experience} onChange={handleChange} />
              <Input name="aadharNo" placeholder="Aadhar Number" value={formData.aadharNo} onChange={handleChange} />
              <Input name="joiningDate" type="date" placeholder="Joining Date" value={formData.joiningDate} onChange={handleChange} />
              <Select value={formData.gender} onValueChange={v => setFormData(prev => ({ ...prev, gender: v }))}>
                <SelectTrigger placeholder="Select Gender"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Input name="dob" type="date" value={formData.dob} onChange={handleChange} />
              <Input name="emergencyContact" placeholder="Emergency Contact" value={formData.emergencyContact} onChange={handleChange} />
              <Select value={formData.status} onValueChange={v => setFormData(prev => ({ ...prev, status: v }))}>
                <SelectTrigger placeholder="Select Status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Button type="submit" disabled={loading}>{loading ? "Updating..." : "Update Teacher"}</Button>
        </form>
      </div>
    </div>
  );
};

export default EditTeacher;
