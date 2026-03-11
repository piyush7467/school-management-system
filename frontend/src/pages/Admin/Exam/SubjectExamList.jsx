import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "@/api/axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import AddSubjectExamDialog from "@/components/exam/AddSubjectExamDialog";
import EditSubjectExamDialog from "@/components/exam/EditSubjectExamDialog";

const SubjectExamList = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchExam = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/admin/auth/exam/${examId}/get`);
      if (res.data.success) {
        setExam(res.data.exam);
        setSubjects(res.data.exam.subjects || []);
      } else {
        toast.error("Failed to fetch exam");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch exam");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExam();
  }, [examId]);

  const handleEdit = (subExam) => {
    setEditForm(subExam);
    setEditOpen(true);
  };

  const handleDelete = async (subExamId) => {
    if (!window.confirm("Are you sure you want to delete this subject exam?")) return;
    try {
      await API.delete(`/admin/auth/exam/${examId}/subject/${subExamId}/delete`);
      toast.success("Subject exam deleted");
      fetchExam();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete subject exam");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!exam) return <p>Exam not found</p>;

  return (
    <div className="p-6">
      <Button variant="outline" className="mb-4" onClick={() => navigate("/admin/exams")}>
        ← Back to Exams
      </Button>

      <Card className="shadow-lg">
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Subjects for {exam.title}</CardTitle>
          <Button onClick={() => setAddOpen(true)}>+ Add Subject</Button>
        </CardHeader>
        <CardContent>
          {subjects.length === 0 ? (
            <p className="text-gray-500">No subject exams found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">Subject</th>
                    <th className="p-2 border">Max Marks</th>
                    <th className="p-2 border">Passing Marks</th>
                    <th className="p-2 border">Date</th>
                    <th className="p-2 border">Start Time</th>
                    <th className="p-2 border">End Time</th>
                    <th className="p-2 border">Room</th>
                    <th className="p-2 border">Teacher</th>
                    <th className="p-2 border text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((sub) => (
                    <tr key={sub._id} className="hover:bg-gray-50">
                      <td className="p-2 border">{sub.subjectId?.name || "-"}</td>
                      <td className="p-2 border">{sub.maxMarks || "-"}</td>
                      <td className="p-2 border">{sub.passingMarks || "-"}</td>
                      <td className="p-2 border">{sub.date?.slice(0, 10) || "-"}</td>
                      <td className="p-2 border">{sub.startTime || "-"}</td>
                      <td className="p-2 border">{sub.endTime || "-"}</td>
                      <td className="p-2 border">{sub.roomId?.name || "-"}</td>
                      <td className="p-2 border">{sub.teacherId?.name || "-"}</td>
                      <td className="p-2 border flex gap-2 justify-center">
                        <Button size="sm" variant="secondary" onClick={() => handleEdit(sub)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(sub._id)}>
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Subject Exam Dialog */}
      <AddSubjectExamDialog open={addOpen} setOpen={setAddOpen} examId={examId} fetchExam={fetchExam} />

      {/* Edit Subject Exam Dialog */}
      <EditSubjectExamDialog
        open={editOpen}
        setOpen={setEditOpen}
        examId={examId}
        editForm={editForm}
        setEditForm={setEditForm}
        fetchExam={fetchExam}
      />
    </div>
  );
};

export default SubjectExamList;
