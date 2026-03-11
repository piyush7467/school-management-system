import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "@/api/axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, 
  Plus, 
  Users, 
  UserPlus, 
  BookOpen, 
  GraduationCap, 
  Trash2, 
  Eye,
  BookText,
  UserCheck,
  Settings,
  Shield
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ManageSections = () => {
  const { id: classId } = useParams();
  const [sections, setSections] = useState([]);
  const [newSection, setNewSection] = useState("");
  const [loading, setLoading] = useState(false);
  const [className, setClassName] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSections();
  }, [classId]);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/admin/auth/classes/${classId}`);
      setSections(res.data.data.sections || []);
      setClassName(res.data.data.name || "Class");
    } catch (err) {
      console.error(err);
      toast.error("Error fetching sections");
    } finally {
      setLoading(false);
    }
  };

  const addSection = async () => {
    if (!newSection.trim()) {
      toast.error("Please enter a section name");
      return;
    }

    try {
      setLoading(true);
      const res = await API.post(`/admin/auth/classes/${classId}/sections`, { name: newSection });
      const addedSection = res.data.data;
      if (addedSection) {
        setSections((prev) => [...prev, addedSection]);
        setNewSection("");
        toast.success(res.data.message || "Section added successfully");

        setTimeout(() => {
          document.getElementById(`section-${addedSection._id}`)?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        toast.error("Section added but could not update UI");
        fetchSections();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error adding section");
    } finally {
      setLoading(false);
    }
  };

  const deleteSection = async (sectionId) => {
    if (!window.confirm("Are you sure you want to delete this section? This action cannot be undone.")) return;

    try {
      setDeleteLoading(sectionId);
      await API.delete(`/admin/auth/classes/${classId}/sections/${sectionId}/delete`);
      setSections((prev) => prev.filter((s) => s._id !== sectionId));
      toast.success("Section deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error deleting section");
    } finally {
      setDeleteLoading(null);
    }
  };

  const SectionCard = ({ section, index }) => (
    <motion.div
      id={`section-${section._id}`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group"
    >
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl hover:border-blue-200 dark:hover:border-blue-800/50">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            {/* Section Info */}
            <div className="flex items-start gap-4 flex-1">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{section.name}</h3>
                  <Badge 
                    variant="secondary" 
                    className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700"
                  >
                    Active
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge
                    variant="outline"
                    className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 text-xs"
                  >
                    ID: {section._id?.slice(-8)}
                  </Badge>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Created {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
              <Button
                onClick={() => navigate(`/admin/class/${classId}/section/${section._id}/view`)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 rounded-xl border-2 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <Eye className="h-4 w-4" />
                View
              </Button>
              <Button
                onClick={() => navigate(`/admin/class/${classId}/section/${section._id}/subjects`)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 rounded-xl border-2 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
              >
                <BookText className="h-4 w-4" />
                Subjects
              </Button>
              <Button
                onClick={() => navigate(`/admin/class/${classId}/section/${section._id}/teachers`)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 rounded-xl border-2 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              >
                <UserCheck className="h-4 w-4" />
                Teachers
              </Button>
              <Button
                onClick={() => navigate(`/admin/class/${classId}/section/${section._id}/students`)}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Users className="h-4 w-4" />
                Students
              </Button>
              <Button
                onClick={() => deleteSection(section._id)}
                disabled={deleteLoading === section._id}
                variant="destructive"
                size="sm"
                className="flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {deleteLoading === section._id ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              size="sm"
              className="rounded-full h-12 w-12 p-0 flex items-center justify-center border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800 shadow-sm hover:scale-105 transition-all duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Manage Sections
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage sections for <span className="font-semibold text-gray-900 dark:text-white">{className}</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700"
            >
              {sections.length} Sections
            </Badge>
            <Button
              onClick={fetchSections}
              variant="outline"
              size="sm"
              className="rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Add Section & Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Add Section Card */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
                  <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Add New Section
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="section-name" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Section Name
                  </Label>
                  <Input
                    id="section-name"
                    type="text"
                    value={newSection}
                    onChange={(e) => setNewSection(e.target.value)}
                    placeholder="e.g., A, B, Science, Arts..."
                    className="rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 transition-all duration-200"
                    onKeyPress={(e) => e.key === "Enter" && addSection()}
                  />
                </div>
                <motion.div
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                >
                  <Button
                    onClick={addSection}
                    disabled={loading || !newSection.trim()}
                    className="w-full rounded-xl bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Adding...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Plus className="h-5 w-5" />
                        Add Section
                      </div>
                    )}
                  </Button>
                </motion.div>
              </CardContent>
            </Card>

            {/* Class Info Card */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
                  <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Class Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Class Name</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{className}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Sections</span>
                    <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                      {sections.length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                    <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                      Active
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Sections List */}
          <div className="lg:col-span-3">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-t-2xl border-b dark:border-gray-700">
                <CardTitle className="flex items-center gap-3 text-xl text-gray-900 dark:text-white">
                  <GraduationCap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  All Sections
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Manage subjects, teachers, and students for each section
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading sections...</p>
                  </div>
                ) : sections.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Sections Yet</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Get started by adding your first section to {className}
                    </p>
                    <Button
                      onClick={() => document.getElementById('section-name')?.focus()}
                      className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Section
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <AnimatePresence>
                      {sections.map((section, index) => (
                        <SectionCard key={section._id} section={section} index={index} />
                      ))}
                    </AnimatePresence>
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

export default ManageSections;














// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import API from "@/api/axios";
// import { toast } from "sonner";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Label } from "@/components/ui/label";
// import { ArrowLeft, Plus, Users, UserPlus, BookOpen, Shield, GraduationCap, MoreVertical } from "lucide-react";
// import { motion } from "framer-motion";

// const ManageSections = () => {
//   const { id: classId } = useParams();
//   const [sections, setSections] = useState([]);
//   const [newSection, setNewSection] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [className, setClassName] = useState("");
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchSections();
//   }, [classId]);

//   const fetchSections = async () => {
//     try {
//       setLoading(true);
//       const res = await API.get(`/admin/auth/classes/${classId}`);
//       setSections(res.data.data.sections || []);
//       setClassName(res.data.data.name || "Class");
//     } catch (err) {
//       console.error(err);
//       toast.error("Error fetching sections");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const addSection = async () => {
//     if (!newSection.trim()) {
//       toast.error("Please enter a section name");
//       return;
//     }

//     try {
//       setLoading(true);
//       const res = await API.post(`/admin/auth/classes/${classId}/sections`, {
//         name: newSection,
//       });

//       const addedSection = res.data.data.sections[res.data.data.sections.length - 1];
//       setSections([...sections, addedSection]);
//       setNewSection("");
//       toast.success(res.data.message);
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Error adding section");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const SectionCard = ({ section }) => (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.3 }}
//     >
//       <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
//         <CardContent className="p-6">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-4">
//               <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
//                 <BookOpen className="h-6 w-6 text-white" />
//               </div>
//               <div>
//                 <h3 className="text-lg font-bold text-gray-900 dark:text-white">
//                   {section.name}
//                 </h3>
//                 <div className="flex items-center gap-4 mt-1">
//                   <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
//                     Section ID: {section._id?.slice(-6)}
//                   </Badge>
//                 </div>
//               </div>
//             </div>
            
//             <div className="flex items-center gap-2">
//               <Button
//                 onClick={() => navigate(`/admin/class/${classId}/section/${section._id}/view`)}
//                 variant="outline"
//                 className="flex items-center gap-2 rounded-xl border-2 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
//               >
//                 <UserPlus className="h-4 w-4" />
//                 View
//               </Button>
//               <Button
//                 onClick={() => navigate(`/admin/class/${classId}/section/${section._id}/subjects`)}
//                 variant="outline"
//                 className="flex items-center gap-2 rounded-xl border-2 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
//               >
//                 <UserPlus className="h-4 w-4" />
//                 Add subjects
//               </Button>
//               <Button
//                 onClick={() => navigate(`/admin/class/${classId}/section/${section._id}/teachers`)}
//                 variant="outline"
//                 className="flex items-center gap-2 rounded-xl border-2 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
//               >
//                 <UserPlus className="h-4 w-4" />
//                 Assign Teacher
//               </Button>
//               <Button
//                 onClick={() => navigate(`/admin/class/${classId}/section/${section._id}/students`)}
//                 className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
//               >
//                 <Users className="h-4 w-4" />
//                 Manage Students
//               </Button>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </motion.div>
//   );

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 p-4 lg:p-6">
//       <div className="max-w-6xl mx-auto space-y-6">
//         {/* Header Section */}
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//           className="flex items-center justify-between"
//         >
//           <div className="flex items-center gap-4">
//             <Button
//               onClick={() => navigate(-1)}
//               variant="outline"
//               size="sm"
//               className="rounded-full h-12 w-12 p-0 flex items-center justify-center border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800 shadow-sm"
//             >
//               <ArrowLeft className="h-5 w-5" />
//             </Button>
//             <div>
//               <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
//                 Manage Sections
//               </h1>
//               <p className="text-gray-600 dark:text-gray-400 mt-1">
//                 Manage sections for class <span className="font-semibold text-gray-900 dark:text-white">{className}</span>
//               </p>
//             </div>
//           </div>
          
//           <Badge variant="outline" className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
//             {sections.length} Sections
//           </Badge>
//         </motion.div>

//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//           {/* Sidebar - Add Section */}
//           <div className="lg:col-span-1 space-y-6">
//             <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
//               <CardHeader className="pb-3">
//                 <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
//                   <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
//                   Add New Section
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="section-name" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
//                     Section Name
//                   </Label>
//                   <Input
//                     id="section-name"
//                     type="text"
//                     value={newSection}
//                     onChange={(e) => setNewSection(e.target.value)}
//                     placeholder="e.g., A, B, Science, Arts..."
//                     className="rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700"
//                     onKeyPress={(e) => e.key === 'Enter' && addSection()}
//                   />
//                 </div>
//                 <Button
//                   onClick={addSection}
//                   disabled={loading || !newSection.trim()}
//                   className="w-full rounded-xl bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 transition-all duration-300"
//                 >
//                   {loading ? (
//                     <div className="flex items-center justify-center gap-2">
//                       <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                       Adding...
//                     </div>
//                   ) : (
//                     <div className="flex items-center justify-center gap-2">
//                       <Plus className="h-4 w-4" />
//                       Add Section
//                     </div>
//                   )}
//                 </Button>
//               </CardContent>
//             </Card>

//             {/* Quick Stats */}
//             <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
//               <CardHeader className="pb-3">
//                 <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
//                   <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
//                   Quick Info
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-3">
//                   <div className="flex items-center justify-between">
//                     <span className="text-sm text-gray-600 dark:text-gray-400">Total Sections</span>
//                     <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
//                       {sections.length}
//                     </Badge>
//                   </div>
//                   <div className="flex items-center justify-between">
//                     <span className="text-sm text-gray-600 dark:text-gray-400">Class</span>
//                     <span className="text-sm font-medium text-gray-900 dark:text-white">{className}</span>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Main Content - Sections List */}
//           <div className="lg:col-span-3">
//             <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
//               <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-t-2xl border-b dark:border-gray-700">
//                 <CardTitle className="flex items-center gap-3 text-xl text-gray-900 dark:text-white">
//                   <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
//                   All Sections
//                 </CardTitle>
//                 <CardDescription className="text-gray-600 dark:text-gray-400">
//                   Manage teachers and students for each section
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="p-6">
//                 {loading ? (
//                   <div className="text-center py-12">
//                     <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//                     <p className="text-gray-600 dark:text-gray-400">Loading sections...</p>
//                   </div>
//                 ) : sections.length === 0 ? (
//                   <div className="text-center py-12">
//                     <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
//                       <BookOpen className="h-8 w-8 text-gray-400 dark:text-gray-500" />
//                     </div>
//                     <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Sections Yet</h3>
//                     <p className="text-gray-600 dark:text-gray-400 mb-6">
//                       Get started by adding your first section
//                     </p>
//                     <Button
//                       onClick={() => document.getElementById('section-name')?.focus()}
//                       className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
//                     >
//                       <Plus className="h-4 w-4 mr-2" />
//                       Add First Section
//                     </Button>
//                   </div>
//                 ) : (
//                   <div className="space-y-4">
//                     {sections.map((section, index) => (
//                       <SectionCard key={section._id} section={section} />
//                     ))}
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ManageSections;