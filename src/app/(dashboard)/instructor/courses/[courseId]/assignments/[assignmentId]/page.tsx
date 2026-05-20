"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { Assignment, Submission, User } from "@prisma/client";

import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { GradeSheet } from "@/components/assignments/GradeSheet";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ExtendedSubmission = Submission & {
  student: User;
};

type AssignmentData = Assignment & {
  submissions: ExtendedSubmission[];
};

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "PENDING":
      return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">Pending</Badge>;
    case "SUBMITTED":
      return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Submitted</Badge>;
    case "GRADED":
      return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Graded</Badge>;
    case "LATE":
      return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Late</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default function InstructorAssignmentIdPage() {
  const [assignment, setAssignment] = useState<AssignmentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const response = await fetch(`/api/assignments/${params.assignmentId}`);
        if (response.ok) {
          const { data } = await response.json();
          setAssignment(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAssignment();
  }, [params.courseId, params.assignmentId]);

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (!assignment) return <div className="p-8">Assignment not found</div>;

  return (
    <>
      <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Course
      </Button>

      <PageHeader
        title={assignment.title}
        description={`Due: ${format(new Date(assignment.dueDate), "PPP p")}`}
      />

      {assignment.description && (
        <div className="bg-muted p-4 rounded-md mb-8 whitespace-pre-wrap text-sm">
          {assignment.description}
        </div>
      )}

      <h2 className="text-xl font-semibold mb-4">Submissions</h2>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted On</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignment.submissions.length > 0 ? (
              assignment.submissions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium">{sub.student.name}</TableCell>
                  <TableCell>
                    <StatusBadge status={sub.status} />
                  </TableCell>
                  <TableCell>
                    {sub.submittedAt ? format(new Date(sub.submittedAt), "PPP p") : "Not submitted"}
                  </TableCell>
                  <TableCell>
                    {sub.status === "GRADED" ? `${sub.grade} / ${assignment.maxPoints}` : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <GradeSheet submission={sub} assignment={assignment}>
                      <Button size="sm" variant={sub.status === "SUBMITTED" ? "default" : "outline"}>
                        {sub.status === "GRADED" ? "Edit Grade" : "Grade"}
                      </Button>
                    </GradeSheet>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No submissions yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
