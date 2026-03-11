import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import API from "@/api/axios";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, XCircle, Clock, Plus, MessageSquare, Send } from "lucide-react";

const StudentComplaint = () => {
  const { user } = useSelector((state) => state.auth);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await API.get("/student/auth/complaint/my");
      setComplaints(res.data.complaints || []);
    } catch (err) {
      toast.error("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!title || !description) return toast.error("All fields are required");

    try {
      setSubmitting(true);
      const res = await API.post("/student/auth/complaint/create", { title, description });
      setComplaints([res.data.complaint, ...complaints]);
      setTitle("");
      setDescription("");
      toast.success("🎉 Complaint submitted successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit complaint");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => { fetchComplaints(); }, []);

  // Calculate stats
  const total = complaints.length;
  const resolved = complaints.filter(c => c.status === "Resolved").length;
  const rejected = complaints.filter(c => c.status === "Rejected").length;
  const pending = complaints.filter(c => c.status === "Pending").length;

  // Filter complaints based on active tab
  const filteredComplaints = activeTab === "all" 
    ? complaints 
    : complaints.filter(c => c.status.toLowerCase() === activeTab);

  const statusConfig = {
    Pending: { 
      color: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
      icon: Clock,
      gradient: "from-yellow-500 to-amber-500"
    },
    Resolved: { 
      color: "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30",
      icon: CheckCircle,
      gradient: "from-green-500 to-emerald-500"
    },
    Rejected: { 
      color: "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30",
      icon: XCircle,
      gradient: "from-red-500 to-pink-500"
    }
  };

  const statCards = [
    { 
      label: "Total Complaints", 
      value: total, 
      gradient: "from-blue-500 to-cyan-500",
      icon: MessageSquare
    },
    { 
      label: "Resolved", 
      value: resolved, 
      gradient: "from-green-500 to-emerald-500",
      icon: CheckCircle
    },
    { 
      label: "Rejected", 
      value: rejected, 
      gradient: "from-red-500 to-pink-500",
      icon: XCircle
    },
    { 
      label: "Pending", 
      value: pending, 
      gradient: "from-yellow-500 to-orange-500",
      icon: Clock
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/20 py-6 px-4 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Student Complaints
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Submit and track your complaints and feedback
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <Card key={index} className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{stat.label}</p>
                  </div>
                  <div className={`p-3 rounded-2xl bg-gradient-to-r ${stat.gradient} shadow-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Complaint Section */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-6">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Plus className="w-5 h-5 text-blue-600" />
                  New Complaint
                </CardTitle>
                <CardDescription>
                  Submit a new complaint or feedback
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Title
                  </Label>
                  <Input 
                    placeholder="Brief title of your complaint..." 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </Label>
                  <Textarea 
                    placeholder="Detailed description of your complaint..."
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[120px] bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  />
                </div>
                <Button 
                  onClick={handleSubmit} 
                  disabled={submitting || !title || !description}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg transition-all duration-200"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Complaint
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Complaint List Section */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  My Complaints
                </CardTitle>
                <CardDescription>
                  Track the status of all your submitted complaints
                </CardDescription>
                
                {/* Filter Tabs */}
                <div className="flex space-x-1 mt-4">
                  {["all", "pending", "resolved", "rejected"].map((tab) => (
                    <Button
                      key={tab}
                      variant={activeTab === tab ? "default" : "outline"}
                      onClick={() => setActiveTab(tab)}
                      className={`rounded-full text-xs ${
                        activeTab === tab 
                          ? "bg-blue-600 text-white shadow-md" 
                          : "bg-transparent text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-3">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading complaints...</p>
                  </div>
                ) : filteredComplaints.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto" />
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                      {activeTab === "all" ? "No complaints yet." : `No ${activeTab} complaints.`}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                        {activeTab === "all" ? "Submit your first complaint to get started." : "All complaints are filtered out."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {filteredComplaints.map((complaint) => {
                      const StatusIcon = statusConfig[complaint.status]?.icon || Clock;
                      return (
                        <div
                          key={complaint._id}
                          className="group p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                              {complaint.title}
                            </h3>
                            <Badge 
                              variant="outline" 
                              className={`${statusConfig[complaint.status]?.color} border px-3 py-1 rounded-full font-medium`}
                            >
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {complaint.status}
                            </Badge>
                          </div>
                          
                          <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                            {complaint.description}
                          </p>

                          {complaint.adminReply && (
                            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                <span className="font-medium text-green-800 dark:text-green-300 text-sm">
                                  Admin Response
                                </span>
                              </div>
                              <p className="text-green-700 dark:text-green-300 text-sm">
                                {complaint.adminReply}
                              </p>
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Submitted {new Date(complaint.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            {complaint.updatedAt !== complaint.createdAt && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Updated {new Date(complaint.updatedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Label component since it wasn't imported
const Label = ({ htmlFor, className, children }) => (
  <label htmlFor={htmlFor} className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}>
    {children}
  </label>
);

export default StudentComplaint;