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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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

const resolutionOptions = ["Resolved", "ClientWithdrew", "Referred", "LostContact", "Other"] as const;

const caseCloseSchema = z.object({
  resolution: z.enum(resolutionOptions, { required_error: "Resolution type is required" }),
  resolutionNotes: z.string().min(1, "Resolution notes are required"),
});

type CaseCloseValues = z.infer<typeof caseCloseSchema>;

interface CaseCloseDialogProps {
  caseId: Id<"cases">;
  caseNumber: string;
  onSuccess?: () => void;
  children: React.ReactNode;
}

export function CaseCloseDialog({ caseId, caseNumber, onSuccess, children }: CaseCloseDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const updateStatus = useMutation(api.cases.updateStatus);

  const form = useForm<CaseCloseValues>({
    resolver: zodResolver(caseCloseSchema),
    defaultValues: {
      resolution: undefined,
      resolutionNotes: "",
    },
  });

  async function onSubmit(values: CaseCloseValues) {
    setIsSubmitting(true);
    try {
      await updateStatus({
        id: caseId,
        status: "Closed",
        resolution: values.resolution,
        resolutionNotes: values.resolutionNotes,
      });
      toast({ title: "Case closed", description: `Case ${caseNumber} has been closed successfully.` });
      setOpen(false);
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast({ title: "Error", description: "Failed to close case. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Close Case {caseNumber}</DialogTitle>
          <DialogDescription>
            Please provide the resolution details for this case. This action will move the case to Closed status.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="resolution" render={({ field }) => (
              <FormItem>
                <FormLabel>Resolution Type *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select resolution" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {resolutionOptions.map((opt) => (<SelectItem key={opt} value={opt}>{opt.replace(/([A-Z])/g, " $1").trim()}</SelectItem>))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="resolutionNotes" render={({ field }) => (
              <FormItem>
                <FormLabel>Resolution Notes *</FormLabel>
                <FormControl><Textarea placeholder="Describe the case resolution and outcomes..." className="min-h-[100px]" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" variant="destructive" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Close Case
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}