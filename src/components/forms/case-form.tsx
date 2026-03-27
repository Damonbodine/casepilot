"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "convex/react";
import { useAuthedQuery } from "@/hooks/use-authed-query";
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

const caseTypeOptions = ["Housing", "Employment", "MentalHealth", "SubstanceAbuse", "DomesticViolence", "LegalAid", "FoodInsecurity", "Healthcare", "Education", "General"] as const;
const priorityOptions = ["Low", "Medium", "High", "Urgent"] as const;
const riskLevelOptions = ["Low", "Medium", "High", "Critical"] as const;

const caseFormSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  type: z.enum(caseTypeOptions, { error: "This field is required" }),
  priority: z.enum(priorityOptions, { error: "This field is required" }),
  assignedWorkerId: z.string().min(1, "Assigned worker is required"),
  assignedManagerId: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  targetCloseDate: z.date().optional(),
  intakeAssessment: z.string().optional(),
  riskAtIntake: z.enum(riskLevelOptions, { error: "This field is required" }),
});

type CaseFormValues = z.infer<typeof caseFormSchema>;

interface CaseFormProps {
  initialData?: CaseFormValues & { _id: Id<"cases"> };
  clientId?: Id<"clients">;
  onSuccess?: () => void;
}

export function CaseForm({ initialData, clientId, onSuccess }: CaseFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createCase = useMutation(api.cases.create);
  const updateCase = useMutation(api.cases.update);
  const isEditing = !!initialData?._id;

  const clients = useAuthedQuery(api.clients.list, {});
  const users = useAuthedQuery(api.users.list, {});
  const workers = users?.filter((u: any) => u.role === "CaseWorker" && u.isActive) ?? [];
  const managers = users?.filter((u: any) => (u.role === "CaseManager" || u.role === "Admin") && u.isActive) ?? [];

  const form = useForm<CaseFormValues>({
    resolver: zodResolver(caseFormSchema),
    defaultValues: initialData ?? {
      clientId: clientId ?? "",
      type: undefined,
      priority: "Medium",
      assignedWorkerId: "",
      assignedManagerId: "",
      description: "",
      intakeAssessment: "",
      riskAtIntake: undefined,
    },
  });

  async function onSubmit(values: CaseFormValues) {
    setIsSubmitting(true);
    try {
      const payload = {
        ...values,
        clientId: values.clientId as Id<"clients">,
        assignedWorkerId: values.assignedWorkerId as Id<"users">,
        assignedManagerId: values.assignedManagerId ? (values.assignedManagerId as Id<"users">) : undefined,
        targetCloseDate: values.targetCloseDate?.toISOString(),
        intakeAssessment: values.intakeAssessment || undefined,
      };
      if (isEditing && initialData?._id) {
        await updateCase({ id: initialData._id, ...payload } as any);
        toast({ title: "Case updated", description: "Case has been updated successfully." });
      } else {
        await createCase(payload as any);
        toast({ title: "Case created", description: "New case has been created successfully." });
      }
      onSuccess?.();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save case. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField control={form.control} name="clientId" render={({ field }) => (
          <FormItem>
            <FormLabel>Client *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select a client" /></SelectTrigger></FormControl>
              <SelectContent>
                {(clients ?? []).map((client: any) => (
                  <SelectItem key={client._id} value={client._id}>{client.firstName} {client.lastName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField control={form.control} name="type" render={({ field }) => (
            <FormItem>
              <FormLabel>Case Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                <SelectContent>
                  {caseTypeOptions.map((opt) => (<SelectItem key={opt} value={opt}>{opt.replace(/([A-Z])/g, " $1").trim()}</SelectItem>))}
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
                  {priorityOptions.map((opt) => (<SelectItem key={opt} value={opt}>{opt}</SelectItem>))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="riskAtIntake" render={({ field }) => (
            <FormItem>
              <FormLabel>Risk at Intake *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select risk level" /></SelectTrigger></FormControl>
                <SelectContent>
                  {riskLevelOptions.map((opt) => (<SelectItem key={opt} value={opt}>{opt}</SelectItem>))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="assignedWorkerId" render={({ field }) => (
            <FormItem>
              <FormLabel>Assigned Worker *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select worker" /></SelectTrigger></FormControl>
                <SelectContent>
                  {workers.map((u: any) => (<SelectItem key={u._id} value={u._id}>{u.name}</SelectItem>))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="assignedManagerId" render={({ field }) => (
            <FormItem>
              <FormLabel>Assigned Manager</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select manager (optional)" /></SelectTrigger></FormControl>
                <SelectContent>
                  {managers.map((u: any) => (<SelectItem key={u._id} value={u._id}>{u.name}</SelectItem>))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="targetCloseDate" render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Target Close Date</FormLabel>
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
                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel>Description *</FormLabel>
              <AiGenerateButton
                fieldName="caseDescription"
                context={{ type: form.getValues("type"), priority: form.getValues("priority"), riskAtIntake: form.getValues("riskAtIntake") }}
                onGenerated={(text) => form.setValue("description", text, { shouldValidate: true })}
              />
            </div>
            <FormControl><Textarea placeholder="Describe the case context and presenting issues..." className="min-h-[100px]" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="intakeAssessment" render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel>Intake Assessment</FormLabel>
              <AiGenerateButton
                fieldName="intakeAssessment"
                context={{ type: form.getValues("type"), priority: form.getValues("priority"), riskAtIntake: form.getValues("riskAtIntake"), description: form.getValues("description") }}
                onGenerated={(text) => form.setValue("intakeAssessment", text, { shouldValidate: true })}
              />
            </div>
            <FormControl><Textarea placeholder="Initial intake assessment notes..." className="min-h-[80px]" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Update Case" : "Create Case"}
          </Button>
        </div>
      </form>
    </Form>
  );
}