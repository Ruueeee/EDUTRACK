import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { logActivity } from "@/lib/logger";
import { generateUniqueClassCode as generateClassCode } from "@/lib/classCode";

const createCourseSchema = z.object({
  title: z.string().min(3, "Course title must be at least 3 characters"),
  description: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const courses = await prisma.course.findMany({
      where: {
        OR: [
          { instructorId: session.user.id },
          { enrollments: { some: { userId: session.user.id } } },
        ],
      },
      include: {
        instructor: true,
        _count: {
          select: { enrollments: true },
        },
      },
    });

    return NextResponse.json({ data: courses, error: null });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "INSTRUCTOR") {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createCourseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ data: null, error: parsed.error.message }, { status: 400 });
    }

    const { title, description } = parsed.data;

    const newCourse = await prisma.course.create({
      data: {
        title,
        description: description ?? "",
        instructorId: session.user.id,
        classCode: await generateClassCode(),
      },
    });

    await logActivity(session.user.id, "CREATE_COURSE", { courseId: newCourse.id });

    return NextResponse.json({ data: newCourse, error: null }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}

