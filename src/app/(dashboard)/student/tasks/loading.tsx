import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingStudentTasks() {
  return (
    <div>
      <PageHeader
        title="Task Tracker"
        description="Manage all your assignments from one place."
      />
      <div className="space-y-4">
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
        </div>
        <div className="border rounded-lg">
          <div className="p-4 space-y-4">
            <h3 className="text-lg font-semibold">Overdue</h3>
            {[...Array(1)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4 flex justify-between items-center">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16 ml-auto" />
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 space-y-4">
            <h3 className="text-lg font-semibold">Upcoming</h3>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4 flex justify-between items-center">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}