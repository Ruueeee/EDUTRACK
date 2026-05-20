"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Book,
  Users,
  BarChart,
  Settings,
  ClipboardList,
  Notebook,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

const studentLinks = [
  { href: "/student", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/courses", label: "Courses", icon: Book },
  { href: "/student/tasks", label: "Tasks", icon: ClipboardList },
  { href: "/student/notes", label: "Notes", icon: Notebook },
  { href: "/student/activity", label: "Activity", icon: Activity },
];

const instructorLinks = [
  { href: "/instructor", label: "Dashboard", icon: LayoutDashboard },
  { href: "/instructor/courses", label: "Courses", icon: Book },
];

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/logs", label: "Logs", icon: BarChart },
];

const roleLinks = {
  STUDENT: studentLinks,
  INSTRUCTOR: instructorLinks,
  ADMIN: adminLinks,
};

export function Sidebar({ role }: { role: "STUDENT" | "INSTRUCTOR" | "ADMIN" }) {
  const pathname = usePathname();
  const links = roleLinks[role];

  return (
    <aside className="hidden w-64 flex-col border-r bg-background md:flex">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Book className="h-6 w-6" />
          <span>EduTrack</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              pathname === link.href && "bg-muted text-primary"
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

