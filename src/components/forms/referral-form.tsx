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
import { Loader2 } from "lucide-react";

const directionOptions = ["Outgoing", "Incoming"] as const;
const urgencyOptions = ["Routine", "Urgent", "Emergency"] as const;

const referralFormSchema = z.object({
  partnerId: z.string().min(1, "Partner is required"),
  direction: z.enum(directionOptions, { error: "This field is required" }),
  reason: z.string().min(1, "Reason is required"),
  serviceNeeded: z.string().min(1, "Service needed is required"),
  urgency: z.enum(urgencyOptions, { error: "This field is required" }),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
  notes: z.string().optional(),
});

type ReferralFormValues = z.infer<typeof referralFormSchema>;

interface ReferralFormProps {
  caseId: Id<"cases">;
  clientId: Id<"clients">;
  onSuccess?: () => void;
}

export function ReferralForm({ caseId, clientId, onSuccess }: ReferralFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createReferral = useMutation(api.referrals.create);
  const partners = useAuthedQuery(api.partners.list, {});

  const form = useForm<ReferralFormValues>({
    resolver: zodResolver(referralFormSchema),
    defaultValues: {
      partnerId: "",
      direction: "Outgoing",
      reason: "",
      serviceNeeded: "",
      urgency: "Routine",
      contactName: "",
      contactPhone: "",
      notes: "",
    },
  });

  async function onSubmit(values: ReferralFormValues) {
    setIsSubmitting(true);
    try {
      await createReferral({
        caseId,
        clientId,
        partnerId: values.partnerId as Id<"partners">,
        reason: values.reason,
        urgency: values.urgency,
        notes: values.notes || undefined,
      } as any);
      toast({ title: "Referral created", description: "Referral has been created successfully." });
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast({ title: "Error", description: "Failed to create referral. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="partnerId" render={({ field }) => (
          <FormItem>
            <FormLabel>Partner Organization *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select a partner" /></SelectTrigger></FormControl>
              <SelectContent>
                {(partners ?? []).filter((p: any) => p.isActive).map((p: any) => (
                  <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="direction" render={({ field }) => (
            <FormItem>
              <FormLabel>Direction *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select direction" /></SelectTrigger></FormControl>
                <SelectContent>
                  {directionOptions.map((opt) => (<SelectItem key={opt} value={opt}>{opt}</SelectItem>))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="urgency" render={({ field }) => (
            <FormItem>
              <FormLabel>Urgency *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select urgency" /></SelectTrigger></FormControl>
                <SelectContent>
                  {urgencyOptions.map((opt) => (<SelectItem key={opt} value={opt}>{opt}</SelectItem>))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="serviceNeeded" render={({ field }) => (
          <FormItem>
            <FormLabel>Service Needed *</FormLabel>
            <FormControl><Input placeholder="Specific service needed from partner" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="reason" render={({ field }) => (
          <FormItem>
            <FormLabel>Reason *</FormLabel>
            <FormControl><Textarea placeholder="Reason for the referral..." className="min-h-[80px]" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="contactName" render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Name</FormLabel>
              <FormControl><Input placeholder="Contact at partner org" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="contactPhone" render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Phone</FormLabel>
              <FormControl><Input type="tel" placeholder="(555) 123-4567" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl><Textarea placeholder="Additional notes or instructions..." className="min-h-[60px]" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Referral
          </Button>
        </div>
      </form>
    </Form>
  );
}