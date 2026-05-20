import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logActivity } from "@/lib/logger";
import { z } from "zod";
import { Role } from "@prisma/client";

const toggleStatusSchema = z.object({
    isActive: z.boolean().optional(),
    role: z.nativeEnum(Role).optional(),
});

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const session = await auth();
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
        }

        const { userId } = await params;

        const body = await req.json();
        const parsed = toggleStatusSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ data: null, error: parsed.error.message }, { status: 400 });
        }

        // Prevent modifying oneself
        if (userId === session.user.id) {
            return NextResponse.json({ data: null, error: "Cannot modify your own account" }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: parsed.data,
        });

        await logActivity(session.user.id, "UPDATE_USER", {
            targetUserId: userId,
            updates: parsed.data
        });

        return NextResponse.json({ data: updatedUser, error: null });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
    }
}
