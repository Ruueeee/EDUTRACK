"use client";

import { SelfNote } from "@prisma/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { NoteSchema } from "@/lib/validators/note";
import { useEffect } from "react";

interface NoteEditorProps {
  note: SelfNote | null;
  onSave: (id: string, values: z.infer<typeof NoteSchema>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export function NoteEditor({
  note,
  onSave,
  onDelete,
}: NoteEditorProps) {
  const form = useForm<z.infer<typeof NoteSchema>>({
    resolver: zodResolver(NoteSchema),
    defaultValues: {
      title: note?.title || "",
      body: note?.body || "",
    },
  });

  useEffect(() => {
    form.reset({
      title: note?.title || "",
      body: note?.body || "",
    });
  }, [note, form]);

  const isSaving = form.formState.isSubmitting;

  return (
    <div className="p-4 h-full">
      {note ? (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => onSave(note.id, values))}
            className="space-y-4 h-full flex flex-col"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Title"
                      className="text-2xl font-bold border-none focus-visible:ring-0 shadow-none px-0"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem className="flex-grow">
                  <FormControl>
                    <Textarea
                      placeholder="Start writing your note..."
                      className="h-full resize-none border-none focus-visible:ring-0 shadow-none px-0 text-lg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-between items-center pt-4 border-t">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Note"}
              </Button>
              {onDelete && (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => onDelete(note.id)}
                >
                  Delete
                </Button>
              )}
            </div>
          </form>
        </Form>
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground bg-muted/30 rounded-lg border-2 border-dashed">
          <p>Select a note to view or create a new one.</p>
        </div>
      )}
    </div>
  );
}
