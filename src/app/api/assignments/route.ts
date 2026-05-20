import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { logActivity } from "@/lib/logger";

const assignmentSchema = z.object({
  courseId: z.string(),
  title: z.string().min(3),
  description: z.string().optional(),
  dueDate: z.string().datetime(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "INSTRUCTOR") {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = assignmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ data: null, error: parsed.error.message }, { status: 400 });
    }

    // Verify the user is the instructor of the course
    const course = await prisma.course.findFirst({
        where: {
            id: parsed.data.courseId,
            instructorId: session.user.id,
        }
    });

    if (!course) {
        return NextResponse.json({ data: null, error: "Course not found or you are not the instructor." }, { status: 404 });
    }

    const assignment = await prisma.assignment.create({
      data: {
        courseId: parsed.data.courseId,
        title: parsed.data.title,
        description: parsed.data.description ?? "",
        dueDate: new Date(parsed.data.dueDate),
      },
    });

    await logActivity(session.user.id, "CREATE_ASSIGNMENT", { assignmentId: assignment.id, courseId: assignment.courseId });

    return NextResponse.json({ data: assignment, error: null }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}

