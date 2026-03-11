import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import API from "@/api/axios";
import { toast } from "sonner";

const AddSubjectExamDialog = ({ open, setOpen, examId, fetchExam }) => {
  const [form, setForm] = useState({
    subjectId: "",
    maxMarks: "",
    passingMarks: "",
    date: "",
    startTime: "",
    endTime: "",
    roomId: "",
    teacherId: "",
  });

  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);

  // Fetch dropdown data
  const fetchDropdowns = async () => {
    try {
      const [subRes, teacherRes, roomRes] = await Promise.all([
        API.get("/admin/auth/getallsubjects"),
        API.get("/admin/auth/teachers/viewteacher"),
        API.get("/admin/auth/room/getall"),
      ]);
      setSubjects(subRes.data.subjects || []);
      setTeachers(teacherRes.data.teachers || []);
      setRooms(roomRes.data.rooms || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch dropdown data");
    }
  };

  useEffect(() => {
    if (open) fetchDropdowns();
  }, [open]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    try {
      await API.post(`/admin/auth/exam/${examId}/subject/add`, form);
      toast.success("Subject exam added");
      fetchExam();
      setOpen(false);
      setForm({
        subjectId: "",
        maxMarks: "",
        passingMarks: "",
        date: "",
        startTime: "",
        endTime: "",
        roomId: "",
        teacherId: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add subject exam");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Subject Exam</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 mt-2">
          <select name="subjectId" value={form.subjectId} onChange={handleChange} className="w-full border p-2 rounded">
            <option value="">Select Subject</option>
            {subjects.map((sub) => (
              <option key={sub._id} value={sub._id}>{sub.name}</option>
            ))}
          </select>
          <input type="number" name="maxMarks" placeholder="Max Marks" value={form.maxMarks} onChange={handleChange} className="w-full border p-2 rounded" />
          <input type="number" name="passingMarks" placeholder="Passing Marks" value={form.passingMarks} onChange={handleChange} className="w-full border p-2 rounded" />
          <input type="date" name="date" value={form.date} onChange={handleChange} className="w-full border p-2 rounded" />
          <input type="time" name="startTime" value={form.startTime} onChange={handleChange} className="w-full border p-2 rounded" />
          <input type="time" name="endTime" value={form.endTime} onChange={handleChange} className="w-full border p-2 rounded" />
          <select name="roomId" value={form.roomId} onChange={handleChange} className="w-full border p-2 rounded">
            <option value="">Select Room</option>
            {rooms.map((room) => (
              <option key={room._id} value={room._id}>{room.name}</option>
            ))}
          </select>
          <select name="teacherId" value={form.teacherId} onChange={handleChange} className="w-full border p-2 rounded">
            <option value="">Select Teacher</option>
            {teachers.map((t) => (
              <option key={t._id} value={t._id}>{t.name}</option>
            ))}
          </select>
        </div>
        <DialogFooter className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddSubjectExamDialog;
