import React from "react";

const BusList = ({ buses }) => {
  return (
    <div className="overflow-auto rounded-lg shadow-md border mt-4">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bus Number</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver Phone</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bus Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {buses.map(b => (
            <tr key={b._id}>
              <td className="px-6 py-4">{b.busNumber}</td>
              <td className="px-6 py-4">{b.capacity}</td>
              <td className="px-6 py-4">{b.driverName}</td>
              <td className="px-6 py-4">{b.driverPhone}</td>
              <td className="px-6 py-4">{b.busType || "-"}</td>
              <td className="px-6 py-4">{b.routeName || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BusList;
``
