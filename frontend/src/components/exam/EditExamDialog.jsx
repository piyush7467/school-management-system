import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import API from "@/api/axios";

const EditExamDialog = ({ editOpen, setEditOpen, editForm, setEditForm, fetchExams }) => {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await API.get("/admin/auth/classes/");
        if (res.data.success) setClasses(res.data.classes || []);
      } catch (err) {
        toast.error("Failed to fetch classes");
      }
    };
    fetchClasses();
  }, []);

  const handleClassChange = async (classId) => {
    setEditForm({ ...editForm, classId, sectionId: "" });
    try {
      const res = await API.get(`/admin/auth/classes/${classId}/sections`);
      const normalizedSections = (res.data.sections || []).map((sec) => ({
        _id: sec.sectionId,
        name: sec.sectionName,
      }));
      setSections(normalizedSections);
      if (normalizedSections.length) setEditForm((prev) => ({ ...prev, sectionId: normalizedSections[0]._id }));
    } catch (err) {
      toast.error("Failed to fetch sections");
    }
  };

  const handleUpdateExam = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await API.put(`/admin/auth/exam/${editForm._id}/update`, {
        title: editForm.title,
        description: editForm.description,
        examType: editForm.examType,
        startDate: editForm.startDate,
        endDate: editForm.endDate,
        assignments: [{ classId: editForm.classId, sectionId: editForm.sectionId }],
      });
      toast.success("Exam updated successfully");
      setEditOpen(false);
      fetchExams();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update exam");
    } finally {
      setLoading(false);
    }
  };

  if (!editForm) return null;

  return (
    <Dialog open={editOpen} onOpenChange={setEditOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Exam</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleUpdateExam} className="space-y-4 mt-2">
          <div>
            <Label>Title</Label>
            <Input
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Description</Label>
            <Input
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            />
          </div>
          <div>
            <Label>Exam Type</Label>
            <Select value={editForm.examType} onValueChange={(value) => setEditForm({ ...editForm, examType: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Unit Test">Unit Test</SelectItem>
                <SelectItem value="Midterm">Midterm</SelectItem>
                <SelectItem value="Final">Final</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Class</Label>
              <Select value={editForm.classId} onValueChange={handleClassChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls._id} value={cls._id}>{cls.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Section</Label>
              <Select value={editForm.sectionId} onValueChange={(value) => setEditForm({ ...editForm, sectionId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((sec) => (
                    <SelectItem key={sec._id} value={sec._id}>{sec.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={editForm.startDate?.slice(0, 10)}
                onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={editForm.endDate?.slice(0, 10)}
                onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>{loading ? "Updating..." : "Update Exam"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditExamDialog;
