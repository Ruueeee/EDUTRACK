import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { logActivity } from "@/lib/logger";

const updateNoteSchema = z.object({
  title: z.string().optional(),
  body: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const { noteId } = await params;

    const body = await req.json();
    const parsed = updateNoteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ data: null, error: parsed.error.message }, { status: 400 });
    }

    const existingNote = await prisma.selfNote.findFirst({
      where: {
        id: noteId,
        userId: session.user.id,
      },
    });

    if (!existingNote) {
      return NextResponse.json({ data: null, error: "Note not found" }, { status: 404 });
    }

    const note = await prisma.selfNote.update({
      where: {
        id: noteId,
      },
      data: parsed.data,
    });
    
    await logActivity(session.user.id, "UPDATE_NOTE", { noteId: note.id });

    return NextResponse.json({ data: note, error: null });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const { noteId } = await params;

    const deleted = await prisma.selfNote.deleteMany({
      where: {
        id: noteId,
        userId: session.user.id,
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json({ data: null, error: "Note not found" }, { status: 404 });
    }

    await logActivity(session.user.id, "DELETE_NOTE", { noteId });

    return NextResponse.json({ data: { message: "Note deleted" }, error: null });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}

