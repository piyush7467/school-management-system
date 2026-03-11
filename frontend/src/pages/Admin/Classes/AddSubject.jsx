import API from "@/api/axios";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookCheck, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AddSubject = () => {
  const [sections, setSections] = useState([]);
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [subjects, setSubjects] = useState([]); // subjects assigned to this section
  const [allSubjects, setAllSubjects] = useState([]); // subjects for the class
  const [selectedSubjectIds, setSelectedSubjectIds] = useState([]);
  const [loading, setLoading] = useState(false);

  const { id: classId, sectionId } = useParams();
  const navigate = useNavigate();

  // Fetch class data and sections
  const fetchClassData = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/admin/auth/classes/${classId}`);
      const classData = res.data.data;

      setSections(classData.sections || []);

      // Default section selection
      const defaultSection = sectionId || classData.sections[0]?._id;
      if (defaultSection) {
        setSelectedSectionId(defaultSection);
        const section = classData.sections.find((s) => s._id === defaultSection);
        setSubjects(section?.subjects || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch class or sections");
    } finally {
      setLoading(false);
    }
  };

  // Fetch all subjects for this class
  const fetchAllSubjects = async () => {
    if (!classId) return;
    try {
      const res = await API.get(`/admin/auth/classes/${classId}/subjects`);
      setAllSubjects(res.data.subjects || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch subjects");
    }
  };

  useEffect(() => {
    fetchClassData();
    fetchAllSubjects();
  }, [classId, sectionId]);

  // Handle section change
  const handleSectionChange = (e) => {
    const secId = e.target.value;
    setSelectedSectionId(secId);
    const section = sections.find((s) => s._id === secId);
    setSubjects(section?.subjects || []);
    setSelectedSubjectIds([]);
  };

  // Assign subjects to section
  const handleAddSubjects = async (e) => {
    e.preventDefault();
    if (!selectedSubjectIds.length) return toast.error("Select at least one subject");

    try {
      setLoading(true);
      const res = await API.post(
        `/admin/auth/classes/${classId}/sections/${selectedSectionId}/subjects`,
        { subjectIds: selectedSubjectIds }
      );
      setSubjects(res.data.data.subjects || []);
      setSelectedSubjectIds([]);
      toast.success("Subjects added successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to add subjects");
    } finally {
      setLoading(false);
    }
  };

  // Subject card
  const SubjectCard = ({ subject, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border shadow-sm hover:shadow-md transition-all duration-300 group"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
          <BookCheck className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{subject.subject?.name || subject.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs">
              Active
            </Badge>
          </div>
        </div>
        <CheckCircle2 className="h-5 w-5 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button onClick={() => navigate(-1)} variant="outline" size="sm" className="rounded-full h-12 w-12">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Manage Subjects</h1>
          <Badge variant="outline">{subjects.length} Subjects</Badge>
        </div>

        {/* Assign Subjects Form */}
        <Card>
          <CardHeader>
            <CardTitle>Add Subjects to Section</CardTitle>
            <CardDescription>Select subjects from existing collection</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddSubjects} className="space-y-4">
              <Label htmlFor="sections">Select Section</Label>
              <select
                id="sections"
                value={selectedSectionId}
                onChange={handleSectionChange}
                className="w-full border rounded p-2 mb-2"
              >
                {sections.map((sec) => (
                  <option key={sec._id} value={sec._id}>
                    {sec.name}
                  </option>
                ))}
              </select>

              <Label htmlFor="subjects">Select Subjects</Label>
              <select
                id="subjects"
                multiple
                value={selectedSubjectIds}
                onChange={(e) => setSelectedSubjectIds(Array.from(e.target.selectedOptions, (option) => option.value))}
                className="w-full border rounded p-2"
              >
                {allSubjects.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.name}
                  </option>
                ))}
              </select>

              <Button type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add Subject(s)"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Subjects List */}
        <Card>
          <CardHeader>
            <CardTitle>Section Subjects</CardTitle>
            <CardDescription>{subjects.length} subjects</CardDescription>
          </CardHeader>
          <CardContent>
            {subjects.length === 0 ? (
              <p>No subjects yet</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                  {subjects.map((subject, index) => (
                    <SubjectCard key={subject._id || subject.subject?._id} subject={subject} index={index} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddSubject;




// import API from "@/api/axios";
// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { toast } from "sonner";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";
// import { Badge } from "@/components/ui/badge";
// import { ArrowLeft, BookOpen, Plus, BookCheck, GraduationCap, CheckCircle2 } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";

// const AddSubject = () => {
//   const [subjectName, setSubjectName] = useState("");
//   const [subjects, setSubjects] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const { id: classId, sectionId } = useParams();
//   const navigate = useNavigate();
//   const [classInfo, setClassInfo] = useState({});
//   const [sectionInfo, setSectionInfo] = useState({});

//   // Fetch existing subjects and class info
//   const fetchSubjects = async () => {
//     try {
//       setLoading(true);
//       const res = await API.get(`/admin/auth/classes/${classId}`);
//       const classData = res.data.data;
//       setClassInfo(classData);
//       const section = classData.sections.find((s) => s._id === sectionId);
//       if (section) {
//         setSectionInfo(section);
//         setSubjects(section.subjects || []);
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to fetch subjects");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchSubjects();
//   }, [classId, sectionId]);

//   const handleAddSubject = async (e) => {
//     e.preventDefault();
//     if (!subjectName.trim()) {
//       toast.error("Subject name is required");
//       return;
//     }

//     setLoading(true);
//     try {
//       const res = await API.post(
//         `/admin/auth/classes/${classId}/sections/${sectionId}/assign-subject`,
//         { subjects: [subjectName.trim()] }
//       );

//       toast.success("Subject added successfully!");
//       setSubjectName("");
//       setSubjects(res.data.data.subjects);
//     } catch (err) {
//       console.error(err);
//       toast.error(err.response?.data?.message || "Failed to add subject");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const SubjectCard = ({ subject, index }) => (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ delay: index * 0.1 }}
//       className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-all duration-300 group"
//     >
//       <div className="flex items-center gap-3">
//         <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
//           <BookCheck className="h-5 w-5 text-white" />
//         </div>
//         <div className="flex-1">
//           <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
//             {subject.subject}
//           </h3>
//           <div className="flex items-center gap-2 mt-1">
//             <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 text-xs">
//               Active
//             </Badge>
//             <span className="text-xs text-gray-500 dark:text-gray-400">
//               Added {new Date().toLocaleDateString()}
//             </span>
//           </div>
//         </div>
//         <CheckCircle2 className="h-5 w-5 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//       </div>
//     </motion.div>
//   );

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 p-4 lg:p-6">
//       <div className="max-w-4xl mx-auto space-y-6">
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
//                 Manage Subjects
//               </h1>
//               <p className="text-gray-600 dark:text-gray-400 mt-1">
//                 Add and manage subjects for {classInfo.name} - {sectionInfo.name}
//               </p>
//             </div>
//           </div>
          
//           <Badge variant="outline" className="px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700">
//             {subjects.length} Subjects
//           </Badge>
//         </motion.div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Sidebar - Class Info */}
//           <div className="lg:col-span-1 space-y-6">
//             <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
//               <CardContent className="p-6">
//                 <div className="text-center space-y-4">
//                   <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
//                     <GraduationCap className="h-8 w-8 text-white" />
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
//                       {classInfo.name}
//                     </h3>
//                     <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
//                       Section {sectionInfo.name}
//                     </p>
//                   </div>
//                   <div className="space-y-2">
//                     <div className="flex justify-between text-sm">
//                       <span className="text-gray-500 dark:text-gray-400">Total Subjects:</span>
//                       <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
//                         {subjects.length}
//                       </Badge>
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Quick Stats */}
//             <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
//               <CardHeader className="pb-3">
//                 <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
//                   <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
//                   Quick Info
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-3">
//                   <div className="flex items-center justify-between">
//                     <span className="text-sm text-gray-600 dark:text-gray-400">Class</span>
//                     <span className="text-sm font-medium text-gray-900 dark:text-white">{classInfo.name}</span>
//                   </div>
//                   <div className="flex items-center justify-between">
//                     <span className="text-sm text-gray-600 dark:text-gray-400">Section</span>
//                     <span className="text-sm font-medium text-gray-900 dark:text-white">{sectionInfo.name}</span>
//                   </div>
//                   <div className="flex items-center justify-between">
//                     <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
//                     <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
//                       Active
//                     </Badge>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Main Content - Subjects Management */}
//           <div className="lg:col-span-2 space-y-6">
//             {/* Add Subject Form */}
//             <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
//               <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-t-2xl border-b dark:border-gray-700">
//                 <CardTitle className="flex items-center gap-3 text-xl text-gray-900 dark:text-white">
//                   <Plus className="h-6 w-6 text-green-600 dark:text-green-400" />
//                   Add New Subject
//                 </CardTitle>
//                 <CardDescription className="text-gray-600 dark:text-gray-400">
//                   Add a new subject to this section
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="p-6">
//                 <form onSubmit={handleAddSubject} className="space-y-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="subject-name" className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
//                       <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
//                       Subject Name
//                     </Label>
//                     <Input
//                       id="subject-name"
//                       type="text"
//                       placeholder="e.g., Mathematics, Science, English, Computer Science..."
//                       value={subjectName}
//                       onChange={(e) => setSubjectName(e.target.value)}
//                       className="rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-lg py-3"
//                       disabled={loading}
//                     />
//                   </div>
                  
//                   <motion.div
//                     whileHover={{ scale: loading ? 1 : 1.02 }}
//                     whileTap={{ scale: loading ? 0.98 : 1 }}
//                   >
//                     <Button
//                       type="submit"
//                       disabled={loading || !subjectName.trim()}
//                       className="w-full rounded-xl bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 text-white font-semibold py-3 relative overflow-hidden group"
//                     >
//                       <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
//                       {loading ? (
//                         <div className="flex items-center justify-center gap-2">
//                           <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                           Adding Subject...
//                         </div>
//                       ) : (
//                         <div className="flex items-center justify-center gap-2">
//                           <Plus className="h-5 w-5" />
//                           Add Subject
//                         </div>
//                       )}
//                     </Button>
//                   </motion.div>
//                 </form>
//               </CardContent>
//             </Card>

//             {/* Subjects List */}
//             <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
//               <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-t-2xl border-b dark:border-gray-700">
//                 <CardTitle className="flex items-center gap-3 text-xl text-gray-900 dark:text-white">
//                   <BookCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
//                   Section Subjects
//                 </CardTitle>
//                 <CardDescription className="text-gray-600 dark:text-gray-400">
//                   {subjects.length} subjects available in this section
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="p-6">
//                 {loading ? (
//                   <div className="text-center py-12">
//                     <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//                     <p className="text-gray-600 dark:text-gray-400">Loading subjects...</p>
//                   </div>
//                 ) : subjects.length === 0 ? (
//                   <div className="text-center py-12">
//                     <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
//                       <BookOpen className="h-8 w-8 text-gray-400 dark:text-gray-500" />
//                     </div>
//                     <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Subjects Yet</h3>
//                     <p className="text-gray-600 dark:text-gray-400 mb-6">
//                       Get started by adding your first subject to this section
//                     </p>
//                     <Button
//                       onClick={() => document.getElementById('subject-name')?.focus()}
//                       className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
//                     >
//                       <Plus className="h-4 w-4 mr-2" />
//                       Add First Subject
//                     </Button>
//                   </div>
//                 ) : (
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <AnimatePresence>
//                       {subjects.map((subject, index) => (
//                         <SubjectCard key={subject._id || subject.subject} subject={subject} index={index} />
//                       ))}
//                     </AnimatePresence>
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

// export default AddSubject;