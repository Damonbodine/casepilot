// @ts-nocheck
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const roleOptions = ["Admin", "CaseManager", "CaseWorker", "IntakeSpecialist", "ReadOnlyViewer"] as const;

const userFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  role: z.enum(roleOptions, { required_error: "Role is required" }),
  title: z.string().optional(),
  isActive: z.boolean().default(true),
  caseloadLimit: z.coerce.number().min(1, "Must be at least 1").optional(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  initialData: UserFormValues & { _id: Id<"users"> };
  onSuccess?: () => void;
}

export function UserForm({ initialData, onSuccess }: UserFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateUser = useMutation(api.users.update);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: initialData.name,
      email: initialData.email,
      phone: initialData.phone ?? "",
      role: initialData.role,
      title: initialData.title ?? "",
      isActive: initialData.isActive,
      caseloadLimit: initialData.caseloadLimit,
    },
  });

  const selectedRole = form.watch("role");
  const showCaseloadLimit = selectedRole === "CaseWorker" || selectedRole === "CaseManager";

  async function onSubmit(values: UserFormValues) {
    setIsSubmitting(true);
    try {
      await updateUser({
        id: initialData._id,
        name: values.name,
        email: values.email,
        phone: values.phone || undefined,
        role: values.role,
        title: values.title || undefined,
        isActive: values.isActive,
        caseloadLimit: showCaseloadLimit ? values.caseloadLimit : undefined,
      });
      toast({ title: "User updated", description: "User profile has been updated successfully." });
      onSuccess?.();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update user. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name *</FormLabel>
              <FormControl><Input placeholder="Full name" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel>Email *</FormLabel>
              <FormControl><Input type="email" placeholder="email@org.com" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="phone" render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl><Input type="tel" placeholder="(555) 123-4567" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="title" render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title</FormLabel>
              <FormControl><Input placeholder="e.g., Senior Case Worker" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="role" render={({ field }) => (
          <FormItem>
            <FormLabel>Role *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger></FormControl>
              <SelectContent>
                {roleOptions.map((opt) => (<SelectItem key={opt} value={opt}>{opt.replace(/([A-Z])/g, " $1").trim()}</SelectItem>))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />

        {showCaseloadLimit && (
          <FormField control={form.control} name="caseloadLimit" render={({ field }) => (
            <FormItem>
              <FormLabel>Caseload Limit</FormLabel>
              <FormControl><Input type="number" min={1} placeholder="25" {...field} value={field.value ?? ""} /></FormControl>
              <FormDescription>Maximum number of active cases this user can be assigned</FormDescription>
              <FormMessage />
            </FormItem>
          )} />
        )}

        <FormField control={form.control} name="isActive" render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Active Account</FormLabel>
              <FormDescription>User can log in and access the system</FormDescription>
            </div>
          </FormItem>
        )} />

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update User
          </Button>
        </div>
      </form>
    </Form>
  );
}