import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import API from "@/api/axios";
import { toast } from "sonner";
import {
  Eye, Edit, Trash2, Search, Plus, Filter, MoreVertical,
  Users, Shield, Clock, Mail, Phone, BookOpen, GraduationCap,
  UserCheck, TrendingUp, RefreshCw, AlertCircle, ChevronDown, ChevronUp
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import userLogo from '../../../assets/user.jpg';
import ExportCSV from "@/components/Export/ExportCSV";
import ExportPrint from "@/components/Export/ExportPrint";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [deleteDialog, setDeleteDialog] = useState({ open: false, studentId: null, studentName: "" });
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();
  const printRef = useRef();

  // Memoized data fetch with error handling
  const fetchStudents = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setRefreshing(true);

    try {
      const res = await API.get("/admin/auth/students/getstudent");
      setStudents(res.data.students || []);
    } catch (err) {
      console.error("Failed to fetch students:", err);
      toast.error(`Failed to fetch students. ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Filter students based on active tab
  const filteredStudents = useMemo(() => {
    switch (activeTab) {
      case "active":
        return students.filter(student => student.status === "active");
      case "inactive":
        return students.filter(student => student.status === "inactive");
      default:
        return students;
    }
  }, [students, activeTab]);

  // Delete student with confirmation dialog
  const handleDelete = async (id, name) => {
    try {
      await API.delete(`/admin/auth/students/student/${id}/delete`);
      setStudents((prev) => prev.filter((t) => t._id !== id));
      toast.success(`Student ${name} deleted successfully`);
    } catch (err) {
      console.error("Failed to delete student:", err);
      toast.error("Failed to delete student. Please try again.");
    } finally {
      setDeleteDialog({ open: false, studentId: null, studentName: "" });
    }
  };

  const openDeleteDialog = (id, name) => {
    setDeleteDialog({ open: true, studentId: id, studentName: name });
  };

  // Enhanced columns with better performance
  const columns = useMemo(() => [
    {
      accessorKey: "profilePic",
      header: "",
      cell: ({ getValue, row }) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <div className="w-14 h-14 rounded-2xl border-4 border-white dark:border-gray-800 shadow-lg overflow-hidden transition-all duration-300 group-hover:scale-105">
                    <img
                      src={getValue() || userLogo}
                      alt={row.original.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 transition-all ${row.original.status === "active"
                      ? "bg-green-500 shadow-lg shadow-green-500/30"
                      : "bg-red-500 shadow-lg shadow-red-500/30"
                    }`} />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Click to view profile</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
      size: 90,
      enableSorting: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent p-0 font-bold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          Student Name
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ChevronDown className="ml-2 h-4 w-4" />
          ) : (
            <MoreVertical className="ml-2 h-4 w-4 opacity-50" />
          )}
        </Button>
      ),
      cell: ({ row }) => {
        const studentName = row.original.firstName && row.original.lastName
          ? `${row.original.firstName} ${row.original.lastName}`
          : row.original.name || "Unknown Student";

        return (
          <div className="min-w-[200px]">
            <div className="font-bold text-gray-900 dark:text-white text-lg truncate hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
              {studentName}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">
                <Mail className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                <span className="text-xs truncate max-w-[120px]">{row.original.email}</span>
              </div>
              {row.original.phone && (
                <div className="flex items-center gap-1 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                  <Phone className="h-3 w-3 text-green-600 dark:text-green-400" />
                  <span className="text-xs">{row.original.phone}</span>
                </div>
              )}
            </div>
          </div>
        );
      },
      size: 280,
    },
    {
      accessorKey: "username",
      header: "Username",
      cell: ({ getValue }) => (
        <Badge
          variant="secondary"
          className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium px-3 py-1.5 rounded-full border-0 shadow-sm hover:shadow-md transition-shadow"
        >
          @{getValue()}
        </Badge>
      ),
      size: 120,
    },


    {
      accessorFn: (row) => row.classId?.name, // read populated class name
      id: "class",
      header: "Class",
      cell: ({ getValue }) => (
        <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-700/50">
          <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-blue-700 dark:text-blue-300 font-medium">
            {getValue() || "N/A"}
          </span>
        </div>
      ),
      size: 80,
    },
    {
      accessorFn: (row) => row.sectionId?.name, // read populated section name
      id: "section",
      header: "Section",
      cell: ({ getValue }) => (
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-200 dark:border-green-700/50">
          <span className="font-bold text-green-700 dark:text-green-300 text-lg">
            {getValue() || "-"}
          </span>
        </div>
      ),
      size: 80,
    },




    {
      accessorKey: "parentName",
      header: "Parent",
      cell: ({ getValue }) => (
        <div className="text-sm text-gray-700 dark:text-gray-300 font-medium">
          {getValue() || "N/A"}
        </div>
      ),
      size: 120,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => (
        <Badge
          className={`
            font-medium text-xs px-3 py-1.5 rounded-full border-0 shadow-sm transition-all duration-300
            ${getValue() === "active"
              ? "bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 text-emerald-800 dark:text-emerald-200 shadow-emerald-500/20 hover:shadow-emerald-500/30"
              : "bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 text-red-800 dark:text-red-200 shadow-red-500/20 hover:shadow-red-500/30"
            }
          `}
        >
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${getValue() === "active" ? "bg-emerald-500" : "bg-red-500"}`} />
            {getValue() === "active" ? "Active" : "Inactive"}
          </div>
        </Badge>
      ),
      size: 100,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button variant="ghost" size="icon" className="h-9 w-9 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all hover:scale-105">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl">
              <DropdownMenuItem
                onClick={() => navigate(`/admin/student/view/${row.original._id}`)}
                className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-gray-700 dark:text-gray-300">View Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate(`/admin/student/edit/${row.original._id}`)}
                className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
              >
                <Edit className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-gray-700 dark:text-gray-300">Edit Student</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => openDeleteDialog(row.original._id, row.original.name)}
                className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Student</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      size: 90,
      enableSorting: false,
    },
  ], [navigate]);

  const table = useReactTable({
    data: filteredStudents,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // Enhanced Statistics
  const stats = useMemo(() => {
    const activeStudents = students.filter(t => t.status === "active").length;
    const inactiveStudents = students.length - activeStudents;
    const recentStudents = students.filter(t => {
      const joinDate = new Date(t.joiningDate || t.createdAt);
      const daysAgo = (new Date() - joinDate) / (1000 * 60 * 60 * 24);
      return daysAgo <= 30;
    }).length;

    return {
      total: students.length,
      active: activeStudents,
      inactive: inactiveStudents,
      recent: recentStudents,
      activePercentage: students.length ? Math.round((activeStudents / students.length) * 100) : 0,
      inactivePercentage: students.length ? Math.round((inactiveStudents / students.length) * 100) : 0,
    };
  }, [students]);

  // Skeleton loader
  const SkeletonRow = () => (
    <tr>
      {columns.map((_, index) => (
        <td key={index} className="p-4">
          <Skeleton className="h-4 w-full rounded-lg" />
        </td>
      ))}
    </tr>
  );

  const StatCard = ({ icon: Icon, title, value, description, trend, color }) => (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white/80 to-white/60 dark:from-gray-800/80 dark:to-gray-900/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              {title}
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {value}
            </p>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${color === "green" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" :
                  color === "red" ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300" :
                    "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                }`}>
                {description}
              </span>
              {trend && (
                <span className={`text-xs flex items-center gap-1 ${trend > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  }`}>
                  <TrendingUp className={`h-3 w-3 ${trend > 0 ? "" : "rotate-180"}`} />
                  {Math.abs(trend)}%
                </span>
              )}
            </div>
          </div>
          <div className={`p-3 rounded-2xl bg-gradient-to-br ${color} shadow-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/10 dark:to-indigo-900/10 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Student Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Manage all students in your institution with ease
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => fetchStudents(false)}
              variant="outline"
              disabled={refreshing}
              className="flex items-center gap-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={() => navigate("/admin/student/create")}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 text-white"
            >
              <Plus className="h-4 w-4" />
              Add New Student
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            icon={Users}
            title="Total Students"
            value={stats.total}
            description="All registered"
            color="from-blue-500 to-blue-600"
            colorClass="blue"
          />
          <StatCard
            icon={Shield}
            title="Active Students"
            value={stats.active}
            description={`${stats.activePercentage}% active`}
            trend={+5}
            color="from-green-500 to-emerald-600"
            colorClass="green"
          />
          <StatCard
            icon={Clock}
            title="Inactive Students"
            value={stats.inactive}
            description={`${stats.inactivePercentage}% inactive`}
            color="from-red-500 to-pink-600"
            colorClass="red"
          />
          <StatCard
            icon={UserCheck}
            title="New This Month"
            value={stats.recent}
            description="Recent admissions"
            trend={+12}
            color="from-purple-500 to-indigo-600"
            colorClass="purple"
          />
        </div>

        {/* Search and Actions Section */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
                <div className="relative flex-1 sm:max-w-md">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                  <Input
                    placeholder="Search students by name, email, or class..."
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="pl-12 pr-4 py-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 transition-colors bg-white dark:bg-gray-900"
                  />
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                  <TabsList className="grid grid-cols-3 w-full sm:w-auto bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                    <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900">
                      All ({students.length})
                    </TabsTrigger>
                    <TabsTrigger value="active" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900">
                      Active ({stats.active})
                    </TabsTrigger>
                    <TabsTrigger value="inactive" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900">
                      Inactive ({stats.inactive})
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                <Button variant="outline" size="sm" className="flex items-center gap-2 rounded-xl border-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
                <ExportCSV data={filteredStudents} fileName="students" />
                <ExportPrint componentRef={printRef} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-b dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-gray-900 dark:text-white">Student Directory</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  {filteredStudents.length} students found {globalFilter && `matching "${globalFilter}"`}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="mt-2 sm:mt-0 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-0">
                {table.getFilteredRowModel().rows.length} showing
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto" ref={printRef}>
              <table className="w-full">
                <thead className="bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm border-b dark:border-gray-700">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r last:border-r-0 dark:border-gray-600"
                          style={{ width: header.getSize() }}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                  {loading ? (
                    Array.from({ length: 7 }).map((_, index) => (
                      <SkeletonRow key={index} />
                    ))
                  ) : table.getRowModel().rows.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length} className="px-6 py-16 text-center">
                        <div className="text-gray-400 dark:text-gray-500">
                          <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-semibold mb-2">No students found</p>
                          <p className="text-sm">
                            {globalFilter ? "Try adjusting your search criteria" : "Get started by adding your first student"}
                          </p>
                          {!globalFilter && (
                            <Button
                              onClick={() => navigate("/admin/student/create")}
                              className="mt-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Student
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-all duration-200 group"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-6 py-4 whitespace-nowrap group-hover:bg-white/50 dark:group-hover:bg-gray-900/50 transition-colors">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        {!loading && table.getPageCount() > 1 && (
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {table.getRowModel().rows.length} of {filteredStudents.length} students
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="rounded-lg border-2"
                  >
                    Previous
                  </Button>
                  <span className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg font-medium">
                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="rounded-lg border-2"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={() => setDeleteDialog({ open: false, studentId: null, studentName: "" })}>
        <AlertDialogContent className="border-0 shadow-2xl rounded-2xl bg-white dark:bg-gray-900">
          <AlertDialogHeader className="p-6">
            <AlertDialogTitle className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <AlertCircle className="h-6 w-6" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400 text-base">
              Are you sure you want to delete student <strong className="text-gray-900 dark:text-white">{deleteDialog.studentName}</strong>?
              This action cannot be undone and all associated data will be permanently removed from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="p-6 pt-0">
            <AlertDialogCancel className="rounded-xl border-2">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(deleteDialog.studentId, deleteDialog.studentName)}
              className="bg-red-600 hover:bg-red-700 rounded-xl text-white"
            >
              Delete Student
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Students;