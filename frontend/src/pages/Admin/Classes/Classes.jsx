import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import API from "@/api/axios";
import { toast } from "sonner";
import { Eye, Edit, Trash2, Search, Plus, Filter, MoreVertical, RefreshCw, AlertCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import ExportCSV from "@/components/Export/ExportCSV";
import ExportPrint from "@/components/Export/ExportPrint";

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [deleteDialog, setDeleteDialog] = useState({ open: false, classId: null, className: "" });
  const [refreshing, setRefreshing] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const printRef = useRef();

  // Fetch classes with sections and students
  const fetchClasses = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setRefreshing(true);
    try {
      const res = await API.get("/admin/auth/classes/");
      setClasses(res.data.classes || []);
    } catch (err) {
      console.error("Failed to fetch classes:", err);
      toast.error("Failed to fetch classes. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();

    const interval = setInterval(() => fetchClasses(false), 10000);
    return () => clearInterval(interval);
  }, [fetchClasses, location.key]);

  // Delete class
  const handleDelete = async (id, name) => {
    try {
      await API.delete(`/admin/auth/classes/${id}/delete`);
      toast.success(`Class ${name} deleted successfully`);
      await fetchClasses();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete class. Please try again.");
    } finally {
      setDeleteDialog({ open: false, classId: null, className: "" });
    }
  };

  const openDeleteDialog = (id, name) => setDeleteDialog({ open: true, classId: id, className: name });

  // Table columns
  const columns = useMemo(() => [
    {
      accessorKey: "name",
      header: "Class Name",
      cell: ({ getValue }) => <span className="font-medium text-gray-900 dark:text-white">{getValue()}</span>,
    },
    {
      id: "sectionsCount",
      header: "Number of Sections",
      cell: ({ row }) => row.original.sections?.length || 0,
    },
    {
      id: "teacher",
      header: "Class Teacher",
      cell: ({ row }) => {
        // Get first teacher from first section's subjects
        const firstSection = row.original.sections?.[0];
        const firstTeacher = firstSection?.subjects?.[0]?.teachers?.[0]?.name;
        return <span className="font-medium text-gray-900 dark:text-white">{firstTeacher || "N/A"}</span>;
      },
    },
    {
      id: "students",
      header: "Number of Students",
      cell: ({ row }) => row.original.sections?.reduce((sum, sec) => sum + (sec.students?.length || 0), 0) || 0,
    },
    {
      id: "sectionsDetails",
      header: "Sections Details",
      cell: ({ row }) => (
        <ul className="list-disc ml-4">
          {row.original.sections?.map(sec => (
            <li key={sec._id}>
              {sec.name} ({sec.students?.length || 0} students) - Teacher: {sec.classTeacher?.name || "N/A"}
            </li>
          ))}
        </ul>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="cursor-pointer rounded-xl">
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48 rounded-xl border dark:border-gray-700 shadow-xl">
              <DropdownMenuItem onClick={() => navigate(`/admin/class/edit/${row.original._id}`)} className="flex items-center gap-2">
                <Edit className="h-4 w-4 text-green-600 dark:text-green-400" /> Edit Class
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/admin/class/${row.original._id}/sections`)} className="flex items-center gap-2">
                <Edit className="h-4 w-4 text-green-600 dark:text-green-400" /> Add Section
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openDeleteDialog(row.original._id, row.original.name)} className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <Trash2 className="h-4 w-4" /> Delete Class
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      enableSorting: false,
    },
  ], [navigate]);

  const table = useReactTable({
    data: classes,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const SkeletonRow = () => (
    <tr>{columns.map((_, i) => <td key={i} className="p-4"><Skeleton className="h-4 w-full rounded-lg" /></td>)}</tr>
  );

  const stats = useMemo(() => ({
    total: classes.length,
    totalSections: classes.reduce((sum, cls) => sum + (cls.sections?.length || 0), 0),
    totalStudents: classes.reduce((sum, cls) => sum + (cls.sections?.reduce((s, sec) => s + (sec.students?.length || 0), 0) || 0), 0),
  }), [classes]);

  return (
    <div className="min-h-screen p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Classes</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage all classes in your school</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => fetchClasses(false)} variant="outline" className="rounded-xl flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button onClick={() => navigate("/admin/class/create")} className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add New Class
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <CardTitle>Total Classes</CardTitle>
          <CardDescription>{stats.total}</CardDescription>
        </Card>
        <Card className="p-4">
          <CardTitle>Total Sections</CardTitle>
          <CardDescription>{stats.totalSections}</CardDescription>
        </Card>
        <Card className="p-4">
          <CardTitle>Total Students</CardTitle>
          <CardDescription>{stats.totalStudents}</CardDescription>
        </Card>
      </div>

      {/* Search & Export */}
      <Card className="p-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex gap-2 flex-1">
          <Search className="h-4 w-4 mt-2" />
          <input
            placeholder="Search classes..."
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            className="flex-1 p-2 border rounded"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-xl flex items-center gap-2">
            <Filter className="h-4 w-4" /> Filter
          </Button>
          <ExportCSV data={classes} fileName="classes" />
          <ExportPrint componentRef={printRef} />
        </div>
      </Card>

      {/* Classes Table */}
      <Card ref={printRef} className="overflow-x-auto rounded-2xl">
        <table className="w-full">
          <thead className="bg-gray-100 dark:bg-gray-800">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="p-4 text-left border-b">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading
              ? Array.from({ length: 7 }).map((_, i) => <SkeletonRow key={i} />)
              : table.getRowModel().rows.length === 0
              ? <tr><td colSpan={columns.length} className="text-center p-8 text-gray-400">No classes found.</td></tr>
              : table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-all">
                  {row.getVisibleCells().map(cell => <td key={cell.id} className="p-4">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}
                </tr>
              ))
            }
          </tbody>
        </table>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialog.open} onOpenChange={() => setDeleteDialog({ open: false, classId: null, className: "" })}>
        <AlertDialogContent className="rounded-2xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-6 w-6" /> Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete class <strong>{deleteDialog.className}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-end gap-2">
            <AlertDialogCancel className="rounded-xl border">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDelete(deleteDialog.classId, deleteDialog.className)} className="bg-red-600 text-white rounded-xl">
              Delete Class
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Classes;
