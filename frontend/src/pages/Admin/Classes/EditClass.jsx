import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "@/api/axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, BookOpen, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

const EditClass = () => {
  const { id } = useParams(); // class ID from route
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const navigate = useNavigate();

  // Fetch class details
  useEffect(() => {
    const fetchClass = async () => {
      setFetching(true);
      try {
        const res = await API.get(`/admin/auth/classes/${id}`);
        if (res.data.success && res.data.data) {
          setName(res.data.data.name || "");
        } else {
          toast.error("Class not found");
          navigate("/admin/classes");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch class data");
        navigate("/admin/classes");
      } finally {
        setFetching(false);
      }
    };

    fetchClass();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Class name is required");
      return;
    }
    setLoading(true);
    try {
      const res = await API.put(`/admin/auth/classes/${id}/update`, { name });
      if (res.data.success) {
        toast.success(res.data.message || "Class updated successfully");
        navigate("/admin/class");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update class.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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
              Edit Class
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Update the class information</p>
          </div>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-t-2xl border-b dark:border-gray-700">
              <CardTitle className="flex items-center gap-3 text-xl text-gray-900 dark:text-white">
                <Plus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                Class Details
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Update the class information below
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
                      placeholder="e.g., Grade 10 Science"
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
                      {loading ? "Updating..." : "Update Class"}
                    </Button>
                  </motion.div>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default EditClass;
