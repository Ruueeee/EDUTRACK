"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { AnnouncementForm } from "@/components/announcements/AnnouncementForm";
import { AnnouncementCard } from "@/components/announcements/AnnouncementCard";
import { AssignmentForm } from "@/components/assignments/AssignmentForm";
import { RosterTable } from "@/components/instructor/RosterTable";
import { GradeSheet } from "@/components/assignments/GradeSheet";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Announcement, Assignment, Course, Enrollment, User } from "@prisma/client";
import Link from "next/link";
import { format } from "date-fns";

type CourseData = Course & {
    announcements: Announcement[];
    assignments: (Assignment & { _count: { submissions: number } })[];
    enrollments: (Enrollment & { user: User & { _count: { submissions: number } } })[];
};

export default function InstructorCourseDetailsPage({ params }: { params: { courseId: string } }) {
    const [course, setCourse] = useState<CourseData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchCourse = async () => {
            setIsLoading(true);
            const response = await fetch(`/api/courses/${params.courseId}`);
            if (response.ok) {
                const data = await response.json();
                setCourse(data.data);
            } else {
                setCourse(null);
            }
            setIsLoading(false);
        };
        fetchCourse();
    }, [params.courseId]);

    const handlePostAnnouncement = async (values: { title: string; body: string }) => {
        setIsSubmitting(true);
        const response = await fetch('/api/announcements', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...values, courseId: params.courseId }),
        });
        if (response.ok) {
            toast.success("Announcement posted");
            router.refresh();
        } else {
            toast.error("Failed to post announcement");
        }
        setIsSubmitting(false);
    };

    const handleDeleteAnnouncement = async (id: string) => {
        const response = await fetch(`/api/announcements?id=${id}`, {
            method: 'DELETE',
        });
        if (response.ok) {
            toast.success("Announcement deleted");
            router.refresh();
        } else {
            toast.error("Failed to delete announcement");
        }
    };

    if (isLoading) {
        return <div>Loading...</div>
    }

    if (!course) {
        return <div>Course not found.</div>;
    }

    return (
        <>
            <PageHeader title={course.title} description={`Class Code: ${course.classCode}`} />

            <Tabs defaultValue="announcements" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="announcements">Announcements</TabsTrigger>
                    <TabsTrigger value="assignments">Assignments</TabsTrigger>
                    <TabsTrigger value="roster">Roster</TabsTrigger>
                </TabsList>

                <TabsContent value="announcements" className="mt-4 space-y-6">
                    <AnnouncementForm courseId={course.id} onSubmit={handlePostAnnouncement} isSubmitting={isSubmitting} />
                    <div className="space-y-4">
                        {course.announcements.map(ann => (
                            <AnnouncementCard key={ann.id} announcement={ann} onDelete={handleDeleteAnnouncement} />
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="assignments" className="mt-4 space-y-6">
                    <div className="flex justify-end">
                        <AssignmentForm courseId={course.id}>
                            <Button><PlusCircle className="mr-2 h-4 w-4" /> Create Assignment</Button>
                        </AssignmentForm>
                    </div>
                    <div className="space-y-4">
                        {course.assignments.map(assignment => (
                            <Link key={assignment.id} href={`/instructor/courses/${course.id}/assignments/${assignment.id}`}>
                                <Card className="hover:shadow-md transition-shadow">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <CardTitle>{assignment.title}</CardTitle>
                                            <Badge variant="secondary">{assignment._count.submissions} Submissions</Badge>
                                        </div>
                                        <CardDescription>Due: {format(new Date(assignment.dueDate), "PPP p")}</CardDescription>
                                    </CardHeader>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="roster" className="mt-4">
                    <RosterTable students={course.enrollments.map(e => e.user)} />
                </TabsContent>
            </Tabs>
        </>
    );
}
