"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User, Submission, Assignment } from "@prisma/client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

interface ExtendedSubmission extends Submission {
  student: User;
}

interface GradeSheetProps {
  submission: ExtendedSubmission;
  assignment: Assignment;
  children: React.ReactNode;
}

export function GradeSheet({ submission, assignment, children }: GradeSheetProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [grade, setGrade] = useState<string>(submission.grade?.toString() || "");
  const [feedback, setFeedback] = useState<string>(submission.feedback || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      const payload = {
        grade: grade ? parseInt(grade, 10) : undefined,
        feedback: feedback || undefined,
      };

      if (payload.grade === undefined || payload.grade < 0 || payload.grade > assignment.maxPoints) {
        toast.error("Invalid grade");
        return;
      }

      const response = await fetch(`/api/submissions/${submission.id}/grade`, {
        method: "POST", // using POST as defined in api route
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const { data, error } = await response.json();

      if (error) throw new Error(error);

      toast.success("Submission graded successfully");
      setOpen(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to grade submission");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Grade Submission</SheetTitle>
          <SheetDescription>
            {assignment.title} - {submission.student.name}
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Submission Details */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Submission info</h4>
            {submission.fileUrl ? (
              <a
                href={submission.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                View Attachment: {submission.fileName || "File"}
              </a>
            ) : (
              <div className="bg-muted p-4 rounded-md text-sm whitespace-pre-wrap">
                {submission.feedback || "No content provided by student."}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Submitted: {submission.submittedAt ? format(new Date(submission.submittedAt), "PPP p") : "N/A"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="grade">Grade (out of {assignment.maxPoints})</Label>
              <Input
                id="grade"
                type="number"
                min={0}
                max={assignment.maxPoints}
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback</Label>
              <Textarea
                id="feedback"
                placeholder="Good job! Just remember to..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="resize-none"
                rows={4}
              />
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Grade"}
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
