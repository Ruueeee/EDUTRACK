"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] text-center">
      <div className="p-8 border rounded-lg bg-background max-w-md w-full space-y-4">
        <div className="flex justify-center">
          <AlertTriangle className="w-12 h-12 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold">Oops! Something went wrong.</h2>
        <p className="text-muted-foreground">
          An unexpected error occurred. You can try to refresh the page or
          contact support if the problem persists.
        </p>
        <pre className="text-xs text-destructive-foreground bg-destructive/20 p-3 rounded-md overflow-x-auto">
          {error.message}
        </pre>
        <Button onClick={() => reset()}>Try again</Button>
      </div>
    </div>
  );
}