import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const TransportStats = ({ stats }) => {
  const cards = [
    { title: "Total Buses", value: stats.totalBuses, color: "from-blue-500 to-indigo-500" },
    { title: "Active Buses", value: stats.activeBuses, color: "from-green-500 to-emerald-400" },
    { title: "Total Routes", value: stats.totalRoutes, color: "from-purple-500 to-pink-400" },
    { title: "Assignments", value: stats.totalAssignments, color: "from-yellow-500 to-orange-400" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {cards.map((card, i) => (
        <Card key={i} className={`bg-gradient-to-r ${card.color} text-white shadow-lg rounded-2xl`}>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold">{card.title}</h3>
            <p className="text-3xl font-bold">{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TransportStats;
