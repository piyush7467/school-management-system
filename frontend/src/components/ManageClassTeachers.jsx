import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import API from "@/api/axios";

const ManageClassTeachers = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unassignLoadingId, setUnassignLoadingId] = useState(null);

  // Fetch all assignments
  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/auth/class-teacher-assignments");
      setAssignments(res.data.assignments || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch assignments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  // Unassign teacher
 // Unassign teacher
const unassignTeacher = async (assignmentId) => {
  try {
    setUnassignLoadingId(assignmentId); // show loading for this row
    const res = await API.delete(`/admin/auth/unassign-class-teacher/${assignmentId}`);
    if (res.data.success) {
      toast.success("Teacher unassigned successfully");
      fetchAssignments(); // refresh list after unassign
    } else {
      toast.error(res.data.message || "Failed to unassign teacher");
    }
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.message || "Failed to unassign teacher");
  } finally {
    setUnassignLoadingId(null);
  }
};


  return (
    <div className="max-w-6xl mx-auto p-4">
      <Card className="bg-white/80 dark:bg-gray-800/80 shadow-xl rounded-2xl border-0">
        <CardHeader>
          <CardTitle>Manage Class Teachers</CardTitle>
          <CardDescription>
            View all assigned class teachers and unassign if necessary
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-gray-600 dark:text-gray-400">Loading assignments...</p>
          ) : assignments.length === 0 ? (
            <p className="text-center text-gray-600 dark:text-gray-400">No assignments found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border rounded">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    <th className="px-4 py-2 border">#</th>
                    <th className="px-4 py-2 border">Teacher</th>
                    <th className="px-4 py-2 border">Class</th>
                    <th className="px-4 py-2 border">Section</th>
                    <th className="px-4 py-2 border">Action</th>
                  </tr>
                </thead>
                <tbody>
  {assignments.map((a, i) => (
    <tr key={`${a.assignmentId ?? 'no-id'}-${i}`} className="text-center">
      <td className="px-4 py-2 border">{i + 1}</td>
      <td className="px-4 py-2 border">{a.teacherName}</td>
      <td className="px-4 py-2 border">{a.className}</td>
      <td className="px-4 py-2 border">{a.sectionName}</td>
      <td className="px-4 py-2 border">
        <Button
          size="sm"
          variant="destructive"
          disabled={unassignLoadingId === a.assignmentId}
          onClick={() => unassignTeacher(a.assignmentId)}
        >
          {unassignLoadingId === a.assignmentId ? "Unassigning..." : "Unassign"}
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
    </div>
  );
};

export default ManageClassTeachers;
