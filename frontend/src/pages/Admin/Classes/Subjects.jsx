import React, { useState, useEffect } from "react";
import API from "@/api/axios";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const Subjects = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);

  // Fetch all classes
  const fetchClasses = async () => {
    try {
      const res = await API.get("/admin/auth/classes/");
      const cls = res.data.classes || [];
      setClasses(cls);
      if (cls.length) setSelectedClassId(cls[0]._id); // select first class by default
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch classes");
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!name || !code || !selectedClassId) return toast.error("Please fill all fields");

    try {
      setLoading(true);
      const res = await API.post(`/admin/auth/classes/${selectedClassId}/subjects`, { name, code });
      toast.success(res.data.message || "Subject created successfully");
      setName("");
      setCode("");
      setRefresh(prev => !prev);
    } catch (err) {
      console.error(err.response || err);
      toast.error(err.response?.data?.message || "Failed to create subject");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 lg:p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Subject</CardTitle>
          <CardDescription>Fill the subject name, code and select class</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateSubject} className="space-y-4">
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map(cls => (
                  <SelectItem key={cls._id} value={cls._id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="text"
              placeholder="Subject Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              type="text"
              placeholder="Subject Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Subject"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Subjects;
