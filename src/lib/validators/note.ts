import { z } from "zod";

export const NoteSchema = z.object({
  title: z.string().min(1, "Title is required.").max(255),
  body: z.string().optional(),
  courseId: z.string().optional(),
});

export type NoteData = z.infer<typeof NoteSchema>;

