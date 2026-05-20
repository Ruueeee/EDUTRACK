"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  classCode: z.string().min(6, {
    message: "Class code must be at least 6 characters.",
  }),
});

export function EnrollForm({
  onSubmit,
  isSubmitting,
}: {
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  isSubmitting: boolean;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      classCode: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="classCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Class Code</FormLabel>
              <FormControl>
                <Input placeholder="Enter the code from your instructor" {...field} />
              </FormControl>
              <FormDescription>
                This is the unique code for the course you want to join.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enrolling..." : "Enroll in Course"}
        </Button>
      </form>
    </Form>
  );
}

