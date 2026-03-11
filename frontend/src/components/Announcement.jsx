import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import API from "@/api/axios";
import { toast } from "sonner";
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogClose
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Loader2 } from "lucide-react";

const Announcement = () => {
  const { user, role } = useSelector((state) => state.auth);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState("student");
  const [submitting, setSubmitting] = useState(false);

  const fetchAnnouncements = async () => {
    if (!role) return;
    setLoading(true);
    try {
      const endpoint =
        role === "admin"
          ? "/admin/auth/announcement/all"
          : role === "teacher"
          ? "/teacher/auth/announcement/all"
          : "/student/auth/announcement/all";

      const res = await API.get(endpoint);
      setAnnouncements(res.data.announcements || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [role]);

  const handleSubmit = async () => {
    if (!title || !message || !target) return toast.error("All fields are required");

    try {
      setSubmitting(true);
      const res = await API.post("/admin/auth/announcement/create", {
        title, message, target: [target]
      });
      setAnnouncements((prev) => [res.data.announcement, ...prev]);
      toast.success("Announcement created successfully!");
      setTitle("");
      setMessage("");
      setTarget("student");
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create announcement");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-4 md:p-6 overflow-auto max-h-[700px] transition-colors">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg md:text-xl font-bold text-gray-700 dark:text-gray-200">
          📢 Announcements
        </h3>

        {role === "admin" && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition cursor-pointer">
                + Create
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md dark:bg-gray-800 dark:text-gray-100">
              <DialogHeader>
                <DialogTitle className="text-center">Create Announcement</DialogTitle>
                <DialogDescription className="text-center dark:text-gray-400">
                  Fill in the details below to add a new announcement.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-2">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Enter message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="mt-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  />
                </div>

                <div>
                  <Label htmlFor="target">Target Audience</Label>
                  <select
                    id="target"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    className="w-full border rounded px-3 py-2 mt-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  >
                    <option value="student">Students</option>
                    <option value="teacher">Teachers</option>
                    <option value="admin">Admins</option>
                    <option value="all">Everyone</option>
                  </select>
                </div>
              </div>

              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button variant="outline" className="dark:border-gray-500 dark:text-gray-200">Cancel</Button>
                </DialogClose>
                <Button onClick={handleSubmit} disabled={submitting} className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">
                  {submitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Creating...</> : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Body */}
      {loading ? (
        <p className="text-gray-500 dark:text-gray-400 text-center">Loading announcements...</p>
      ) : announcements.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center">No announcements yet.</p>
      ) : (
        <ul className="space-y-3">
          {announcements.map((ann, idx) => (
            <li key={idx} className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800 border-l-4 border-blue-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
              <div className="flex justify-between items-center mb-1">
                <p className="font-semibold text-gray-800 dark:text-gray-100">{ann.title}</p>
                {role === "admin" && <span className="text-xs text-blue-600 dark:text-blue-400 font-medium capitalize">{ann.target?.join(", ")}</span>}
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm whitespace-pre-line">{ann.message || ann.description}</p>
              <div className="flex justify-between items-center mt-2 text-xs text-gray-400 dark:text-gray-500">
                <span>Posted by: {ann.createdBy?.name || "Admin"}</span>
                <span>{new Date(ann.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Announcement;
