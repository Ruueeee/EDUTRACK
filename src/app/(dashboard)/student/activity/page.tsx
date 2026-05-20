"use client";

import { useEffect, useState } from "react";
import { ActivityLog } from "@prisma/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { ActivityTable } from "@/components/activity/ActivityTable";
import { toast } from "sonner";
import { useSearchParams, useRouter } from "next/navigation";

const PAGE_SIZE = 10;

export default function StudentActivityPage() {
  const [activities, setActivities] = useState<(ActivityLog & { user: { name: string | null } })[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;

  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: PAGE_SIZE.toString(),
      });
      const response = await fetch(`/api/activity?${params.toString()}`);

      if (response.ok) {
        const data = await response.json();
        setActivities(data.data.activities);
        setTotalPages(data.data.totalPages);
      } else {
        toast.error("Failed to load activity log.");
      }
      setIsLoading(false);
    };
    fetchActivities();
  }, [page]);

  const handlePageChange = (newPage: number) => {
    router.push(`/student/activity?page=${newPage}`);
  };

  return (
    <>
      <PageHeader
        title="Activity Log"
        description="A record of your recent actions in EduTrack."
      />
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <ActivityTable
          activities={activities}
          page={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </>
  );
}
