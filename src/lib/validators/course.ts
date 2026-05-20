import { z } from "zod";

export const CreateCourseSchema = z.object({
  title: z.string().min(3, "Course title must be at least 3 characters long.").max(100),
  description: z.string().max(500).optional(),
});

export type CreateCourseData = z.infer<typeof CreateCourseSchema>;

export const EnrollCourseSchema = z.object({
  classCode: z.string().length(6, "Class code must be 6 characters long."),
});

export type EnrollCourseData = z.infer<typeof EnrollCourseSchema>;

