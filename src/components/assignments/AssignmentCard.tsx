import { Assignment } from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Button } from "../ui/button";
import { SubmitDialog } from "./SubmitDialog";

interface AssignmentCardProps {
  assignment: Assignment;
  submissionStatus?: "SUBMITTED" | "GRADED" | "LATE" | "PENDING";
}

export function AssignmentCard({ assignment, submissionStatus }: AssignmentCardProps) {
  const statusMap = {
    PENDING: "bg-amber-100 text-amber-800",
    SUBMITTED: "bg-blue-100 text-blue-800",
    GRADED: "bg-green-100 text-green-800",
    LATE: "bg-red-100 text-red-800",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{assignment.title}</CardTitle>
        <CardDescription>{assignment.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Due: {format(new Date(assignment.dueDate), "PPP")}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        {submissionStatus && (
          <Badge className={statusMap[submissionStatus]}>
            {submissionStatus}
          </Badge>
        )}
        {submissionStatus === "PENDING" && (
          <SubmitDialog assignment={assignment}>
            <Button size="sm">Submit</Button>
          </SubmitDialog>
        )}
      </CardFooter>
    </Card>
  );
}

