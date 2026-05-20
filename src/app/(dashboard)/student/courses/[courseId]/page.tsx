import { PageHeader } from "@/components/layout/PageHeader";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { AssignmentCard } from "@/components/assignments/AssignmentCard";

async function getCourseDetails(courseId: string, userId: string) {
    const enrollment = await prisma.enrollment.findUnique({
        where: {
            userId_courseId: {
                userId: userId,
                courseId: courseId,
            },
        },
        include: {
            course: {
                include: {
                    instructor: { select: { name: true } },
                    announcements: { orderBy: { createdAt: 'desc' } },
                    assignments: {
                        include: {
                            submissions: {
                                where: { studentId: userId }
                            }
                        },
                        orderBy: { dueDate: 'asc' }
                    }
                }
            }
        }
    });

    if (!enrollment) {
        return null;
    }

    return enrollment.course;
}


export default async function StudentCourseDetailsPage({ params }: { params: { courseId: string } }) {
    const session = await auth();
    if (!session?.user) {
        return <div>Not authenticated</div>;
    }

    const course = await getCourseDetails(params.courseId, session.user.id);

    if (!course) {
        notFound();
    }

    return (
        <>
            <PageHeader title={course.title} description={`Instructor: ${course.instructor.name}`} />

            <Tabs defaultValue="announcements" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="announcements">Announcements</TabsTrigger>
                    <TabsTrigger value="assignments">Assignments</TabsTrigger>
                </TabsList>
                <TabsContent value="announcements" className="mt-4">
                    <div className="space-y-4">
                        {course.announcements.length > 0 ? (
                            course.announcements.map(announcement => (
                                <Card key={announcement.id}>
                                    <CardHeader>
                                        <CardDescription>
                                            Posted on {format(new Date(announcement.createdAt), "PPP")}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="whitespace-pre-wrap">{announcement.body}</p>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">No announcements for this course yet.</p>
                            </div>
                        )}
                    </div>
                </TabsContent>
                <TabsContent value="assignments" className="mt-4">
                    <div className="space-y-4">
                        {course.assignments.length > 0 ? (
                            course.assignments.map((assignment) => {
                                const submission = assignment.submissions[0];
                                const isOverdue = new Date(assignment.dueDate) < new Date();
                                const submissionStatus = submission?.status ?? (isOverdue ? "LATE" : "PENDING");

                                return (
                                    <AssignmentCard
                                        key={assignment.id}
                                        assignment={assignment}
                                        submissionStatus={submissionStatus}
                                    />
                                );
                            })
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">No assignments for this course yet.</p>
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </>
    );
}
