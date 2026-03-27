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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { AiGenerateButton } from "@/components/ai-generate-button";

const goalCategoryOptions = ["Housing", "Employment", "MentalHealth", "SubstanceAbuse", "Education", "LifeSkills", "Health", "Financial", "Legal", "Social", "Other"] as const;
const goalPriorityOptions = ["Low", "Medium", "High"] as const;

const goalFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.enum(goalCategoryOptions, { error: "This field is required" }),
  priority: z.enum(goalPriorityOptions, { error: "This field is required" }),
  targetDate: z.date({ error: "This field is required" }).refine((d) => d > new Date(), { message: "Target date must be in the future" }),
  milestones: z.string().optional(),
});

type GoalFormValues = z.infer<typeof goalFormSchema>;

interface GoalFormProps {
  caseId: Id<"cases">;
  clientId: Id<"clients">;
  initialData?: GoalFormValues & { _id: Id<"goals"> };
  onSuccess?: () => void;
}

export function GoalForm({ caseId, clientId, initialData, onSuccess }: GoalFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createGoal = useMutation(api.goals.create);
  const updateGoal = useMutation(api.goals.update);
  const isEditing = !!initialData?._id;

  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: initialData ?? {
      title: "",
      description: "",
      category: undefined,
      priority: "Medium",
      milestones: "",
    },
  });

  async function onSubmit(values: GoalFormValues) {
    setIsSubmitting(true);
    try {
      const payload = {
        title: values.title,
        description: values.description,
        category: values.category,
        priority: values.priority,
        targetDate: values.targetDate.toISOString(),
        milestones: values.milestones || undefined,
      };
      if (isEditing && initialData?._id) {
        await updateGoal({ id: initialData._id, ...payload } as any);
        toast({ title: "Goal updated", description: "Goal has been updated successfully." });
      } else {
        await createGoal({ caseId, clientId, ...payload } as any);
        toast({ title: "Goal created", description: "New goal has been created successfully." });
      }
      onSuccess?.();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save goal. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem>
            <FormLabel>Goal Title *</FormLabel>
            <FormControl><Input placeholder="e.g., Secure stable housing within 90 days" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel>Description *</FormLabel>
              <AiGenerateButton
                fieldName="goalDescription"
                context={{ title: form.getValues("title"), category: form.getValues("category"), priority: form.getValues("priority") }}
                onGenerated={(text) => form.setValue("description", text, { shouldValidate: true })}
              />
            </div>
            <FormControl><Textarea placeholder="Describe the SMART goal in detail..." className="min-h-[100px]" {...field} /></FormControl>
            <FormDescription>Write a Specific, Measurable, Achievable, Relevant, and Time-bound goal</FormDescription>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField control={form.control} name="category" render={({ field }) => (
            <FormItem>
              <FormLabel>Category *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
                <SelectContent>
                  {goalCategoryOptions.map((opt) => (<SelectItem key={opt} value={opt}>{opt.replace(/([A-Z])/g, " $1").trim()}</SelectItem>))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="priority" render={({ field }) => (
            <FormItem>
              <FormLabel>Priority *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger></FormControl>
                <SelectContent>
                  {goalPriorityOptions.map((opt) => (<SelectItem key={opt} value={opt}>{opt}</SelectItem>))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="targetDate" render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Target Date *</FormLabel>
              <Popover>
                <PopoverTrigger>
                  <FormControl>
                    <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                      {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date <= new Date()} initialFocus />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="milestones" render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel>Milestones</FormLabel>
              <AiGenerateButton
                fieldName="goalMilestones"
                context={{ title: form.getValues("title"), description: form.getValues("description"), category: form.getValues("category") }}
                onGenerated={(text) => form.setValue("milestones", text, { shouldValidate: true })}
              />
            </div>
            <FormControl><Textarea placeholder="List milestones, one per line (e.g., Complete housing application, Attend housing interview)" className="min-h-[80px]" {...field} /></FormControl>
            <FormDescription>Optional: list key milestones for tracking progress</FormDescription>
            <FormMessage />
          </FormItem>
        )} />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Update Goal" : "Create Goal"}
          </Button>
        </div>
      </form>
    </Form>
  );
}