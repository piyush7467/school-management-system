import React from "react";
import { useSelector } from "react-redux";
import Announcement from "@/components/Announcement";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Megaphone, Bell, Calendar, Users } from "lucide-react";

const TeacherAnnouncement = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/20 py-8 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-xl mb-4">
            <Megaphone className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Announcements
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Stay updated with the latest announcements and events for teachers
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">New</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Recent Updates</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl">
                  <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">Events</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Meetings & Schedules</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-2xl">
                  <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">Important</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Admin Notices</p>
                </div>
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-2xl">
                  <Users className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Announcements Container */}
        <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <Megaphone className="w-5 h-5 text-white" />
              </div>
              Latest Announcements
            </CardTitle>
            <CardDescription className="text-lg">
              Important updates and notifications for teachers
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Announcement 
              role={user?.role?.toLowerCase() || "teacher"} 
              className="rounded-lg"
            />
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            💡 Tip: Check regularly for meeting schedules and admin announcements
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeacherAnnouncement;
