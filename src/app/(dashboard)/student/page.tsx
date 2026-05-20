import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpenCheck, CheckCircle, Clock } from "lucide-react";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { redirect } from "next/navigation";

async function getStudentDashboardData(userId: string) {
    const enrollments = await prisma.enrollment.findMany({
        where: { userId: userId },
        include: {
            course: {
                include: {
                    announcements: {
                        orderBy: { createdAt: 'desc' },
                        take: 3,
                    },
                    assignments: {
                        where: {
                            dueDate: {
                                gte: new Date(),
                            },
                        },
                        orderBy: {
                            dueDate: 'asc',
                        },
                        take: 3,
                    },
                },
            },
        },
    });

    const courses = enrollments.map(e => e.course);

    const allAssignments = await prisma.assignment.findMany({
        where: {
            courseId: {
                in: courses.map(c => c.id)
            }
        },
        include: {
            submissions: {
                where: {
                    studentId: userId,
                }
            }
        }
    });

    const pendingTasks = allAssignments.filter(a => a.submissions.length === 0 && new Date(a.dueDate) > new Date());
    const submittedThisWeek = allAssignments.flatMap(a => a.submissions).filter(s => {
        if (!s.submittedAt) return false;
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return new Date(s.submittedAt) >= oneWeekAgo;
    });

    const recentAnnouncements = courses.flatMap(c => c.announcements).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3);
    const upcomingDeadlines = courses.flatMap(c => c.assignments).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).slice(0, 3);


    return {
        enrolledCoursesCount: courses.length,
        pendingTasksCount: pendingTasks.length,
        submittedThisWeekCount: submittedThisWeek.length,
        recentAnnouncements,
        upcomingDeadlines,
    };
}

export default async function StudentHomePage() {
    const session = await auth();
    if (!session?.user) {
        return redirect("/login");
    }

    const stats = await getStudentDashboardData(session.user.id);

    return (
        <div className="space-y-6">
            <PageHeader title={`Welcome back, ${session.user.name}!`} />
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Enrolled Courses
                        </CardTitle>
                        <BookOpenCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.enrolledCoursesCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingTasksCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Submitted This Week
                        </CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.submittedThisWeekCount}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Announcements</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {stats.recentAnnouncements.length > 0 ? (
                            stats.recentAnnouncements.map((announcement: any) => (
                                <div key={announcement.id}>
                                    <h4 className="font-semibold">{announcement.title}</h4>
                                    <p className="text-sm text-muted-foreground">{announcement.body.substring(0, 100)}...</p>
                                    <p className="text-xs text-muted-foreground pt-1">{format(new Date(announcement.createdAt), "PPP")}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">No recent announcements.</p>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Upcoming Deadlines</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {stats.upcomingDeadlines.length > 0 ? (
                            stats.upcomingDeadlines.map((assignment: any) => (
                                <div key={assignment.id} className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-semibold">{assignment.title}</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Due: {format(new Date(assignment.dueDate), "PPP p")}
                                        </p>
                                    </div>
                                    <Link href={`/student/courses/${assignment.courseId}`}>
                                        <Badge>View</Badge>
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">No upcoming deadlines.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
