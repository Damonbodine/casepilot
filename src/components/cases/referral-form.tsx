// @ts-nocheck
"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ReferralFormProps {
  caseId: Id<"cases">;
  clientId: Id<"clients">;
}

export function ReferralForm({ caseId, clientId }: ReferralFormProps) {
  const createReferral = useMutation(api.referrals.create);
  const partners = useQuery(api.partners.list);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [partnerId, setPartnerId] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [urgency, setUrgency] = useState("Normal");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerId || !reason.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await createReferral({
        caseId,
        clientId,
        partnerId: partnerId as Id<"partners">,
        reason,
        notes: notes || undefined,
        urgency,
        status: "Pending",
      });
      setPartnerId("");
      setReason("");
      setNotes("");
      setUrgency("Normal");
    } catch (err: any) {
      setError(err.message || "Failed to create referral.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader><DialogTitle>Create Referral</DialogTitle></DialogHeader>
      <div className="space-y-2">
        <Label>Partner Organization *</Label>
        <Select value={partnerId} onValueChange={setPartnerId}>
          <SelectTrigger><SelectValue placeholder="Select partner..." /></SelectTrigger>
          <SelectContent>
            {partners?.map((p: any) => (
              <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>
            )) ?? <SelectItem value="" disabled>Loading partners...</SelectItem>}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="ref-reason">Reason for Referral *</Label>
        <Textarea id="ref-reason" value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Describe why this referral is needed..." required />
      </div>
      <div className="space-y-2">
        <Label>Urgency</Label>
        <Select value={urgency} onValueChange={setUrgency}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Normal">Normal</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="ref-notes">Additional Notes</Label>
        <Textarea id="ref-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={isSubmitting || !partnerId || !reason.trim()} className="w-full">
        {isSubmitting ? "Creating..." : "Create Referral"}
      </Button>
    </form>
  );
}