import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logActivity } from "@/lib/logger";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await params;

    const enrollment = await prisma.enrollment.create({
      data: {
        courseId,
        userId: session.user.id,
      },
    });

    await logActivity(session.user.id, "ENROLL_COURSE", { courseId });

    return NextResponse.json({ data: enrollment, error: null });
  } catch (err) {
    console.error(err);
    // Handle potential unique constraint violation if already enrolled
    if (err && typeof err === "object" && "code" in err && (err as { code?: string }).code === "P2002") {
        return NextResponse.json({ data: null, error: "Already enrolled in this course." }, { status: 409 });
    }
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}

