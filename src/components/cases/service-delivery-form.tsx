"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useAuthedQuery } from "@/hooks/use-authed-query";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ServiceDeliveryFormProps {
  caseId: Id<"cases">;
  clientId: Id<"clients">;
}

export function ServiceDeliveryForm({ caseId, clientId }: ServiceDeliveryFormProps) {
  const createDelivery = useMutation(api.serviceDeliveries.create);
  const services = useAuthedQuery(api.services.list, {});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serviceId, setServiceId] = useState("");
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split("T")[0]);
  const [duration, setDuration] = useState("");
  const [units, setUnits] = useState("1");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceId) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await createDelivery({
        caseId,
        clientId,
        serviceId: serviceId as Id<"services">,
        deliveryDate,
        duration: duration ? parseInt(duration) : undefined,
        units: parseInt(units) || 1,
        notes: notes || undefined,
        status: "Completed",
      });
      setServiceId("");
      setDuration("");
      setUnits("1");
      setNotes("");
    } catch (err: any) {
      setError(err.message || "Failed to log service delivery.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold">Log Service Delivery</h2>
      <div className="space-y-2">
        <Label>Service *</Label>
        <Select value={serviceId} onValueChange={setServiceId}>
          <SelectTrigger><SelectValue placeholder="Select a service..." /></SelectTrigger>
          <SelectContent>
            {services?.map((s: any) => (
              <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
            )) ?? <SelectItem value="" disabled>Loading services...</SelectItem>}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sd-date">Date *</Label>
          <Input id="sd-date" type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sd-duration">Duration (min)</Label>
          <Input id="sd-duration" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="30" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sd-units">Units</Label>
          <Input id="sd-units" type="number" value={units} onChange={(e) => setUnits(e.target.value)} min="1" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="sd-notes">Notes</Label>
        <Textarea id="sd-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Service delivery notes..." />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={isSubmitting || !serviceId} className="w-full">
        {isSubmitting ? "Saving..." : "Log Service"}
      </Button>
    </form>
  );
}