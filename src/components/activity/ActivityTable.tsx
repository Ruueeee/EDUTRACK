"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ActivityLog } from "@prisma/client";
import { format } from "date-fns";

export interface ActivityTableProps {
  activities: (ActivityLog & { user: { name: string | null } })[];
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

export function ActivityTable({ activities, page, totalPages, onPageChange }: ActivityTableProps) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activities.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                No activity yet.
              </TableCell>
            </TableRow>
          )}
          {activities.map((log) => (
            <TableRow key={log.id}>
              <TableCell>{log.user.name ?? "Unknown User"}</TableCell>
              <TableCell>
                <span className="font-mono bg-muted px-2 py-1 rounded-md text-xs">
                  {log.action}
                </span>
              </TableCell>
              <TableCell>{format(log.createdAt, "PPP p")}</TableCell>
              <TableCell>
                <pre className="text-xs text-muted-foreground">
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

