import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import API from "@/api/axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Bus, MapPin, Clock, User, Phone, Navigation, Route, Calendar, ArrowRight } from "lucide-react";

const MyTransport = () => {
  const { user } = useSelector((state) => state.auth);
  const [transport, setTransport] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTransport = async () => {
    try {
      setLoading(true);
      const res = await API.get("/student/auth/transport/my");
      setTransport(res.data.assignment);
    } catch (err) {
      toast.error("Failed to fetch transport information");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransport();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/20 py-8 px-4 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Loading transport information...</p>
        </div>
      </div>
    );
  }

  if (!transport) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/20 py-8 px-4 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <Bus className="w-12 h-12 text-gray-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">No Transport Assigned</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
            You haven't been assigned to any transport service yet.
          </p>
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 px-4 py-2">
            Contact administration for transport assignment
          </Badge>
        </div>
      </div>
    );
  }

  const transportInfo = [
    {
      icon: Bus,
      label: "Bus Number",
      value: transport.busId?.busNumber || "N/A",
      color: "text-blue-600 dark:text-blue-400"
    },
    {
      icon: Bus,
      label: "Bus Type",
      value: transport.busId?.busType || "N/A",
      color: "text-purple-600 dark:text-purple-400"
    },
    {
      icon: User,
      label: "Driver Name",
      value: transport.busId?.driverName || "N/A",
      color: "text-green-600 dark:text-green-400"
    },
    {
      icon: Phone,
      label: "Driver Phone",
      value: transport.busId?.driverPhone || "N/A",
      color: "text-red-600 dark:text-red-400"
    },
    {
      icon: MapPin,
      label: "Stop",
      value: transport.stop || "N/A",
      color: "text-orange-600 dark:text-orange-400"
    },
    {
      icon: Clock,
      label: "Pickup Time",
      value: transport.pickupTime || "N/A",
      color: "text-cyan-600 dark:text-cyan-400"
    },
    {
      icon: Clock,
      label: "Drop Time",
      value: transport.dropTime || "N/A",
      color: "text-pink-600 dark:text-pink-400"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/20 py-8 px-4 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl mb-4">
            <Bus className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            My Transport
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Your daily transportation schedule and details
          </p>
        </div>

        {/* Main Transport Card */}
        <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="flex items-center justify-center gap-3 text-2xl">
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                <Navigation className="w-6 h-6 text-white" />
              </div>
              Transport Assignment
            </CardTitle>
            <CardDescription className="text-lg">
              Complete details of your assigned transportation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Route Information */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <Route className="w-6 h-6" />
                    <h3 className="text-xl font-semibold">Route Information</h3>
                  </div>
                  <div className="space-y-2">
                    <p className="text-blue-100">
                      <span className="font-semibold">Route:</span> {transport.busId?.route?.routeName || "N/A"}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="bg-white/20 px-3 py-1 rounded-full font-medium">
                        🚩 {transport.busId?.route?.source || "N/A"}
                      </span>
                      <span className="text-white">→</span>
                      <span className="bg-white/20 px-3 py-1 rounded-full font-medium">
                        🎯 {transport.busId?.route?.destination || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge className="bg-white text-blue-600 font-semibold text-sm px-4 py-2">
                  Active
                </Badge>
              </div>
            </div>

            {/* Transport Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {transportInfo.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                  <div className={`p-3 bg-white dark:bg-gray-600 rounded-xl shadow-sm`}>
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{item.label}</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Schedule Timeline */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-2xl shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-6 h-6" />
                <h3 className="text-xl font-semibold">Daily Schedule</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center p-4 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Clock className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm opacity-90">Morning Pickup</p>
                  <p className="text-2xl font-bold">{transport.pickupTime || "N/A"}</p>
                  <p className="text-xs opacity-80 mt-1">Be ready at your stop</p>
                </div>
                <div className="text-center p-4 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Clock className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm opacity-90">Evening Drop</p>
                  <p className="text-2xl font-bold">{transport.dropTime || "N/A"}</p>
                  <p className="text-xs opacity-80 mt-1">Return to your stop</p>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-800 rounded-lg">
                  <Bus className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
                    Transportation Guidelines
                  </h4>
                  <ul className="text-yellow-700 dark:text-yellow-400 text-sm space-y-1">
                    <li>• Arrive at your stop 5 minutes before scheduled pickup time</li>
                    <li>• Maintain discipline and safety while boarding and traveling</li>
                    <li>• Contact driver directly for any immediate concerns</li>
                    <li>• Report any issues to the transport office</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Contact Driver Card */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 backdrop-blur-sm text-center hover:shadow-2xl transition-all duration-300 hover:scale-105 group cursor-pointer">
            <CardContent className="p-6 relative">
              {/* Animated Icon Container */}
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-blue-500/10 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                <div className="relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
                  <Phone className="w-6 h-6 text-white transform group-hover:scale-110 transition-transform duration-200" />
                </div>

                {/* Pulse Animation */}
                <div className="absolute -top-1 -right-1">
                  <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 shadow-lg">
                    <div className="w-full h-full bg-green-400 rounded-full animate-ping opacity-75"></div>
                  </div>
                </div>
              </div>

              {/* Phone Number with Enhanced Styling */}
              <a
                href={`tel:${transport.busId?.driverPhone}`}
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-lg hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200 mb-3 group/phone"
              >
                <span className="bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-700 group-hover/phone:bg-blue-200 dark:group-hover/phone:bg-blue-800/50 transition-colors duration-200">
                  {transport.busId?.driverPhone || "N/A"}
                </span>
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </a>

              {/* Card Title with Gradient Text */}
              <h3 className="font-bold  dark:text-white mb-2 text-lg bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Contact Driver
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Tap to call {transport.busId?.driverName || "the driver"} directly for urgent transportation matters
              </p>

              {/* Additional Info Badge */}
              {transport.busId?.driverName && (
                <div className="mt-4 inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-medium">
                  <User className="w-3 h-3" />
                  {transport.busId.driverName}
                </div>
              )}

              {/* Hover Effect Indicator */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex items-center gap-1 text-xs text-blue-500 dark:text-blue-400 font-medium">
                  <span>Click to call</span>
                  <svg className="w-3 h-3 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>

              {/* Enhanced Border Effect */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none"></div>
            </CardContent>
          </Card>

          {/* View Route Map Card */}
          <a
            href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(transport.busId?.route?.source || '')}&destination=${encodeURIComponent(transport.busId?.route?.destination || '')}&travelmode=driving`}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
          >
            <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 backdrop-blur-sm text-center hover:shadow-2xl transition-all duration-300 hover:scale-105 h-full">
              <CardContent className="p-6 relative">
                {/* Animated Icon Container */}
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-green-500/10 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                  <div className="relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl shadow-lg group-hover:shadow-green-500/25 transition-all duration-300">
                    <MapPin className="w-6 h-6 text-white transform group-hover:scale-110 transition-transform duration-200" />
                  </div>

                  {/* Navigation Animation */}
                  <div className="absolute -top-1 -right-1">
                    <div className="w-4 h-4 bg-orange-500 rounded-full border-2 border-white dark:border-gray-800 shadow-lg">
                      <div className="w-full h-full bg-orange-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* Route Information */}
                {transport.busId?.route && (
                  <div className="mb-3 space-y-2">
                    <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-300 font-semibold text-sm">
                      <span className="bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                        🚩 {transport.busId.route.source}
                      </span>
                      <ArrowRight className="w-4 h-4 text-green-500" />
                      <span className="bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                        🎯 {transport.busId.route.destination}
                      </span>
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                      {transport.busId.route.routeName}
                    </div>
                  </div>
                )}

                {/* Card Title with Gradient Text */}
                <h3 className="font-bold  dark:text-white mb-2 text-lg bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  View Route Map
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Open interactive map with complete route directions and stop locations
                </p>

                {/* Stops Preview */}
                {transport.busId?.route?.stops && transport.busId.route.stops.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium mb-2">
                      <MapPin className="w-3 h-3" />
                      <span>{transport.busId.route.stops.length} stops along route</span>
                    </div>
                    <div className="flex flex-wrap justify-center gap-1 max-w-full">
                      {transport.busId.route.stops.slice(0, 3).map((stop, idx) => (
                        <span
                          key={idx}
                          className="inline-block bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full text-xs truncate max-w-[100px]"
                          title={stop.stopName}
                        >
                          {stop.stopName}
                        </span>
                      ))}
                      {transport.busId.route.stops.length > 3 && (
                        <span className="inline-block bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs">
                          +{transport.busId.route.stops.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Hover Effect Indicator */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center gap-1 text-xs text-green-500 dark:text-green-400 font-medium">
                    <span>Open in Maps</span>
                    <svg className="w-3 h-3 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>

                {/* Enhanced Border Effect */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none"></div>

                {/* Google Maps Badge */}
                <div className="absolute top-3 right-3">
                  <div className="flex items-center gap-1 bg-white dark:bg-gray-700 px-2 py-1 rounded-full shadow-sm border border-gray-200 dark:border-gray-600">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </a>
        </div>
      </div>
    </div>
  );
};

export default MyTransport;