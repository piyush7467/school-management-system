import React, { useEffect, useState } from "react";
import API from "@/api/axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import AddExamDialog from "@/components/exam/AddExamDialog";
import EditExamDialog from "@/components/exam/EditExamDialog";
import { useNavigate } from "react-router-dom";

// Import modular dialogs

const ExamList = () => {
  const [exams, setExams] = useState([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [viewExam, setViewExam] = useState(null);
  const navigate = useNavigate();

  // Fetch all exams
  const fetchExams = async () => {
    try {
      const res = await API.get("/admin/auth/exam/getall");
      if (res.data.success) setExams(res.data.exams);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch exams");
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  // Edit exam
  const handleEdit = (exam) => {
    setEditForm({
      ...exam,
      classId: exam.assignments?.[0]?.classId?._id || "",
      sectionId: exam.assignments?.[0]?.sectionId?._id || "",
    });
    setEditOpen(true);
  };

  // View exam
  const handleView = (id) => {
    const exam = exams.find((e) => e._id === id);
    setViewExam(exam);
    setViewOpen(true);
  };

  // Delete exam
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this exam?")) return;
    try {
      await API.delete(`/admin/auth/exam/${id}/delete`);
      toast.success("Exam deleted");
      fetchExams();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  // Publish / Unpublish
  const togglePublish = async (exam) => {
    try {
      const res = await API.put(`/admin/auth/exam/${exam._id}/publish`);
      toast.success(res.data.message || "Updated");
      fetchExams();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update publish status");
    }
  };

  return (
    <div className="p-6">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Exams</CardTitle>
          <Button onClick={() => setOpen(true)}>+ Add Exam</Button>
        </CardHeader>
        <CardContent>
          {exams.length === 0 ? (
            <p className="text-gray-500">No exams found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border text-sm">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="p-2 border">Title</th>
                    <th className="p-2 border">Type</th>
                    <th className="p-2 border">Class</th>
                    <th className="p-2 border">Section</th>
                    <th className="p-2 border">Start</th>
                    <th className="p-2 border">End</th>
                    <th className="p-2 border text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {exams.map((ex) => (
                    <tr key={ex._id} className="hover:bg-gray-50">
                      <td className="p-2 border">{ex.title}</td>
                      <td className="p-2 border">{ex.examType}</td>
                      <td className="p-2 border">{ex.assignments?.[0]?.classId?.name || "-"}</td>
                      <td className="p-2 border">{ex.assignments?.[0]?.sectionId?.name || "-"}</td>
                      <td className="p-2 border">{ex.startDate?.slice(0, 10)}</td>
                      <td className="p-2 border">{ex.endDate?.slice(0, 10)}</td>
                      <td className="p-2 border text-center flex gap-2 justify-center">
                        <Button size="sm" variant="outline" onClick={() => handleView(ex._id)}>View</Button>
                        <Button size="sm" variant="secondary" onClick={() => handleEdit(ex)}>Edit</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(ex._id)}>Delete</Button>
                        <Button
                          size="sm"
                          variant={ex.isPublished ? "success" : "warning"}
                          onClick={() => togglePublish(ex)}
                        >
                          {ex.isPublished ? "Unpublish" : "Publish"}
                        </Button>

                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => navigate(`${ex._id}/manage-exam`)}
                        >
                          Manage Exam
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

      {/* Add Exam Dialog */}
      <AddExamDialog
        open={open}
        setOpen={setOpen}
        fetchExams={fetchExams}
      />

      {/* Edit Exam Dialog */}
      <EditExamDialog
        editOpen={editOpen}
        setEditOpen={setEditOpen}
        editForm={editForm}
        setEditForm={setEditForm}
        fetchExams={fetchExams}
      />

      {/* View Exam Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Exam Details</DialogTitle>
          </DialogHeader>
          {viewExam && (
            <div className="space-y-2 mt-2">
              <p><strong>Title:</strong> {viewExam.title}</p>
              <p><strong>Description:</strong> {viewExam.description}</p>
              <p><strong>Type:</strong> {viewExam.examType}</p>
              <p><strong>Class:</strong> {viewExam.assignments?.[0]?.classId?.name || "-"}</p>
              <p><strong>Section:</strong> {viewExam.assignments?.[0]?.sectionId?.name || "-"}</p>
              <p><strong>Start:</strong> {viewExam.startDate?.slice(0, 10)}</p>
              <p><strong>End:</strong> {viewExam.endDate?.slice(0, 10)}</p>
              <p><strong>Published:</strong> {viewExam.isPublished ? "Yes" : "No"}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExamList;
