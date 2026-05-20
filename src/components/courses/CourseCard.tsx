import { Course } from "@prisma/client";
import Link from "next/link";
import type { ComponentType } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CourseCardProps {
  course: Course & { _count: { enrollments: number } };
  role: "INSTRUCTOR" | "STUDENT";
}

type CourseCardComponent = ComponentType<CourseCardProps> & {
  Skeleton: ComponentType;
};

const CourseCardBase = ({ course, role }: CourseCardProps) => {
  return (
    <Link href={`/${role.toLowerCase()}/courses/${course.id}`}>
      <Card className="h-full hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="truncate">{course.title}</CardTitle>
          <CardDescription className="line-clamp-2">{course.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Additional content can go here if needed */}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Badge variant="outline">{course.classCode}</Badge>
          <p className="text-sm text-muted-foreground">
            {course._count.enrollments} student(s)
          </p>
        </CardFooter>
      </Card>
    </Link>
  );
};

const CourseCardSkeleton = () => {
  return (
    <Card className="h-full hover:shadow-md transition-shadow animate-pulse">
      <CardHeader>
        <div className="h-6 w-3/4 bg-muted rounded mb-2" />
        <div className="h-4 w-full bg-muted rounded" />
      </CardHeader>
      <CardContent>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="h-6 w-16 bg-muted rounded" />
        <div className="h-4 w-24 bg-muted rounded" />
      </CardFooter>
    </Card>
  );
};

export const CourseCard = Object.assign(CourseCardBase, {
  Skeleton: CourseCardSkeleton,
}) as CourseCardComponent;

