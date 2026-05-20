import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "15");
        const skip = (page - 1) * limit;

        const [logs, total] = await Promise.all([
            prisma.activityLog.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    user: {
                        select: { name: true, email: true, role: true }
                    }
                }
            }),
            prisma.activityLog.count()
        ]);

        return NextResponse.json({
            data: {
                logs,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            },
            error: null
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
    }
}
