import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "@/api/axios";
import { toast } from "sonner";
import SubjectList from "./SubjectList"; // Reusable component

const SectionView = () => {
  const { id: classId, sectionId } = useParams();
  const [section, setSection] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch section details
  const fetchSection = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/admin/auth/classes/${classId}`);
      const classData = res.data.data;
      const sec = classData.sections.find((s) => s._id === sectionId);

      if (!sec) {
        toast.error("Section not found");
        return;
      }

      setSection(sec);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch section details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSection();
  }, [classId, sectionId]);

  if (loading) return <p>Loading section details...</p>;
  if (!section) return <p>Section not found</p>;

  const { name: sectionName, subjects, classTeacher } = section;

  return (
    <div className="p-4 space-y-6 max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold">
          Class: {section.className} {sectionName && `- Section: ${sectionName}`}
        </h2>
      </div>

      {/* Class Teacher Info */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Class Teacher</h3>
        {classTeacher ? (
          <div className="flex items-center space-x-4">
            <img
              src={classTeacher.profilePic || "/default-avatar.png"}
              alt={classTeacher.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold">{classTeacher.name}</p>
              {classTeacher.email && <p className="text-sm">{classTeacher.email}</p>}
              {classTeacher.phone && <p className="text-sm">{classTeacher.phone}</p>}
            </div>
          </div>
        ) : (
          <p>No class teacher assigned</p>
        )}
      </div>

      {/* Subjects Table */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Subjects</h3>
        <SubjectList subjects={subjects} />
      </div>
    </div>
  );
};

export default SectionView;
