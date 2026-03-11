import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "@/api/axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, BookOpen, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { setClasses } from "@/redux/slices/classSlice";

const AddClass = () => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { classes } = useSelector((state) => state.classes);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Class name is required");
      return;
    }
    setLoading(true);
    try {
      const res = await API.post("/admin/auth/classes/create", { name });
      if (res.data.success) {
        dispatch(setClasses([...classes, res.data.data]));
        toast.success(res.data.message);
        navigate(`/admin/class/${res.data.data._id}/sections`);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create class.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 p-4 lg:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4 mb-8"
        >
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            size="sm"
            className="rounded-full h-12 w-12 p-0 flex items-center justify-center border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800 shadow-sm"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Create New Class
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Add a new class to your institution</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="lg:col-span-1 space-y-6"
          >
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Class Information</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Create classes to organize students and teachers
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="lg:col-span-2"
          >
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-t-2xl border-b dark:border-gray-700">
                <CardTitle className="flex items-center gap-3 text-xl text-gray-900 dark:text-white">
                  <Plus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  Class Details
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Enter the class information below
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <Label
                      htmlFor="class-name"
                      className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2"
                    >
                      <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      Class Name
                    </Label>
                    <div className="relative">
                      <Input
                        id="class-name"
                        type="text"
                        placeholder="e.g., Grade 10 Science, Mathematics Advanced"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 bg-white dark:bg-gray-700 transition-all duration-200 text-lg"
                        disabled={loading}
                      />
                      <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      This name will be used to identify the class throughout the system
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate(-1)}
                      disabled={loading}
                      className="flex-1 rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200"
                    >
                      Cancel
                    </Button>
                    <motion.div
                      whileHover={{ scale: loading ? 1 : 1.02 }}
                      whileTap={{ scale: loading ? 1 : 0.98 }}
                      className="flex-1"
                    >
                      <Button
                        type="submit"
                        disabled={loading || !name.trim()}
                        className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 text-white font-semibold py-3 relative overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        {loading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Creating Class...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <Plus className="h-5 w-5" />
                            Create Class
                          </div>
                        )}
                      </Button>
                    </motion.div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AddClass;










// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import API from "@/api/axios";
// import { toast } from "sonner";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";
// import { ArrowLeft, Plus, BookOpen, GraduationCap } from "lucide-react";
// import { motion } from "framer-motion";
// import { useDispatch, useSelector } from "react-redux";
// import store from "@/redux/store";
// import { setClasses } from "@/redux/slices/classSlice";

// const AddClass = () => {
//   const [name, setName] = useState("");
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();
//   const dispatch=useDispatch();
//   const {classes}=useSelector(store=>store.classes);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!name.trim()) {
//       toast.error("Class name is required");
//       return;
//     }
//     setLoading(true);
//     try {
//       const res = await API.post("/admin/auth/classes/create", { name });
//       if(res.data.success){
//         setName(""); 
//         dispatch(setClasses([...classes,res.data.data]));
//         // navigate("/admin/class"); 
//         navigate(`/admin/class/${res.data.data._id}/sections`);
//         toast.success(res.data.message);
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error(`Error: ${err.response?.data?.message || err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 p-4 lg:p-6">
//       <div className="max-w-2xl mx-auto">
//         {/* Header Section */}
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//           className="flex items-center gap-4 mb-8"
//         >
//           <Button
//             onClick={() => navigate(-1)}
//             variant="outline"
//             size="sm"
//             className="rounded-full h-12 w-12 p-0 flex items-center justify-center border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800 shadow-sm"
//           >
//             <ArrowLeft className="h-5 w-5" />
//           </Button>
//           <div>
//             <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
//               Create New Class
//             </h1>
//             <p className="text-gray-600 dark:text-gray-400 mt-1">
//               Add a new class to your institution
//             </p>
//           </div>
//         </motion.div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Info Card */}
//           <motion.div
//             initial={{ opacity: 0, x: -20 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.2, duration: 0.5 }}
//             className="lg:col-span-1 space-y-6"
//           >
//             <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
//               <CardContent className="p-6">
//                 <div className="text-center space-y-4">
//                   <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
//                     <GraduationCap className="h-8 w-8 text-white" />
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
//                       Class Information
//                     </h3>
//                     <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
//                       Create classes to organize students and teachers
//                     </p>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

            
//           </motion.div>

//           {/* Form Card */}
//           <motion.div
//             initial={{ opacity: 0, x: 20 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.3, duration: 0.5 }}
//             className="lg:col-span-2"
//           >
//             <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
//               <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-t-2xl border-b dark:border-gray-700">
//                 <CardTitle className="flex items-center gap-3 text-xl text-gray-900 dark:text-white">
//                   <Plus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
//                   Class Details
//                 </CardTitle>
//                 <CardDescription className="text-gray-600 dark:text-gray-400">
//                   Enter the class information below
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="p-6">
//                 <form onSubmit={handleSubmit} className="space-y-6">
//                   <div className="space-y-3">
//                     <Label htmlFor="class-name" className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
//                       <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
//                       Class Name
//                     </Label>
//                     <div className="relative">
//                       <Input
//                         id="class-name"
//                         type="text"
//                         placeholder="e.g., Grade 10 Science, Mathematics Advanced, etc."
//                         value={name}
//                         onChange={(e) => setName(e.target.value)}
//                         className="pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 bg-white dark:bg-gray-700 transition-all duration-200 text-lg"
//                         disabled={loading}
//                       />
//                       <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
//                     </div>
//                     <p className="text-xs text-gray-500 dark:text-gray-400">
//                       This name will be used to identify the class throughout the system
//                     </p>
//                   </div>

//                   <div className="flex flex-col sm:flex-row gap-3 pt-4">
//                     <Button
//                       type="button"
//                       variant="outline"
//                       onClick={() => navigate(-1)}
//                       disabled={loading}
//                       className="flex-1 rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200"
//                     >
//                       Cancel
//                     </Button>
//                     <motion.div
//                       whileHover={{ scale: loading ? 1 : 1.02 }}
//                       whileTap={{ scale: loading ? 1 : 0.98 }}
//                       className="flex-1"
//                     >
//                       <Button
//                         type="submit"
//                         disabled={loading || !name.trim()}
//                         className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 text-white font-semibold py-3 relative overflow-hidden group"
//                       >
//                         <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
//                         {loading ? (
//                           <div className="flex items-center justify-center gap-2">
//                             <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                             Creating Class...
//                           </div>
//                         ) : (
//                           <div className="flex items-center justify-center gap-2">
//                             <Plus className="h-5 w-5" />
//                             Create Class
//                           </div>
//                         )}
//                       </Button>
//                     </motion.div>
//                   </div>
//                 </form>
//               </CardContent>
//             </Card>
//           </motion.div>
//         </div>

//         {/* Progress Indicator */}
//         {/* <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.5 }}
//           className="mt-6 text-center"
//         >
//           <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-full">
//             <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
//             <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
//               Ready to create new class
//             </span>
//           </div>
//         </motion.div> */}
//       </div>
//     </div>
//   );
// };

// export default AddClass;