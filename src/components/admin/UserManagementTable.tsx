"use client";

import { useState } from "react";
import { User } from "@prisma/client";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function UserManagementTable({ initialUsers }: { initialUsers: User[] }) {
    const router = useRouter();
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const toggleStatus = async (user: User, newStatus: boolean) => {
        try {
            setLoadingId(user.id);
            const res = await fetch(`/api/admin/users/${user.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: newStatus }),
            });
            const { error } = await res.json();

            if (!res.ok) throw new Error(error || "Failed to update user");

            toast.success(`${user.name} is now ${newStatus ? 'active' : 'inactive'}`);
            router.refresh();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Active</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {initialUsers.length > 0 ? (
                        initialUsers.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="text-xs">
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className={user.isActive ? "bg-green-100 text-green-800 border-green-300" : "bg-red-100 text-red-800 border-red-300"}
                                    >
                                        {user.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </TableCell>
                                <TableCell>{format(new Date(user.createdAt), "PP")}</TableCell>
                                <TableCell className="text-right">
                                    <Switch
                                        checked={user.isActive}
                                        disabled={loadingId === user.id}
                                        onCheckedChange={(checked) => toggleStatus(user, checked)}
                                        aria-label={`Toggle status for ${user.name}`}
                                    />
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                                No users found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
