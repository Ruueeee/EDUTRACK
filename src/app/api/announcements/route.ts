import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { logActivity } from "@/lib/logger";

const announcementSchema = z.object({
  courseId: z.string(),
  title: z.string().min(1),
  body: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "INSTRUCTOR") {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = announcementSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ data: null, error: parsed.error.message }, { status: 400 });
    }
    
    const { courseId, title, body } = parsed.data;

    // Verify the user is the instructor of the course
    const course = await prisma.course.findFirst({
        where: {
            id: courseId,
            instructorId: session.user.id,
        }
    });

    if (!course) {
        return NextResponse.json({ data: null, error: "Course not found or you are not the instructor." }, { status: 404 });
    }

    const announcement = await prisma.announcement.create({
      data: {
        courseId,
        title,
        body,
      },
    });

    await logActivity(session.user.id, "POST_ANNOUNCEMENT", { announcementId: announcement.id, courseId });

    return NextResponse.json({ data: announcement, error: null }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}

