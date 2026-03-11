import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import API from "@/api/axios";
import { toast } from "sonner";

const AddRouteModal = ({ onRouteAdded }) => {
  const [routeName, setRouteName] = useState("");
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [stops, setStops] = useState("");
  const [timing, setTiming] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!routeName || !source || !destination) return toast.error("Route Name, Source, and Destination are required");
    try {
      setSubmitting(true);
      const res = await API.post("/admin/auth/transport/route/create", {
        routeName, source, destination, stops: stops.split(",").map(s => s.trim()), timing
      });
      onRouteAdded(res.data.route);
      toast.success("Route added successfully!");
      setRouteName(""); setSource(""); setDestination(""); setStops(""); setTiming("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add route");
    } finally { setSubmitting(false); }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2"><Plus /> Add Route</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>Add New Route</DialogTitle></DialogHeader>
        <div className="space-y-3 mt-2">
          <Input placeholder="Route Name" value={routeName} onChange={e => setRouteName(e.target.value)} />
          <Input placeholder="Source" value={source} onChange={e => setSource(e.target.value)} />
          <Input placeholder="Destination" value={destination} onChange={e => setDestination(e.target.value)} />
          <Input placeholder="Stops (comma separated)" value={stops} onChange={e => setStops(e.target.value)} />
          <Input placeholder="Timing (e.g. 8:00 AM - 5:00 PM)" value={timing} onChange={e => setTiming(e.target.value)} />
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={submitting}>{submitting ? "Adding..." : "Add Route"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddRouteModal;
