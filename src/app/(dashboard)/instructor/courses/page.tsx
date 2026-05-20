

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { CourseCreateDialog } from "@/components/courses/CourseCreateDialog";
import { PlusCircle, Users, BookOpen } from "lucide-react";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Suspense } from "react";
import { CoursesPageContent } from "@/components/courses/CoursesPageContent";

async function getInstructorCourses(instructorId: string, showArchived: boolean) {
    const courses = await prisma.course.findMany({
        where: {
            instructorId,
            isArchived: showArchived ? undefined : false,
        },
        include: {
            _count: {
                select: {
                    enrollments: true,
                    assignments: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
    return courses;
}

function InstructorCoursesGrid({ courses }: { courses: Awaited<ReturnType<typeof getInstructorCourses>> }) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
                <Link href={`/instructor/courses/${course.id}`} key={course.id}>
                    <Card className="h-full transition-all hover:shadow-md">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                                {course.isArchived && <Badge variant="secondary">Archived</Badge>}
                            </div>
                            <CardDescription className="font-mono text-xs">{course.classCode}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex gap-4 text-sm">
                            <div className="flex items-center gap-1">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span>{course._count.enrollments}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                                <span>{course._count.assignments}</span>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    );
}

export default async function InstructorCoursesPage({ searchParams }: { searchParams: { archived?: string } }) {
    const session = await auth();
    if (!session?.user) {
        return <div>Not authenticated</div>;
    }

    const showArchived = searchParams.archived === 'true';
    const courses = await getInstructorCourses(session.user.id, showArchived);

    return (
        <>
            <PageHeader
                title="My Courses"
                action={
                    <CourseCreateDialog>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create Course
                        </Button>
                    </CourseCreateDialog>
                }
            />

            <div className="mb-4">
                <Suspense fallback={<div>Loading...</div>}>
                    <CoursesPageContent />
                </Suspense>
            </div>

            {courses.length > 0 ? (
                <InstructorCoursesGrid courses={courses} />
            ) : (
                <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed p-12 text-center">
                    <h3 className="text-lg font-semibold">No courses yet</h3>
                    <p className="text-sm text-muted-foreground">
                        Create your first course to get started.
                    </p>
                </div>
            )}
        </>
    );
}
