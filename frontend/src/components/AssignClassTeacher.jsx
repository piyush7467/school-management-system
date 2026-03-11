import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import API from "@/api/axios";
import { Link } from "react-router-dom";
import { UserPlus } from "lucide-react";

const AssignClassTeacher = () => {
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);

  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch all teachers
  const fetchTeachers = async () => {
    try {
      const res = await API.get("/admin/auth/teachers/viewteacher"); // endpoint to get teachers
      setTeachers(res.data.teachers || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch teachers");
    }
  };

  // Fetch all classes
  const fetchClasses = async () => {
    try {
      const res = await API.get("/admin/auth/classes/"); // endpoint to get classes
      setClasses(res.data.classes || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch classes");
    }
  };

  // Fetch sections for selected class
//   useEffect(() => {
//     if (!selectedClass) return;

//     const fetchSections = async () => {
//       try {
//         const res = await API.get(`/admin/auth/classes/${selectedClass}/sections`);
//         setSections(res.data.sections || []);
//       } catch (err) {
//         console.error(err);
//         toast.error("Failed to fetch sections");
//       }
//     };

//     fetchSections();
//   }, [selectedClass]);

// Fetch sections whenever class changes
    useEffect(() => {
        if (!selectedClass) return;

        const fetchSections = async () => {
            try {
                setLoading(true);
                const res = await API.get(`/admin/auth/classes/${selectedClass}/sections`);

                // Normalize API response for frontend (_id and name)
                const normalizedSections = (res.data.sections || []).map(sec => ({
                    _id: sec.sectionId,    // map sectionId to _id
                    name: sec.sectionName  // map sectionName to name
                }));

                setSections(normalizedSections);

                if (normalizedSections.length) setSelectedSection(normalizedSections[0]._id);
                else setSelectedSection(""); // reset if no sections
            } catch (err) {
                console.error(err);
                toast.error("Error fetching sections");
            } finally {
                setLoading(false);
            }
        };

        fetchSections();
    }, [selectedClass]);

  useEffect(() => {
    fetchTeachers();
    fetchClasses();
  }, []);

  // Assign teacher
  const assignTeacher = async () => {
    if (!selectedTeacher || !selectedClass || !selectedSection) {
      return toast.error("Please select teacher, class, and section");
    }

    try {
      setLoading(true);
      await API.post("/admin/auth/assign-class-teacher", {
        teacherId: selectedTeacher,
        classId: selectedClass,
        sectionId: selectedSection,
      });
      toast.success("Teacher assigned successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to assign teacher");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="bg-white/80 dark:bg-gray-800/80 shadow-xl rounded-2xl border-0">
        <CardHeader>
          <CardTitle>Assign Class Teacher</CardTitle>
          <CardDescription>
            Select a teacher and assign them to a class and section
          </CardDescription>
        </CardHeader>
        <Link to ='/admin/teachers/manage-class-teacher'><Button

              className="cursor-pointer flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 text-white"
            >
              <UserPlus className="h-4 w-4" />
              Manage Class Teacher 
              
            </Button></Link>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Teacher</Label>
            <select
              className="w-full p-2 rounded-xl border-2 border-gray-200 dark:border-gray-600"
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
            >
              <option value="">Select Teacher</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} ({t.email})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Class</Label>
            <select
              className="w-full p-2 rounded-xl border-2 border-gray-200 dark:border-gray-600"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Section</Label>
            <select
              className="w-full p-2 rounded-xl border-2 border-gray-200 dark:border-gray-600"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
            >
              <option value="">Select Section</option>
              {sections.map((sec) => (
                <option key={sec._id} value={sec._id}>
                  {sec.name}
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={assignTeacher}
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-xl mt-2"
          >
            {loading ? "Assigning..." : "Assign Teacher"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignClassTeacher;
