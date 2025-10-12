"use client";

import { useState } from "react";
import { RefCodeGenerator } from "@/components/ref-code-generator";
import { RefCodeTable } from "@/components/ref-code-table";

export default function RefCodePage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCodeCreated = () => {
    // Increment refreshTrigger to force RefCodeTable to reload
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Reference Codes
        </h1>
        <p className="text-muted-foreground mt-2">
          Generate and manage reference codes for applicants.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <RefCodeGenerator onCodeCreated={handleCodeCreated} />
        <RefCodeTable refreshTrigger={refreshTrigger} />
      </div>
    </div>
  );
}
