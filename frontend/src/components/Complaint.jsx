import React, { useEffect, useState } from "react";
import API from "@/api/axios";
import { toast } from "sonner";

const AdminComplaint = () => {
  const [complaints, setComplaints] = useState([]);
  const [updates, setUpdates] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch complaints
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        const res = await API.get("/admin/auth/getallcomplaint");
        setComplaints(res.data.complaints || []);

        // Initialize updates state
        const initialUpdates = {};
        res.data.complaints.forEach(c => {
          initialUpdates[c._id] = { status: c.status, adminReply: c.adminReply || "" };
        });
        setUpdates(initialUpdates);
      } catch (err) {
        console.error("Error fetching complaints:", err);
        toast.error("Failed to fetch complaints");
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  // Handle local changes
  const handleLocalChange = (id, field, value) => {
    setUpdates(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  // Update complaint
  const handleUpdateClick = async (id) => {
    try {
      const { status, adminReply } = updates[id];
      const res = await API.put(`/admin/auth/updatecomplaint/${id}`, { status, adminReply });
      setComplaints(prev => prev.map(c => (c._id === id ? res.data.complaint : c)));
      toast.success("Complaint updated successfully!");
    } catch (err) {
      console.error("Error updating complaint:", err);
      toast.error("Failed to update complaint");
    }
  };

  const statusColors = {
    Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100",
    Resolved: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
    Rejected: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
  };

  if (loading) return <p className="text-center text-gray-500 dark:text-gray-400 mt-4">Loading complaints...</p>;

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 mt-6 overflow-auto max-h-[600px]">
      <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-6 text-center">
        🛑 Complaints
      </h3>

      {complaints.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center">No complaints yet.</p>
      ) : (
        <ul className="space-y-4">
          {complaints.map((c) => (
            <li
              key={c._id}
              className="p-4 rounded-2xl shadow-sm hover:shadow-md transition bg-gray-50 dark:bg-gray-800 border-l-4 border-red-500"
            >
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold text-gray-800 dark:text-gray-100 text-lg">{c.title}</p>
                <select
                  className={`text-sm font-medium px-3 py-1 rounded ${statusColors[updates[c._id]?.status || c.status]}`}
                  value={updates[c._id]?.status || c.status}
                  onChange={(e) => handleLocalChange(c._id, "status", e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{c.description}</p>

              <textarea
                placeholder="Add reply..."
                value={updates[c._id]?.adminReply || ""}
                onChange={(e) => handleLocalChange(c._id, "adminReply", e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-gray-100 mb-2 resize-none"
              />

              <div className="flex justify-between items-center">
                <button
                  onClick={() => handleUpdateClick(c._id)}
                  className="bg-blue-500 text-white px-4 py-1 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition"
                >
                  Update
                </button>

                <p className="text-gray-400 dark:text-gray-500 text-xs">
  By: {c.userRole === "Teacher"
    ? c.userId?.name || "Unknown Teacher"
    : `${c.userId?.firstName || ""} ${c.userId?.lastName || ""}`.trim() || "Unknown Student"
  } ({c.userRole || "N/A"}) | {new Date(c.createdAt).toLocaleDateString()}
</p>

              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminComplaint;
