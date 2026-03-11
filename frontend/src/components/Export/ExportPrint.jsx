import React from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

const ExportPrint = ({ componentRef }) => {
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  return (
    <Button
      onClick={handlePrint}
      variant="outline"
      className="cursor-pointer flex items-center gap-2 rounded-xl border-2 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 font-medium"
    >
      <Printer className="h-4 w-4" />
      Print
    </Button>
  );
};

export default ExportPrint;
