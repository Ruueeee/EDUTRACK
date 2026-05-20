import { Assignment, Submission } from "@prisma/client";
import { AssignmentCard } from "../assignments/AssignmentCard";

interface TaskListProps {
  tasks: (Assignment & { submissions: Submission[] })[];
  isLoading?: boolean;
}

export function TaskList({ tasks, isLoading = false }: TaskListProps) {
  if (isLoading) {
    return <div className="space-y-4">Loading tasks...</div>;
  }
  const getStatus = (
    assignment: Assignment & { submissions: Submission[] }
  ): "SUBMITTED" | "GRADED" | "LATE" | "PENDING" => {
    const submission = assignment.submissions[0];
    if (submission) {
      if (submission.grade) {
        return "GRADED";
      }
      return "SUBMITTED";
    }
    if (new Date(assignment.dueDate) < new Date()) {
      return "LATE";
    }
    return "PENDING";
  };

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <AssignmentCard
          key={task.id}
          assignment={task}
          submissionStatus={getStatus(task)}
        />
      ))}
    </div>
  );
}

