import { PageHeader } from "@/components/layout/PageHeader";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ActivityLogTable } from "@/components/admin/ActivityLogTable";
import { redirect } from "next/navigation";

export default async function AdminLogsPage({ searchParams }: { searchParams: { page?: string } }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return redirect("/login");

  const page = parseInt(searchParams.page || "1");
  const limit = 15;
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

  // Use JSON parsing/stringify to safely map the returned data for the Client Component
  const safeLogs = JSON.parse(JSON.stringify(logs));

  const pagination = {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };

  return (
    <>
      <PageHeader title="System Activity Logs" description="Audit log of all platform actions" />
      <div className="mt-6">
        <ActivityLogTable logs={safeLogs} pagination={pagination} />
      </div>
    </>
  );
}
