"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function CoursesPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const showArchived = searchParams.get("archived") === "true";

    const onToggle = (checked: boolean) => {
        const params = new URLSearchParams(searchParams.toString());
        if (checked) {
            params.set("archived", "true");
        } else {
            params.delete("archived");
        }
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="flex items-center space-x-2">
            <Switch id="archived-courses" checked={showArchived} onCheckedChange={onToggle} />
            <Label htmlFor="archived-courses">Show Archived Courses</Label>
        </div>
    );
}
