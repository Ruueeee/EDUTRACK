"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Assignment } from "@prisma/client";

const submissionSchema = z.object({
  file: z.any(),
});

type SubmissionFormValues = z.infer<typeof submissionSchema>;

export function SubmitDialog({
  children,
  assignment,
}: {
  children: React.ReactNode;
  assignment: Assignment;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = useForm<SubmissionFormValues>({
    resolver: zodResolver(submissionSchema),
  });

  const onSubmit = async (data: SubmissionFormValues) => {
    if (!data.file || data.file.length === 0) {
      toast.error("Please select a file to submit.");
      return;
    }

    const file = data.file[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("assignmentId", assignment.id);

    // This is a mock upload. In a real app, you'd upload to a blob storage service.
    // For this project, we'll just record the submission in the database.
    const response = await fetch(`/api/submissions`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (response.ok) {
      toast.success("Assignment submitted successfully!");
      reset();
      setOpen(false);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to submit assignment.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Submit: {assignment.title}</DialogTitle>
          <DialogDescription>
            Upload your file for this assignment. Max file size: 10MB.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="file" className="text-right">
                File
              </Label>
              <Input id="file" type="file" {...register("file")} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
