import { z } from "zod";

export const CreateAssignmentSchema = z.object({
  courseId: z.string().min(1, "Course is required"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  dueDate: z.date({
    message: "A due date is required.",
  }),
});

export type CreateAssignmentData = z.infer<typeof CreateAssignmentSchema>;

export const SubmitAssignmentSchema = z.object({
  fileUrl: z.string().url("Invalid URL"),
  fileName: z.string().min(1, "File name cannot be empty"),
  comments: z.string().optional(),
});

export type SubmitAssignmentData = z.infer<typeof SubmitAssignmentSchema>;


export const GradeSubmissionSchema = z.object({
  grade: z.coerce.number().min(0).max(100),
  feedback: z.string().optional(),
});

export type GradeSubmissionData = z.infer<typeof GradeSubmissionSchema>;

