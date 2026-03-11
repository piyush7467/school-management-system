import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import API from "@/api/axios";
import { toast } from "sonner";

const AssignStudentModal = ({ routes, onAssignmentAdded }) => {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ studentId: "", routeId: "", busId: "", stop: "", pickupTime: "" });
  const [buses, setBuses] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await API.get("/admin/auth/students/getstudent");
        setStudents(res.data.students || []);
      } catch (err) { toast.error("Failed to fetch students"); }
    };
    fetchStudents();
  }, []);

  useEffect(() => {
    const fetchBuses = async () => {
      if (!form.routeId) return setBuses([]);
      try {
        const res = await API.get("/admin/auth/transport/bus/all");
        setBuses(res.data.buses?.filter(b => b.route === form.routeId) || []);
      } catch (err) { toast.error("Failed to fetch buses"); }
    };
    fetchBuses();
  }, [form.routeId]);

  const handleSubmit = async () => {
    if (!form.studentId || !form.busId || !form.stop || !form.pickupTime) return toast.error("All fields required");
    try {
      setSubmitting(true);
      const res = await API.post("/admin/auth/transport/assign", form);
      onAssignmentAdded(res.data.assignment);
      toast.success("Student assigned successfully!");
      setForm({ studentId: "", routeId: "", busId: "", stop: "", pickupTime: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to assign student");
    } finally { setSubmitting(false); }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2"><Plus /> Assign Student</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>Assign Student to Bus</DialogTitle></DialogHeader>
        <div className="space-y-3 mt-2">
          <select className="w-full border p-2 rounded" value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })}>
            <option value="">Select Student</option>
            {students.map(s => <option key={s._id} value={s._id}>{s.firstName} {s.lastName}</option>)}
          </select>

          <select className="w-full border p-2 rounded" value={form.routeId} onChange={e => setForm({ ...form, routeId: e.target.value, busId: "" })}>
            <option value="">Select Route</option>
            {routes.map(r => <option key={r._id} value={r._id}>{r.routeName}</option>)}
          </select>

          <select className="w-full border p-2 rounded" value={form.busId} onChange={e => setForm({ ...form, busId: e.target.value })}>
            <option value="">Select Bus</option>
            {buses.map(b => <option key={b._id} value={b._id}>{b.busNumber} - {b.driverName}</option>)}
          </select>

          <Input placeholder="Stop" value={form.stop} onChange={e => setForm({ ...form, stop: e.target.value })} />
          <Input placeholder="Pickup Time" value={form.pickupTime} onChange={e => setForm({ ...form, pickupTime: e.target.value })} />
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={submitting}>{submitting ? "Assigning..." : "Assign Student"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignStudentModal;
