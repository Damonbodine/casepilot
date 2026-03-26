"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const categoryOptions = ["General", "Clinical", "Legal", "Administrative", "FollowUp", "CrisisIntervention"] as const;
const contactMethodOptions = ["InPerson", "Phone", "Email", "VideoCall", "None"] as const;

const caseNoteFormSchema = z.object({
  content: z.string().min(1, "Note content is required"),
  category: z.enum(categoryOptions, { error: "This field is required" }),
  isPrivate: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  contactMethod: z.enum(contactMethodOptions).optional(),
  contactDuration: z.number().min(0, "Duration must be positive").optional(),
});

type CaseNoteFormValues = z.infer<typeof caseNoteFormSchema>;

interface CaseNoteFormProps {
  caseId: Id<"cases">;
  onSuccess?: () => void;
}

export function CaseNoteForm({ caseId, onSuccess }: CaseNoteFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createNote = useMutation(api.caseNotes.create);

  const form = useForm<CaseNoteFormValues>({
    resolver: zodResolver(caseNoteFormSchema),
    defaultValues: {
      content: "",
      category: undefined,
      isPrivate: false,
      isPinned: false,
      contactMethod: undefined,
      contactDuration: undefined,
    },
  });

  async function onSubmit(values: CaseNoteFormValues) {
    setIsSubmitting(true);
    try {
      await createNote({
        caseId,
        content: values.content,
        category: values.category,
        isPrivate: values.isPrivate,
        isPinned: values.isPinned,
        contactMethod: values.contactMethod,
      });
      toast({ title: "Note added", description: "Case note has been added successfully." });
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast({ title: "Error", description: "Failed to add note. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="content" render={({ field }) => (
          <FormItem>
            <FormLabel>Note Content *</FormLabel>
            <FormControl><Textarea placeholder="Enter your case note..." className="min-h-[120px]" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="category" render={({ field }) => (
            <FormItem>
              <FormLabel>Category *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
                <SelectContent>
                  {categoryOptions.map((opt) => (<SelectItem key={opt} value={opt}>{opt.replace(/([A-Z])/g, " $1").trim()}</SelectItem>))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="contactMethod" render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Method</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger></FormControl>
                <SelectContent>
                  {contactMethodOptions.map((opt) => (<SelectItem key={opt} value={opt}>{opt.replace(/([A-Z])/g, " $1").trim()}</SelectItem>))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="contactDuration" render={({ field }) => (
          <FormItem>
            <FormLabel>Contact Duration (minutes)</FormLabel>
            <FormControl><Input type="number" min={0} placeholder="Duration in minutes" {...field} value={field.value ?? ""} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="flex gap-6">
          <FormField control={form.control} name="isPrivate" render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Private Note</FormLabel>
                <FormDescription>Only visible to you and managers</FormDescription>
              </div>
            </FormItem>
          )} />
          <FormField control={form.control} name="isPinned" render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Pin Note</FormLabel>
                <FormDescription>Pin to top of case notes</FormDescription>
              </div>
            </FormItem>
          )} />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Note
          </Button>
        </div>
      </form>
    </Form>
  );
}