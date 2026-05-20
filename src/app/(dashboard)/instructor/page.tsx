import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, CheckSquare, Users } from "lucide-react";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { SubmissionStatus } from "@prisma/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

async function getInstructorDashboardData(userId: string) {
    const courses = await prisma.course.findMany({
        where: { instructorId: userId },
        include: {
            _count: {
                select: { enrollments: true },
            },
        },
    });

    const courseIds = courses.map(c => c.id);

    const totalStudents = await prisma.enrollment.count({
        where: { courseId: { in: courseIds } },
    });

    const pendingSubmissions = await prisma.submission.findMany({
        where: {
            assignment: {
                courseId: { in: courseIds },
            },
            status: SubmissionStatus.SUBMITTED,
        },
        include: {
            student: { select: { name: true } },
            assignment: { select: { title: true, courseId: true, id: true } },
        },
        orderBy: {
            submittedAt: 'desc',
        },
        take: 5,
    });

    const pendingGradingCount = await prisma.submission.count({
        where: {
            assignment: {
                courseId: { in: courseIds },
            },
            status: SubmissionStatus.SUBMITTED,
        }
    });

    return {
        totalCourses: courses.length,
        totalStudents,
        pendingGradingCount,
        recentSubmissionsToGrade: pendingSubmissions,
    };
}

export default async function InstructorHomePage() {
    const session = await auth();
    if (!session?.user) {
        return <div>Not authenticated</div>;
    }

    const {
        totalCourses,
        totalStudents,
        pendingGradingCount,
        recentSubmissionsToGrade
    } = await getInstructorDashboardData(session.user.id);

    return (
        <>
            <PageHeader title={`Welcome back, ${session.user.name}!`} />
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                        <Book className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalCourses}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalStudents}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Grading</CardTitle>
                        <CheckSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingGradingCount}</div>
                    </CardContent>
                </Card>
            </div>
            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>Recent Submissions to Grade</CardTitle>
                </CardHeader>
                <CardContent>
                    {recentSubmissionsToGrade.length > 0 ? (
                        <ul className="space-y-2">
                            {recentSubmissionsToGrade.map(sub => (
                                <li key={sub.id} className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold">{sub.student.name} - {sub.assignment.title}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Submitted {formatDistanceToNow(sub.submittedAt, { addSuffix: true })}
                                        </p>
                                    </div>
                                    <Button asChild size="sm" variant="outline">
                                        <Link href={`/instructor/courses/${sub.assignment.courseId}/assignments/${sub.assignment.id}`}>
                                            Grade
                                        </Link>
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground">No pending submissions.</p>
                    )}
                </CardContent>
            </Card>
        </>
    );
}
