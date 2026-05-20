import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { SubmissionStatus, UserRole } from "@prisma/client";
import { Book, CheckSquare, Users, Activity } from "lucide-react";

async function getAdminAnalytics() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const totalUsers = await prisma.user.count();
    const totalCourses = await prisma.course.count();
    const totalSubmissions = await prisma.submission.count();
    const activeUsers = await prisma.user.count({
        where: {
            lastLogin: {
                gte: sevenDaysAgo,
            },
        },
    });

    const submissionsByStatus = await prisma.submission.groupBy({
        by: ['status'],
        _count: {
            status: true,
        },
    });

    const statusCounts = {
        SUBMITTED: 0,
        GRADED: 0,
        LATE: 0,
    };

    submissionsByStatus.forEach(item => {
        if (item.status in statusCounts) {
            statusCounts[item.status] = item._count.status;
        }
    });


    return {
        totalUsers,
        totalCourses,
        totalSubmissions,
        activeUsers,
        statusCounts,
    };
}

const StatusBar = ({ status, count, total, colorClass }: { status: string, count: number, total: number, colorClass: string }) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
        <div>
            <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{status}</span>
                <span className="text-sm font-medium text-gray-700">{count}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className={`${colorClass} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};


export default async function AdminDashboardPage() {
    const {
        totalUsers,
        totalCourses,
        totalSubmissions,
        activeUsers,
        statusCounts
    } = await getAdminAnalytics();

    return (
        <>
            <PageHeader title="Admin Dashboard" description="Overview of the entire platform." />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalUsers}</div>
                    </CardContent>
                </Card>
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
                        <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                        <CheckSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalSubmissions}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Users (7d)</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeUsers}</div>
                    </CardContent>
                </Card>
            </div>
            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>Submission Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <StatusBar status="Graded" count={statusCounts.GRADED} total={totalSubmissions} colorClass="bg-green-500" />
                    <StatusBar status="Submitted" count={statusCounts.SUBMITTED} total={totalSubmissions} colorClass="bg-blue-500" />
                    <StatusBar status="Late" count={statusCounts.LATE} total={totalSubmissions} colorClass="bg-red-500" />
                </CardContent>
            </Card>
        </>
    );
}
