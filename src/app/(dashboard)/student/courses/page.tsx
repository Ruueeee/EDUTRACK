"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/courses/CourseCard";
import { EnrollDialog } from "@/components/courses/EnrollDialog";
import { PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function StudentCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCourses = () => {
    setIsLoading(true);
    fetch("/api/courses")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          toast.error(data.error);
          setCourses([]);
        } else {
          setCourses(data.data ?? []);
        }
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <>
      <PageHeader
        title="My Courses"
        description="Here are the courses you are currently enrolled in."
      >
        <EnrollDialog onEnrolled={fetchCourses}>
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Enroll in Course
          </Button>
        </EnrollDialog>
      </PageHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
            <CourseCard.Skeleton key={i} />
          ))
          : courses.map((course) => (
            <CourseCard key={course.id} course={course} role="STUDENT" />
          ))}
      </div>
    </>
  );
}
