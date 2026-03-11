import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import API from "@/api/axios";

const AddExamDialog = ({ open, setOpen, fetchExams }) => {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    examType: "Midterm",
    classId: "",
    sectionId: "",
    startDate: "",
    endDate: "",
  });

  // Fetch classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await API.get("/admin/auth/classes/");
        if (res.data.success) {
          setClasses(res.data.classes || []);
          if (res.data.classes.length) handleClassChange(res.data.classes[0]._id);
        }
      } catch (err) {
        toast.error("Failed to fetch classes");
      }
    };
    fetchClasses();
  }, []);

  const handleClassChange = async (classId) => {
    setForm({ ...form, classId, sectionId: "" });
    try {
      const res = await API.get(`/admin/auth/classes/${classId}/sections`);
      const normalizedSections = (res.data.sections || []).map((sec) => ({
        _id: sec.sectionId,
        name: sec.sectionName,
      }));
      setSections(normalizedSections);
      if (normalizedSections.length) setForm((prev) => ({ ...prev, sectionId: normalizedSections[0]._id }));
    } catch (err) {
      toast.error("Failed to fetch sections");
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await API.post("/admin/auth/exam/create", form);
      if (res.data.success) {
        toast.success("Exam created successfully");
        setOpen(false);
        setForm({ title: "", description: "", examType: "Midterm", classId: "", sectionId: "", startDate: "", endDate: "" });
        fetchExams();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create exam");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Exam</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreateExam} className="space-y-4 mt-2">
          <div>
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <Label>Description</Label>
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <Label>Exam Type</Label>
            <Select value={form.examType} onValueChange={(value) => setForm({ ...form, examType: value })}>
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
              <Select value={form.classId} onValueChange={handleClassChange}>
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
              <Select value={form.sectionId} onValueChange={(value) => setForm({ ...form, sectionId: value })}>
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
              <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
            </div>
            <div>
              <Label>End Date</Label>
              <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Add Exam"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddExamDialog;
