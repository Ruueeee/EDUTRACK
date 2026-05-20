import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { logActivity } from "@/lib/logger";

const noteSchema = z.object({
  title: z.string().min(1),
  body: z.string().optional(),
});

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
        }

    const notes = await prisma.selfNote.findMany({
            where: {
                userId: session.user.id,
            },
            orderBy: {
                updatedAt: 'desc',
            }
        });

        return NextResponse.json({ data: notes, error: null });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = noteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ data: null, error: parsed.error.message }, { status: 400 });
    }

    const { title, body } = parsed.data;

    const note = await prisma.selfNote.create({
      data: {
        title,
        body: body ?? "",
        userId: session.user.id,
      },
    });

    await logActivity(session.user.id, "CREATE_NOTE", { noteId: note.id });

    return NextResponse.json({ data: note, error: null }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}

