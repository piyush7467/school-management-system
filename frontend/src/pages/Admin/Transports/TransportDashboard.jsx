import React, { useEffect, useState } from "react";
import API from "@/api/axios";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Bus, Route, Users, MapPin, Clock, Plus, Edit, Trash2, ArrowRight, Phone, User, Calendar } from "lucide-react";

const TransportDashboard = () => {
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [routeDialogOpen, setRouteDialogOpen] = useState(false);
  const [busDialogOpen, setBusDialogOpen] = useState(false);

  const [editingRoute, setEditingRoute] = useState(null);
  const [editingBus, setEditingBus] = useState(null);

  const [newRoute, setNewRoute] = useState({
    routeName: "",
    source: "",
    destination: "",
    stops: [{ stopName: "", pickupTime: "", dropTime: "" }],
  });

  const [newBus, setNewBus] = useState({
    busNumber: "",
    capacity: 0,
    driverName: "",
    driverPhone: "",
    type: "Omni",
    routeId: "",
    status: "Active",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [routesRes, busesRes, assignmentsRes] = await Promise.all([
        API.get("/admin/auth/transport/route/all"),
        API.get("/admin/auth/transport/bus/all"),
        API.get("/admin/auth/transport/assignments"),
      ]);
      setRoutes(routesRes.data.routes || []);
      setBuses(busesRes.data.buses || []);
      setAssignments(assignmentsRes.data.assignments || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load transport data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSaveRoute = async () => {
    if (!newRoute.routeName || !newRoute.source || !newRoute.destination) {
      return toast.error("Route Name, Source, Destination are required");
    }
    if (newRoute.stops.some(s => !s.stopName || !s.pickupTime || !s.dropTime)) {
      return toast.error("All stops must have Stop Name, Pickup Time, and Drop Time");
    }

    try {
      let res;
      if (editingRoute) {
        res = await API.put(`/admin/auth/transport/route/${editingRoute._id}/update`, newRoute);
        setRoutes(routes.map(r => r._id === editingRoute._id ? res.data.route : r));
        toast.success("Route updated successfully!");
      } else {
        res = await API.post("/admin/auth/transport/route/create", newRoute);
        setRoutes([res.data.route, ...routes]);
        toast.success("Route created successfully!");
      }

      setRouteDialogOpen(false);
      setEditingRoute(null);
      setNewRoute({ routeName: "", source: "", destination: "", stops: [{ stopName: "", pickupTime: "", dropTime: "" }] });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save route");
    }
  };

  const handleEditRoute = (route) => {
    setEditingRoute(route);
    setNewRoute({ ...route });
    setRouteDialogOpen(true);
  };

  const handleDeleteRoute = async (id) => {
    if (!confirm("Are you sure you want to delete this route?")) return;
    try {
      await API.delete(`/admin/auth/transport/route/${id}/delete`);
      setRoutes(routes.filter(r => r._id !== id));
      toast.success("Route deleted successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete route");
    }
  };

  const handleSaveBus = async () => {
    if (!newBus.busNumber || !newBus.capacity || !newBus.driverName || !newBus.driverPhone || !newBus.routeId) {
      return toast.error("All fields are required");
    }

    try {
      let res;
      if (editingBus) {
        res = await API.put(`/admin/auth/transport/bus/${editingBus._id}/update`, { ...newBus, routeId: newBus.routeId });
        setBuses(buses.map(b => b._id === editingBus._id ? res.data.bus : b));
        toast.success("Bus updated successfully!");
      } else {
        res = await API.post("/admin/auth/transport/bus/create", { ...newBus, routeId: newBus.routeId });
        setBuses([res.data.bus, ...buses]);
        toast.success("Bus created successfully!");
      }

      setBusDialogOpen(false);
      setEditingBus(null);
      setNewBus({ busNumber: "", capacity: 0, driverName: "", driverPhone: "", type: "Omni", routeId: "", status: "Active" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save bus");
    }
  };

  const handleEditBus = (bus) => {
    setEditingBus(bus);
    setNewBus({
      busNumber: bus.busNumber,
      capacity: bus.capacity,
      driverName: bus.driverName,
      driverPhone: bus.driverPhone,
      type: bus.busType,
      routeId: bus.route?._id || "",
      status: bus.status
    });
    setBusDialogOpen(true);
  };

  const handleDeleteBus = async (id) => {
    if (!confirm("Are you sure you want to delete this bus?")) return;
    try {
      await API.delete(`/admin/auth/transport/bus/${id}/delete`);
      setBuses(buses.filter(b => b._id !== id));
      toast.success("Bus deleted successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete bus");
    }
  };

  const stats = [
    { title: "Total Routes", value: routes.length, icon: Route, color: "from-blue-500 to-cyan-500" },
    { title: "Total Buses", value: buses.length, icon: Bus, color: "from-purple-500 to-pink-500" },
    { title: "Active Buses", value: buses.filter(b => b.status === "Active").length, icon: Users, color: "from-green-500 to-emerald-500" },
    { title: "Inactive Buses", value: buses.filter(b => b.status === "Inactive").length, icon: Calendar, color: "from-yellow-500 to-orange-500" },
    { title: "Total Assignments", value: assignments.length, icon: MapPin, color: "from-red-500 to-pink-500" },
  ];

  const getStatusColor = (status) => {
    return status === "Active" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
  };

  const getBusTypeColor = (type) => {
    const colors = {
      "Omni": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      "Eeco": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      "Big Bus": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
    };
    return colors[type] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/20 py-8 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl mb-4">
            <Bus className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Transport Management
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Manage routes, buses, and student transportation assignments
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
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

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4">
          <Button 
            onClick={() => navigate("/admin/transport/student-assignment")}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
          >
            <Users className="w-4 h-4 mr-2" />
            Assign Students
          </Button>
          <Button 
            onClick={() => { setEditingRoute(null); setRouteDialogOpen(true); }}
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Route
          </Button>
          <Button 
            onClick={() => { setEditingBus(null); setBusDialogOpen(true); }}
            variant="outline"
            className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Bus
          </Button>
        </div>

        {/* Routes & Buses Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Routes Section */}
          <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                  <Route className="w-5 h-5 text-white" />
                </div>
                Routes ({routes.length})
              </CardTitle>
              <CardDescription>
                Manage transportation routes and stops
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : routes.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Route className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No routes created yet</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {routes.map(route => (
                    <div key={route._id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700/50 hover:shadow-lg transition-all duration-200">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                            {route.routeName}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 text-sm text-gray-600 dark:text-gray-400">
                            <MapPin className="w-4 h-4" />
                            <span>{route.source}</span>
                            <ArrowRight className="w-4 h-4" />
                            <span>{route.destination}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditRoute(route)}>
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteRoute(route._id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {route.stops?.slice(0, 3).map((stop, idx) => (
                          <div key={idx} className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="font-medium">{stop.stopName}</span>
                            <Clock className="w-3 h-3" />
                            <span>Pickup: {stop.pickupTime}</span>
                            <span>Drop: {stop.dropTime}</span>
                          </div>
                        ))}
                        {route.stops?.length > 3 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            +{route.stops.length - 3} more stops
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Buses Section */}
          <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <Bus className="w-5 h-5 text-white" />
                </div>
                Buses ({buses.length})
              </CardTitle>
              <CardDescription>
                Manage bus fleet and driver information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : buses.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Bus className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No buses added yet</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {buses.map(bus => (
                    <div key={bus._id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700/50 hover:shadow-lg transition-all duration-200">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                              {bus.busNumber}
                            </h3>
                            <Badge className={getStatusColor(bus.status)}>
                              {bus.status}
                            </Badge>
                            <Badge variant="outline" className={getBusTypeColor(bus.busType)}>
                              {bus.busType}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                              <User className="w-4 h-4" />
                              <span>Driver: {bus.driverName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                              <Phone className="w-4 h-4" />
                              <span>{bus.driverPhone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                              <Users className="w-4 h-4" />
                              <span>Capacity: {bus.capacity} students</span>
                            </div>
                            {bus.route && (
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                <Route className="w-4 h-4" />
                                <span>Route: {bus.route.routeName}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditBus(bus)}>
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteBus(bus._id)}>
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
      </div>

      {/* Route Dialog */}
      <Dialog open={routeDialogOpen} onOpenChange={setRouteDialogOpen}>
        <DialogContent className="border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Route className="w-6 h-6 text-blue-600" />
              {editingRoute ? "Edit Route" : "Create New Route"}
            </DialogTitle>
            <DialogDescription>
              {editingRoute ? "Update the route details" : "Add a new transportation route with stops"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Route Name</Label>
                <Input 
                  placeholder="Route 101" 
                  value={newRoute.routeName} 
                  onChange={e => setNewRoute({ ...newRoute, routeName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Source</Label>
                <Input 
                  placeholder="Starting point" 
                  value={newRoute.source} 
                  onChange={e => setNewRoute({ ...newRoute, source: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Destination</Label>
                <Input 
                  placeholder="End point" 
                  value={newRoute.destination} 
                  onChange={e => setNewRoute({ ...newRoute, destination: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Stops & Schedule</Label>
              {newRoute.stops.map((stop, idx) => (
                <div key={idx} className="p-4 border border-gray-200 dark:border-gray-600 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 dark:text-white">Stop {idx + 1}</h4>
                    {newRoute.stops.length > 1 && (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => {
                          const updated = [...newRoute.stops];
                          updated.splice(idx, 1);
                          setNewRoute({ ...newRoute, stops: updated });
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input 
                      placeholder="Stop Name" 
                      value={stop.stopName} 
                      onChange={e => {
                        const updated = [...newRoute.stops];
                        updated[idx].stopName = e.target.value;
                        setNewRoute({ ...newRoute, stops: updated });
                      }}
                    />
                    <Input 
                      type="time" 
                      placeholder="Pickup Time" 
                      value={stop.pickupTime} 
                      onChange={e => {
                        const updated = [...newRoute.stops];
                        updated[idx].pickupTime = e.target.value;
                        setNewRoute({ ...newRoute, stops: updated });
                      }}
                    />
                    <Input 
                      type="time" 
                      placeholder="Drop Time" 
                      value={stop.dropTime} 
                      onChange={e => {
                        const updated = [...newRoute.stops];
                        updated[idx].dropTime = e.target.value;
                        setNewRoute({ ...newRoute, stops: updated });
                      }}
                    />
                  </div>
                </div>
              ))}
              
              <Button 
                onClick={() => setNewRoute({ ...newRoute, stops: [...newRoute.stops, { stopName: "", pickupTime: "", dropTime: "" }] })}
                variant="outline"
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Stop
              </Button>
            </div>

            <Button 
              onClick={handleSaveRoute}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {editingRoute ? "Update Route" : "Create Route"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bus Dialog */}
      <Dialog open={busDialogOpen} onOpenChange={setBusDialogOpen}>
        <DialogContent className="border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Bus className="w-6 h-6 text-green-600" />
              {editingBus ? "Edit Bus" : "Add New Bus"}
            </DialogTitle>
            <DialogDescription>
              {editingBus ? "Update bus details" : "Add a new bus to the fleet"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bus Number</Label>
                <Input 
                  placeholder="BUS-001" 
                  value={newBus.busNumber} 
                  onChange={e => setNewBus({ ...newBus, busNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Capacity</Label>
                <Input 
                  type="number" 
                  min={1}
                  placeholder="50" 
                  value={newBus.capacity} 
                  onChange={e => setNewBus({ ...newBus, capacity: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Driver Name</Label>
              <Input 
                placeholder="Driver name" 
                value={newBus.driverName} 
                onChange={e => setNewBus({ ...newBus, driverName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Driver Phone</Label>
              <Input 
                type="tel"
                placeholder="1234567890" 
                value={newBus.driverPhone} 
                onChange={e => setNewBus({ ...newBus, driverPhone: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bus Type</Label>
                <Select value={newBus.type} onValueChange={v => setNewBus({ ...newBus, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Omni">Omni</SelectItem>
                    <SelectItem value="Eeco">Eeco</SelectItem>
                    <SelectItem value="Big Bus">Big Bus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={newBus.status} onValueChange={v => setNewBus({ ...newBus, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Route</Label>
              <Select value={newBus.routeId} onValueChange={v => setNewBus({ ...newBus, routeId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Route" />
                </SelectTrigger>
                <SelectContent>
                  {routes.map(route => (
                    <SelectItem key={route._id} value={route._id}>
                      {route.routeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleSaveBus}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
            >
              {editingBus ? "Update Bus" : "Create Bus"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Label component
const Label = ({ children, className }) => (
  <label className={`text-sm font-medium text-gray-700 dark:text-gray-300 ${className}`}>
    {children}
  </label>
);

export default TransportDashboard;