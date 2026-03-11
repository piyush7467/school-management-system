import React from "react";

const RouteList = ({ routes }) => {
  return (
    <div className="overflow-auto rounded-lg shadow-md border mt-4">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stops</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timing</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {routes.map(r => (
            <tr key={r._id}>
              <td className="px-6 py-4">{r.routeName}</td>
              <td className="px-6 py-4">{r.source}</td>
              <td className="px-6 py-4">{r.destination}</td>
              <td className="px-6 py-4">
                {r.stops?.length > 0 ? r.stops.join(", ") : "-"}
              </td>
              <td className="px-6 py-4">{r.timing || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RouteList;
