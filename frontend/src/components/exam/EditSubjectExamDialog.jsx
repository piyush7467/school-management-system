import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import API from "@/api/axios";
import { toast } from "sonner";

const EditSubjectExamDialog = ({ open, setOpen, examId, editForm, setEditForm, fetchExam }) => {
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);

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

  const handleChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    try {
      await API.put(`/admin/auth/exam/${examId}/subject/${editForm._id}/update`, editForm);
      toast.success("Subject exam updated");
      fetchExam();
      setOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update subject exam");
    }
  };

  if (!editForm) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Subject Exam</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 mt-2">
          <select name="subjectId" value={editForm.subjectId} onChange={handleChange} className="w-full border p-2 rounded">
            <option value="">Select Subject</option>
            {subjects.map((sub) => (
              <option key={sub._id} value={sub._id}>{sub.name}</option>
            ))}
          </select>
          <input type="number" name="maxMarks" placeholder="Max Marks" value={editForm.maxMarks} onChange={handleChange} className="w-full border p-2 rounded" />
          <input type="number" name="passingMarks" placeholder="Passing Marks" value={editForm.passingMarks} onChange={handleChange} className="w-full border p-2 rounded" />
          <input type="date" name="date" value={editForm.date?.slice(0,10)} onChange={handleChange} className="w-full border p-2 rounded" />
          <input type="time" name="startTime" value={editForm.startTime} onChange={handleChange} className="w-full border p-2 rounded" />
          <input type="time" name="endTime" value={editForm.endTime} onChange={handleChange} className="w-full border p-2 rounded" />
          <select name="roomId" value={editForm.roomId} onChange={handleChange} className="w-full border p-2 rounded">
            <option value="">Select Room</option>
            {rooms.map((room) => (
              <option key={room._id} value={room._id}>{room.name}</option>
            ))}
          </select>
          <select name="teacherId" value={editForm.teacherId} onChange={handleChange} className="w-full border p-2 rounded">
            <option value="">Select Teacher</option>
            {teachers.map((t) => (
              <option key={t._id} value={t._id}>{t.name}</option>
            ))}
          </select>
        </div>
        <DialogFooter className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Update</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditSubjectExamDialog;
