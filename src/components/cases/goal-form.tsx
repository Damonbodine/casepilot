"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

const CATEGORIES = ["Housing", "Employment", "Education", "Health", "Financial", "Legal", "Social", "LifeSkills", "Other"];
const STATUSES = ["NotStarted", "InProgress", "OnHold", "Completed", "Abandoned"];

interface GoalFormProps {
  caseId: Id<"cases">;
  clientId: Id<"clients">;
}

export function GoalForm({ caseId, clientId }: GoalFormProps) {
  const createGoal = useMutation(api.goals.create);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Other");
  const [targetDate, setTargetDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await createGoal({
        caseId,
        clientId,
        title,
        description: description || undefined,
        category,
        targetDate: targetDate || undefined,
        status: "NotStarted",
        progressPercent: 0,
      });
      setTitle("");
      setDescription("");
      setCategory("Other");
      setTargetDate("");
    } catch (err: any) {
      setError(err.message || "Failed to create goal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold">Create Goal</h2>
      <div className="space-y-2">
        <Label htmlFor="goal-title">Title *</Label>
        <Input id="goal-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Secure stable housing" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="goal-desc">Description</Label>
        <Textarea id="goal-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Describe the goal and milestones..." />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="goal-target">Target Date</Label>
          <Input id="goal-target" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={isSubmitting || !title.trim()} className="w-full">
        {isSubmitting ? "Creating..." : "Create Goal"}
      </Button>
    </form>
  );
}