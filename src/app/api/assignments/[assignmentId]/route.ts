import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logActivity } from "@/lib/logger";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ assignmentId: string }> }
) {
    try {
        const session = await auth();
        if (!session || session.user.role !== "INSTRUCTOR") {
            return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
        }

        const { assignmentId } = await params;

        const assignment = await prisma.assignment.findUnique({
            where: { id: assignmentId },
            include: {
                submissions: {
                    include: {
                        student: true,
                    },
                },
            },
        });

        if (!assignment) {
            return NextResponse.json({ data: null, error: "Assignment not found" }, { status: 404 });
        }

        // Verify instructor ownership
        const course = await prisma.course.findUnique({
            where: { id: assignment.courseId },
        });

        if (!course || course.instructorId !== session.user.id) {
            return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
        }

        await logActivity(session.user.id, "VIEW_ASSIGNMENT_DETAILS", { assignmentId });

        return NextResponse.json({ data: assignment, error: null });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
    }
}
