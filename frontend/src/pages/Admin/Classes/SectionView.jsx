import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "@/api/axios";
import { toast } from "sonner";

const SectionView = () => {
  const { id: classId, sectionId } = useParams();
  const [section, setSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [removingStudent, setRemovingStudent] = useState(null);

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

  // Remove student handler
  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm("Are you sure you want to remove this student from the section?")) return;
    setRemovingStudent(studentId);
    try {
      const res = await API.delete(`/admin/auth/classes/sections/${sectionId}/students/${studentId}`);
      toast.success(res.data.message);
      fetchSection(); // Refresh section data
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to remove student");
    } finally {
      setRemovingStudent(null);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!section) return <p>Section not found</p>;

  const totalSubjects = section.subjects.length;
  const totalStudents = section.students.length;
  const uniqueTeachers = [...new Map(section.subjects.flatMap(s => s.teachers).map(t => [t._id, t])).values()];

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold mb-4">Section: {section.name}</h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 border rounded shadow text-center">
          <h3 className="font-semibold">Subjects</h3>
          <p className="text-xl">{totalSubjects}</p>
        </div>
        <div className="p-4 border rounded shadow text-center">
          <h3 className="font-semibold">Teachers</h3>
          <p className="text-xl">{uniqueTeachers.length}</p>
        </div>
        <div className="p-4 border rounded shadow text-center">
          <h3 className="font-semibold">Students</h3>
          <p className="text-xl">{totalStudents}</p>
        </div>
      </div>

      {/* Subjects Table */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Subjects</h3>
        {totalSubjects === 0 ? (
          <p>No subjects added yet.</p>
        ) : (
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2 text-left">Subject</th>
                <th className="border px-4 py-2 text-left">Teachers Assigned</th>
              </tr>
            </thead>
            <tbody>
              {section.subjects.map((sub) => (
                <tr key={sub._id}>
                  <td className="border px-4 py-2">{sub.subjectName}</td>
                  <td className="border px-4 py-2">
                    {sub.teachers.length > 0
                      ? sub.teachers.map((t) => t.name).join(", ")
                      : "No teachers assigned"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Teachers Table */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Teachers</h3>
        {uniqueTeachers.length === 0 ? (
          <p>No teachers assigned yet.</p>
        ) : (
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2 text-left">#</th>
                <th className="border px-4 py-2 text-left">Teacher Name</th>
                <th className="border px-4 py-2 text-left">Email</th>
              </tr>
            </thead>
            <tbody>
              {uniqueTeachers.map((t, idx) => (
                <tr key={t._id || idx}>
                  <td className="border px-4 py-2">{idx + 1}</td>
                  <td className="border px-4 py-2">{t.name}</td>
                  <td className="border px-4 py-2">{t.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Students Table */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Students</h3>
        {totalStudents === 0 ? (
          <p>No students assigned yet.</p>
        ) : (
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2 text-left">#</th>
                <th className="border px-4 py-2 text-left">Student Name</th>
                <th className="border px-4 py-2 text-left">Username</th>
                <th className="border px-4 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {section.students.map((s, idx) => (
                <tr key={s._id || idx}>
                  <td className="border px-4 py-2">{idx + 1}</td>
                  <td className="border px-4 py-2">{s.firstName} {s.lastName || ""}</td>
                  <td className="border px-4 py-2">{s.username}</td>
                  <td className="border px-4 py-2">
                    <button
                      onClick={() => handleRemoveStudent(s._id)}
                      disabled={removingStudent === s._id}
                      className="px-3 py-1 text-sm rounded bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
                    >
                      {removingStudent === s._id ? "Removing..." : "Remove"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SectionView;
