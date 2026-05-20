import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { logActivity } from "@/lib/logger";
import { uploadFile } from "@/lib/upload"; // Assuming you have an upload helper

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const assignmentId = formData.get("assignmentId") as string;
    const file = formData.get("file") as File;

    if (!assignmentId || !file) {
      return NextResponse.json({ data: null, error: "Missing required fields" }, { status: 400 });
    }

    const { fileUrl, fileName } = await uploadFile(file);

    const result = await prisma.submission.create({
      data: {
        assignmentId,
        studentId: session.user.id,
        fileUrl,
        fileName,
        status: "SUBMITTED",
      },
    });

    await logActivity(session.user.id, "SUBMIT_ASSIGNMENT", {
      assignmentId,
      submissionId: result.id,
    });

    return NextResponse.json({ data: result, error: null });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}

