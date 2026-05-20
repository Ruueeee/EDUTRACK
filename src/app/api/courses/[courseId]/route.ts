import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logActivity } from "@/lib/logger";
import { z } from "zod";

const updateCourseSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await params;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: true,
        assignments: {
          include: {
            _count: {
              select: { submissions: true },
            },
          },
        },
        announcements: true,
        enrollments: {
          include: {
            user: {
              include: {
                _count: {
                  select: { submissions: true },
                },
              },
            },
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ data: null, error: "Course not found" }, { status: 404 });
    }
    
    await logActivity(session.user.id, "VIEW_COURSE", { courseId });

    return NextResponse.json({ data: course, error: null });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "INSTRUCTOR") {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await params;

    const body = await req.json();
    const parsed = updateCourseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ data: null, error: parsed.error.message }, { status: 400 });
    }

    const existing = await prisma.course.findFirst({
      where: { id: courseId, instructorId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ data: null, error: "Course not found" }, { status: 404 });
    }

    const course = await prisma.course.update({
      where: { id: courseId },
      data: parsed.data,
    });

    return NextResponse.json({ data: course, error: null });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const session = await auth();
        if (!session || session.user.role !== "INSTRUCTOR") {
            return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
        }

    const { courseId } = await params;

    const existing = await prisma.course.findFirst({
      where: { id: courseId, instructorId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ data: null, error: "Course not found" }, { status: 404 });
    }

        await prisma.course.delete({
      where: { id: courseId },
        });

        return NextResponse.json({ data: { message: "Course deleted" }, error: null });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
    }
}

