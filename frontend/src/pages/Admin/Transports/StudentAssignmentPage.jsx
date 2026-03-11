import React, { useEffect, useState } from "react";
import API from "@/api/axios";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bus, User, MapPin, Clock, Users, Plus, Edit, Trash2, Search, BookOpen } from "lucide-react";

const StudentAssignmentPage = () => {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);

  const [newAssignment, setNewAssignment] = useState({
    studentId: "",
    routeId: "",
    busId: "",
    stop: "",
    pickupTime: "",
    dropTime: "",
  });

  // Fetch all data
  const fetchData = async () => {
    try {
      // Fetch all data in parallel
      const [clsRes, routesRes, busesRes, assignRes] = await Promise.all([
        API.get("/admin/auth/classes/"),
        API.get("/admin/auth/transport/route/all"),
        API.get("/admin/auth/transport/bus/all"),
        API.get("/admin/auth/transport/assignments"),
      ]);

      // Set basic data
      setClasses(clsRes.data.classes || []);
      setRoutes(routesRes.data.routes || []);
      setBuses(busesRes.data.buses || []);

      // Map assignments
      const mappedAssignments = (assignRes.data.assignments || []).map(a => {
        const student = a.studentId || {};
        const bus = a.busId || {};
        const route = bus.route || {};

        // Find the stop object in route.stops
        const stopObj = route.stops?.find(s => s.stopName === a.stop) || {};

        return {
          ...a,
          studentId: student,
          busId: bus,
          route: route,
          pickupTime: stopObj.pickupTime || "",
          dropTime: stopObj.dropTime || "",
        };
      });

      setAssignments(mappedAssignments);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load data");
    }
  };


  useEffect(() => { fetchData(); }, []);

  // Fetch students by class
  useEffect(() => {
    if (!selectedClass) return;
    const fetchStudents = async () => {
      try {
        const res = await API.get(`/admin/auth/viewstudent/class/${selectedClass}`);
        const studentsMapped = res.data.students.map((s) => ({
          ...s,
          className: s.classId?.name || "N/A",
        }));
        setStudents(studentsMapped);
      } catch (err) {
        toast.error("Failed to load students");
      }
    };
    fetchStudents();
  }, [selectedClass]);

  // Filter assignments based on search
  const filteredAssignments = assignments.filter(assignment => {
    const studentName = assignment.studentId ?
      `${assignment.studentId.firstName} ${assignment.studentId.lastName}`.toLowerCase() : "";
    const busNumber = assignment.busId?.busNumber?.toLowerCase() || "";
    const stopName = assignment.stop?.toLowerCase() || "";

    return studentName.includes(searchTerm.toLowerCase()) ||
      busNumber.includes(searchTerm.toLowerCase()) ||
      stopName.includes(searchTerm.toLowerCase());
  });

  // Save or Update Assignment
  const handleSaveAssignment = async () => {
    const { studentId, routeId, busId, stop } = newAssignment;
    if (!studentId || !routeId || !busId || !stop)
      return toast.error("All fields are required");

    try {
      if (editingAssignment) {
        const res = await API.put(
          `/admin/auth/transport/assignment/${editingAssignment._id}/update`,
          newAssignment
        );
        setAssignments((prev) =>
          prev.map((a) => (a._id === editingAssignment._id ? res.data.assignment : a))
        );
        toast.success("🎉 Assignment updated successfully!");
      } else {
        const res = await API.post("/admin/auth/transport/assignment/create", newAssignment);
        setAssignments([res.data.assignment, ...assignments]);
        toast.success("🎉 Student assigned to transport!");
      }
      setDialogOpen(false);
      setEditingAssignment(null);
      setNewAssignment({ studentId: "", routeId: "", busId: "", stop: "", pickupTime: "", dropTime: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save assignment");
    }
  };

  // Edit
  const handleEditAssignment = (assignment) => {
    // Get the route object from routes array
    const routeObj = routes.find((r) => r._id === assignment.busId?.route?._id);

    // Get the stop info from routeObj
    const stopInfo = routeObj?.stops.find((s) => s.stopName === assignment.stop) || {};

    setEditingAssignment(assignment);
    setSelectedClass(assignment.studentId?.classId?._id || ""); // pre-select class
    setNewAssignment({
      studentId: assignment.studentId?._id || "",
      routeId: routeObj?._id || "",
      busId: assignment.busId?._id || "",
      stop: assignment.stop || "",
      pickupTime: stopInfo.pickupTime || "",
      dropTime: stopInfo.dropTime || "",
    });
    setDialogOpen(true);
  };


  // Delete
  const handleDeleteAssignment = async (id) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;
    try {
      await API.delete(`/admin/auth/transport/assignment/${id}/delete`);
      setAssignments(assignments.filter((a) => a._id !== id));
      toast.success("Assignment deleted successfully!");
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || `Failed to delete assignment`);
    }
  };

  const stats = [
    { title: "Total Assignments", value: assignments.length, icon: Users, color: "from-blue-500 to-cyan-500" },
    { title: "Active Routes", value: routes.length, icon: MapPin, color: "from-green-500 to-emerald-500" },
    { title: "Available Buses", value: buses.filter(b => b.status === "Active").length, icon: Bus, color: "from-purple-500 to-pink-500" },
    { title: "Total Students", value: students.length, icon: User, color: "from-orange-500 to-red-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/20 py-8 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl mb-4">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Student Transport Assignment
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Manage student transportation assignments and schedules
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <Card key={idx} className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{stat.title}</p>
                  </div>
                  <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-2xl shadow-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Assignment List */}
          <div className="lg:col-span-3">
            <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      Transport Assignments ({filteredAssignments.length})
                    </CardTitle>
                    <CardDescription>
                      All student transportation assignments and schedules
                    </CardDescription>
                  </div>
                  <div className="flex gap-3">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search assignments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-48 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                      />
                    </div>
                    <Button
                      onClick={() => {
                        setDialogOpen(true);
                        setEditingAssignment(null);
                        setNewAssignment({ studentId: "", routeId: "", busId: "", stop: "", pickupTime: "", dropTime: "" });
                      }}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Assign Student
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredAssignments.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No assignments found</p>
                    <p className="text-sm">
                      {searchTerm ? "Try adjusting your search terms" : "Start by assigning students to transport"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {filteredAssignments.map((assignment) => (
                      <div key={assignment._id} className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700/50 hover:shadow-lg transition-all duration-200 group">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                                {assignment.studentId ? `${assignment.studentId.firstName} ${assignment.studentId.lastName}` : "Unnamed Student"}
                              </h3>
                              <Badge variant="outline" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                {assignment.studentId?.classId?.name || "N/A"}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                <Bus className="w-4 h-4 text-blue-600" />
                                <span>Bus: <strong>{assignment.busId?.busNumber || "N/A"}</strong></span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                <MapPin className="w-4 h-4 text-green-600" />
                                <span>Stop: <strong>{assignment.stop || "N/A"}</strong></span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                <Clock className="w-4 h-4 text-orange-600" />
                                <span>Pickup: <strong>{assignment.pickupTime || "N/A"}</strong></span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                <Clock className="w-4 h-4 text-purple-600" />
                                <span>Drop: <strong>{assignment.dropTime || "N/A"}</strong></span>
                              </div>
                            </div>

                            {assignment.busId?.route && (
                              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-600/50 rounded-lg">
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  <strong>Route:</strong> {assignment.busId.route.routeName} •
                                  <span className="text-gray-500 dark:text-gray-400 ml-1">
                                    {assignment.busId.route.source} → {assignment.busId.route.destination}
                                  </span>
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditAssignment(assignment)}
                              className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteAssignment(assignment._id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Plus className="w-5 h-5 text-blue-600" />
                  Quick Assign
                </CardTitle>
                <CardDescription>
                  Quickly assign students to transport
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => setDialogOpen(true)}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                >
                  <Users className="w-4 h-4 mr-2" />
                  New Assignment
                </Button>

                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">Quick Stats</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Unassigned Students</span>
                      <span className="font-semibold">24</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Available Seats</span>
                      <span className="font-semibold text-green-600">156</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Full Buses</span>
                      <span className="font-semibold">3</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Assignment Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Users className="w-6 h-6 text-blue-600" />
              {editingAssignment ? "Edit Assignment" : "Assign Student to Transport"}
            </DialogTitle>
            <DialogDescription>
              {editingAssignment ? "Update the transportation assignment" : "Select student and assign to transport route"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Select Class */}
            <div className="space-y-2">
              <Label>Class</Label>
              <Select value={selectedClass} onValueChange={(v) => setSelectedClass(v)}>
                <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Select Student */}
            <div className="space-y-2">
              <Label>Student</Label>
              <Select
                value={newAssignment.studentId}
                onValueChange={(v) => setNewAssignment({ ...newAssignment, studentId: v })}
                disabled={!selectedClass}
              >
                <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Select Student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s._id} value={s._id}>
                      {s.firstName} {s.lastName} - {s.className}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Select Route */}
            <div className="space-y-2">
              <Label>Route</Label>
              <Select
                value={newAssignment.routeId}
                onValueChange={(v) =>
                  setNewAssignment({ ...newAssignment, routeId: v, stop: "", busId: "", pickupTime: "", dropTime: "" })
                }
              >
                <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Select Route" />
                </SelectTrigger>
                <SelectContent>
                  {routes.map((r) => (
                    <SelectItem key={r._id} value={r._id}>
                      {r.routeName} ({r.source} → {r.destination})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Select Stop */}
            {newAssignment.routeId && (
              <div className="space-y-2">
                <Label>Stop</Label>
                <Select
                  value={newAssignment.stop}
                  onValueChange={(v) => {
                    const stopObj = routes
                      .find((r) => r._id === newAssignment.routeId)
                      ?.stops.find((s) => s.stopName === v);
                    setNewAssignment({
                      ...newAssignment,
                      stop: v,
                      pickupTime: stopObj?.pickupTime || "",
                      dropTime: stopObj?.dropTime || ""
                    });
                  }}
                >
                  <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder="Select Stop" />
                  </SelectTrigger>
                  <SelectContent>
                    {routes
                      .find((r) => r._id === newAssignment.routeId)
                      ?.stops?.map((s, idx) => (
                        <SelectItem key={idx} value={s.stopName}>
                          {s.stopName} (Pickup: {s.pickupTime || "N/A"})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Select Bus */}
            {newAssignment.routeId && (
              <div className="space-y-2">
                <Label>Bus</Label>
                <Select
                  value={newAssignment.busId}
                  onValueChange={(v) => setNewAssignment({ ...newAssignment, busId: v })}
                >
                  <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder="Select Bus" />
                  </SelectTrigger>
                  <SelectContent>
                    {buses
                      .filter((b) => b.route?._id === newAssignment.routeId && b.status === "Active")
                      .map((b) => (
                        <SelectItem key={b._id} value={b._id}>
                          {b.busNumber} ({b.busType}) - {b.driverName}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Schedule Display */}
            {(newAssignment.pickupTime || newAssignment.dropTime) && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 text-sm mb-2">Schedule</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-blue-700 dark:text-blue-300">
                    <strong>Pickup:</strong> {newAssignment.pickupTime || "N/A"}
                  </div>
                  <div className="text-blue-700 dark:text-blue-300">
                    <strong>Drop:</strong> {newAssignment.dropTime || "N/A"}
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={handleSaveAssignment}
              disabled={!newAssignment.studentId || !newAssignment.routeId || !newAssignment.busId || !newAssignment.stop}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
            >
              {editingAssignment ? "Update Assignment" : "Assign Student"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentAssignmentPage;