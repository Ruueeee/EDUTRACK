import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center bg-background">
      <div className="p-8 space-y-4">
        <div className="flex justify-center">
          <FileQuestion className="w-16 h-16 text-muted-foreground" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">404 - Page Not Found</h1>
        <p className="text-lg text-muted-foreground max-w-md">
          Sorry, we couldn't find the page you were looking for. It might have been moved, deleted, or maybe you just mistyped the URL.
        </p>
        <Button asChild>
          <Link href="/">Go back to Home</Link>
        </Button>
      </div>
    </div>
  );
}