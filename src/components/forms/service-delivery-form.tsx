// @ts-nocheck
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "convex/react";
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
import { CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const outcomeOptions = ["Successful", "PartiallySuccessful", "Unsuccessful", "ClientNoShow", "Rescheduled"] as const;

const serviceDeliveryFormSchema = z.object({
  serviceId: z.string().min(1, "Service is required"),
  deliveryDate: z.date({ required_error: "Delivery date is required" }).refine((d) => d <= new Date(), { message: "Delivery date cannot be in the future" }),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute"),
  outcome: z.enum(outcomeOptions, { required_error: "Outcome is required" }),
  notes: z.string().optional(),
  location: z.string().optional(),
  followUpNeeded: z.boolean().default(false),
  followUpDate: z.date().optional(),
});

type ServiceDeliveryFormValues = z.infer<typeof serviceDeliveryFormSchema>;

interface ServiceDeliveryFormProps {
  caseId: Id<"cases">;
  clientId: Id<"clients">;
  onSuccess?: () => void;
}

export function ServiceDeliveryForm({ caseId, clientId, onSuccess }: ServiceDeliveryFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createDelivery = useMutation(api.serviceDeliveries.create);
  const services = useQuery(api.services.list, {});

  const form = useForm<ServiceDeliveryFormValues>({
    resolver: zodResolver(serviceDeliveryFormSchema),
    defaultValues: {
      serviceId: "",
      duration: undefined,
      outcome: undefined,
      notes: "",
      location: "",
      followUpNeeded: false,
      followUpDate: undefined,
    },
  });

  const followUpNeeded = form.watch("followUpNeeded");

  async function onSubmit(values: ServiceDeliveryFormValues) {
    setIsSubmitting(true);
    try {
      await createDelivery({
        caseId,
        clientId,
        serviceId: values.serviceId as Id<"services">,
        deliveryDate: values.deliveryDate.toISOString(),
        duration: values.duration,
        outcome: values.outcome,
        notes: values.notes || undefined,
        location: values.location || undefined,
        followUpNeeded: values.followUpNeeded,
        followUpDate: values.followUpDate?.toISOString(),
      });
      toast({ title: "Service logged", description: "Service delivery has been recorded successfully." });
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast({ title: "Error", description: "Failed to log service delivery. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="serviceId" render={({ field }) => (
          <FormItem>
            <FormLabel>Service *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select a service" /></SelectTrigger></FormControl>
              <SelectContent>
                {(services ?? []).filter((s: any) => s.isActive).map((s: any) => (
                  <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField control={form.control} name="deliveryDate" render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Delivery Date *</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                      {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date()} initialFocus />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="duration" render={({ field }) => (
            <FormItem>
              <FormLabel>Duration (min) *</FormLabel>
              <FormControl><Input type="number" min={1} placeholder="60" {...field} value={field.value ?? ""} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="outcome" render={({ field }) => (
            <FormItem>
              <FormLabel>Outcome *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select outcome" /></SelectTrigger></FormControl>
                <SelectContent>
                  {outcomeOptions.map((opt) => (<SelectItem key={opt} value={opt}>{opt.replace(/([A-Z])/g, " $1").trim()}</SelectItem>))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="location" render={({ field }) => (
          <FormItem>
            <FormLabel>Location</FormLabel>
            <FormControl><Input placeholder="Where the service was delivered" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl><Textarea placeholder="Notes about the service delivery..." className="min-h-[80px]" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="followUpNeeded" render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Follow-up Needed</FormLabel>
              <FormDescription>Schedule a follow-up for this client</FormDescription>
            </div>
          </FormItem>
        )} />

        {followUpNeeded && (
          <FormField control={form.control} name="followUpDate" render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Follow-up Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                      {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date()} initialFocus />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )} />
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Log Service Delivery
          </Button>
        </div>
      </form>
    </Form>
  );
}