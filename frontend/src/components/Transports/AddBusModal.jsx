import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import API from "@/api/axios";
import { toast } from "sonner";

const AddBusModal = ({ routes, onBusAdded }) => {
  const [busForm, setBusForm] = useState({ busNumber: "", capacity: "", driverName: "", driverPhone: "", route: "", busType: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!busForm.busNumber || !busForm.capacity || !busForm.driverName || !busForm.driverPhone) return toast.error("All fields required");
    try {
      setSubmitting(true);
      const res = await API.post("/admin/auth/transport/bus/create", busForm);
      onBusAdded(res.data.bus);
      toast.success("Bus added successfully!");
      setBusForm({ busNumber: "", capacity: "", driverName: "", driverPhone: "", route: "", busType: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add bus");
    } finally { setSubmitting(false); }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2"><Plus /> Add Bus</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>Add New Bus</DialogTitle></DialogHeader>
        <div className="space-y-3 mt-2">
          <Input placeholder="Bus Number" value={busForm.busNumber} onChange={e => setBusForm({ ...busForm, busNumber: e.target.value })} />
          <Input placeholder="Capacity" type="number" value={busForm.capacity} onChange={e => setBusForm({ ...busForm, capacity: e.target.value })} />
          <Input placeholder="Driver Name" value={busForm.driverName} onChange={e => setBusForm({ ...busForm, driverName: e.target.value })} />
          <Input placeholder="Driver Phone" value={busForm.driverPhone} onChange={e => setBusForm({ ...busForm, driverPhone: e.target.value })} />
          <Input placeholder="Bus Type" value={busForm.busType} onChange={e => setBusForm({ ...busForm, busType: e.target.value })} />
          <select className="w-full border p-2 rounded" value={busForm.route} onChange={e => setBusForm({ ...busForm, route: e.target.value })}>
            <option value="">Select Route</option>
            {routes.map(r => <option key={r._id} value={r._id}>{r.routeName}</option>)}
          </select>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={submitting}>{submitting ? "Adding..." : "Add Bus"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddBusModal;
