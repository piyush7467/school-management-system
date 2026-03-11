import React from "react";
import { Button } from "../ui/button";
import { Download } from "lucide-react";

const ExportCSV = ({ data, fileName }) => {
    const handleExport = () => {
        if (!data || data.length === 0) return;

        const headers = Object.keys(data[0]);
        const csvRows = [];

        // Add headers
        csvRows.push(headers.join(","));

        // Add rows
        data.forEach((row) => {
            const values = headers.map((header) => `"${row[header] || ""}"`);
            csvRows.push(values.join(","));
        });

        const csvContent = csvRows.join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", `${fileName || "data"}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <>
            {/* <button
                onClick={handleExport}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
            >
                Export
            </button> */}

            <Button onClick={handleExport} variant="outline" className="cursor-pointer flex items-center gap-2 rounded-xl border-2 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30 font-medium">
                {/* <ExportCSV data={teachers} fileName="teachers_list" /> */}
                {/* <ExportPrint componentRef={printRef} /> */}
                <Download className="h-4 w-4" />
                Export
            </Button>

        </>
    );
};

export default ExportCSV;
