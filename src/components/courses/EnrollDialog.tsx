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

const enrollSchema = z.object({
  classCode: z.string().min(1, "Class code is required"),
});

type EnrollFormValues = z.infer<typeof enrollSchema>;

export function EnrollDialog({
  children,
  onEnrolled
}: {
  children: React.ReactNode;
  onEnrolled?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EnrollFormValues>({
    resolver: zodResolver(enrollSchema),
  });

  const onSubmit = async (data: EnrollFormValues) => {
    const response = await fetch(`/api/courses/enroll`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok) {
      toast.success("Successfully enrolled in course!");
      reset();
      setOpen(false);
      onEnrolled?.();
      router.refresh();
    } else {
      toast.error(result.error || "Failed to enroll in course.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enroll in a New Course</DialogTitle>
          <DialogDescription>
            Enter the class code provided by your instructor to enroll.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="classCode" className="text-right">
                Class Code
              </Label>
              <Input
                id="classCode"
                {...register("classCode")}
                className="col-span-3"
              />
            </div>
            {errors.classCode && (
              <p className="col-span-4 text-center text-sm text-destructive">
                {errors.classCode.message}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enrolling..." : "Enroll"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
