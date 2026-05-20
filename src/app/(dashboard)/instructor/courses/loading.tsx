import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingInstructorCourses() {
  return (
    <div>
      <PageHeader
        title="My Courses"
        description="Manage your courses, assignments, and students."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border rounded-lg p-6 space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex justify-between items-center text-sm text-muted-foreground pt-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}