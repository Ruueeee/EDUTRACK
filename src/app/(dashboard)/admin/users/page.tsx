import { PageHeader } from "@/components/layout/PageHeader";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { UserManagementTable } from "@/components/admin/UserManagementTable";
import { redirect } from "next/navigation";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return redirect("/login");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <PageHeader title="User Management" description="Manage all platform users" />
      <div className="mt-6">
        <UserManagementTable initialUsers={users} />
      </div>
    </>
  );
}
