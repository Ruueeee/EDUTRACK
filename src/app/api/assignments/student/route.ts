import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "STUDENT") {
      return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 });
    }

    const assignments = await prisma.assignment.findMany({
      where: {
        course: {
          enrollments: {
            some: { userId: session.user.id },
          },
        },
      },
      include: {
        submissions: {
          where: { studentId: session.user.id },
        },
      },
      orderBy: { dueDate: "asc" },
    });

    return NextResponse.json({ data: assignments, error: null });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}
