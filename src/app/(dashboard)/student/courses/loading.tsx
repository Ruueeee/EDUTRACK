import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function LoadingStudentCourses() {
  return (
    <div>
      <PageHeader
        title="My Courses"
        description="Here are the courses you are currently enrolled in."
        action={
          <Button disabled>
            Enroll in New Course
          </Button>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border rounded-lg p-6 space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex justify-between items-center pt-4">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}