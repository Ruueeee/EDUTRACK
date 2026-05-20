import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { logActivity } from "@/lib/logger";

const schema = z.object({
  grade: z.number().min(0).max(100),
  feedback: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "INSTRUCTOR") {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ data: null, error: parsed.error.message }, { status: 400 });
    }

    const { grade, feedback } = parsed.data;
    const { submissionId } = await params;

    const submission = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        grade,
        feedback,
        status: "GRADED",
      },
    });

    await logActivity(session.user.id, "GRADE_SUBMISSION", { submissionId, grade });

    return NextResponse.json({ data: submission, error: null });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}

