"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { TaskList } from "@/components/tasks/TaskList";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function StudentTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/assignments/student")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          toast.error(data.error);
          setTasks([]);
        } else {
          setTasks(data.data ?? []);
        }
        setIsLoading(false);
      });
  }, []);

  return (
    <>
      <PageHeader
        title="My Tasks"
        description="Keep track of all your assignments and their due dates."
      />
      <TaskList tasks={tasks} isLoading={isLoading} />
    </>
  );
}
