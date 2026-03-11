import React from "react";

const AssignmentList = ({ assignments }) => {
  return (
    <div className="overflow-auto rounded-lg shadow-md border mt-4">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bus Number</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stop</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pickup Time</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {assignments.map(a => (
            <tr key={a._id}>
              <td className="px-6 py-4">{a.studentName || "-"}</td>
              <td className="px-6 py-4">{a.busNumber || "-"}</td>
              <td className="px-6 py-4">{a.driverName || "-"}</td>
              <td className="px-6 py-4">{a.stop || "-"}</td>
              <td className="px-6 py-4">{a.pickupTime || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AssignmentList;
