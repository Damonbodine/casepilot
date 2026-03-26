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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const serviceCategoryOptions = ["Housing", "Employment", "MentalHealth", "SubstanceAbuse", "DomesticViolence", "LegalAid", "FoodInsecurity", "Healthcare", "Education", "LifeSkills", "Transportation", "Other"] as const;
const deliveryMethodOptions = ["InPerson", "Phone", "VideoCall", "GroupSession", "Workshop", "FieldVisit"] as const;

const serviceFormSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  description: z.string().min(1, "Description is required"),
  category: z.enum(serviceCategoryOptions, { error: "This field is required" }),
  deliveryMethod: z.enum(deliveryMethodOptions, { error: "This field is required" }),
  defaultDuration: z.number().min(1, "Must be at least 1 minute").optional(),
  maxCapacity: z.number().min(1, "Must be at least 1").optional(),
  isActive: z.boolean().optional(),
  requiresApproval: z.boolean().optional(),
  fundingSource: z.string().optional(),
});

type ServiceFormValues = z.infer<typeof serviceFormSchema>;

interface ServiceFormProps {
  initialData?: ServiceFormValues & { _id: Id<"services"> };
  onSuccess?: () => void;
}

export function ServiceForm({ initialData, onSuccess }: ServiceFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createService = useMutation(api.services.create);
  const updateService = useMutation(api.services.update);
  const isEditing = !!initialData?._id;

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: initialData ?? {
      name: "",
      description: "",
      category: undefined,
      deliveryMethod: undefined,
      defaultDuration: undefined,
      maxCapacity: undefined,
      isActive: true,
      requiresApproval: false,
      fundingSource: "",
    },
  });

  async function onSubmit(values: ServiceFormValues) {
    setIsSubmitting(true);
    try {
      const payload = {
        ...values,
        defaultDuration: values.defaultDuration || undefined,
        maxCapacity: values.maxCapacity || undefined,
        fundingSource: values.fundingSource || undefined,
      };
      if (isEditing && initialData?._id) {
        await updateService({ id: initialData._id, ...payload } as any);
        toast({ title: "Service updated", description: "Service has been updated successfully." });
      } else {
        await createService(payload as any);
        toast({ title: "Service created", description: "New service has been created successfully." });
      }
      onSuccess?.();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save service. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Service Name *</FormLabel>
            <FormControl><Input placeholder="e.g., Individual Counseling" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>Description *</FormLabel>
            <FormControl><Textarea placeholder="Describe the service..." className="min-h-[80px]" {...field} /></FormControl>
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
                  {serviceCategoryOptions.map((opt) => (<SelectItem key={opt} value={opt}>{opt.replace(/([A-Z])/g, " $1").trim()}</SelectItem>))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="deliveryMethod" render={({ field }) => (
            <FormItem>
              <FormLabel>Delivery Method *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger></FormControl>
                <SelectContent>
                  {deliveryMethodOptions.map((opt) => (<SelectItem key={opt} value={opt}>{opt.replace(/([A-Z])/g, " $1").trim()}</SelectItem>))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField control={form.control} name="defaultDuration" render={({ field }) => (
            <FormItem>
              <FormLabel>Default Duration (min)</FormLabel>
              <FormControl><Input type="number" min={1} placeholder="60" {...field} value={field.value ?? ""} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="maxCapacity" render={({ field }) => (
            <FormItem>
              <FormLabel>Max Capacity</FormLabel>
              <FormControl><Input type="number" min={1} placeholder="10" {...field} value={field.value ?? ""} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="fundingSource" render={({ field }) => (
            <FormItem>
              <FormLabel>Funding Source</FormLabel>
              <FormControl><Input placeholder="Grant or funding source" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="flex gap-6">
          <FormField control={form.control} name="isActive" render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Active</FormLabel>
                <FormDescription>Service is currently offered</FormDescription>
              </div>
            </FormItem>
          )} />
          <FormField control={form.control} name="requiresApproval" render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Requires Approval</FormLabel>
                <FormDescription>Manager approval needed</FormDescription>
              </div>
            </FormItem>
          )} />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Update Service" : "Create Service"}
          </Button>
        </div>
      </form>
    </Form>
  );
}