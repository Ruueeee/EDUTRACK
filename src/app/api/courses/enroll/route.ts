import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logActivity } from "@/lib/logger";
import { z } from "zod";

const enrollByCodeSchema = z.object({
  classCode: z.string().min(1, "Class code is required"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const parsed = enrollByCodeSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: parsed.error.message },
        { status: 400 }
      );
    }

    const classCode = parsed.data.classCode.trim();

    const course = await prisma.course.findFirst({
      where: { classCode, isArchived: false },
    });

    if (!course) {
      return NextResponse.json(
        { data: null, error: "No course found with that class code." },
        { status: 404 }
      );
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        courseId: course.id,
        userId: session.user.id,
      },
    });

    await logActivity(session.user.id, "ENROLL_COURSE", { courseId: course.id });

    return NextResponse.json({ data: enrollment, error: null });
  } catch (err: unknown) {
    console.error(err);
    const code =
      typeof err === "object" && err !== null && "code" in err
        ? String((err as { code?: unknown }).code)
        : "";
    if (code === "P2002") {
      return NextResponse.json(
        { data: null, error: "Already enrolled in this course." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}
