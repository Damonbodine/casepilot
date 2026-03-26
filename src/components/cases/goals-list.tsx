// @ts-nocheck
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { GoalForm } from "@/components/cases/goal-form";
import { Plus, Target, Calendar } from "lucide-react";
import { useState } from "react";

interface GoalsListProps {
  caseId: Id<"cases">;
}

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  NotStarted: "outline", InProgress: "default", Completed: "secondary", OnHold: "destructive",
};

export function GoalsList({ caseId }: GoalsListProps) {
  const goals = useQuery(api.goals.listByCase, { caseId });
  const [formOpen, setFormOpen] = useState(false);

  if (!goals) {
    return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Goals ({goals.length})</h2>
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Goal</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <GoalForm caseId={caseId} clientId={"" as any} />
          </DialogContent>
        </Dialog>
      </div>

      {goals.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground"><Target className="h-8 w-8 mx-auto mb-2 opacity-50" />No goals set for this case.</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal: any) => (
            <Card key={goal._id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{goal.title}</CardTitle>
                  <Badge variant={STATUS_VARIANT[goal.status] ?? "secondary"} className="text-xs">{goal.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {goal.description && <p className="text-sm text-muted-foreground">{goal.description}</p>}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>Progress</span>
                    <span className="font-medium">{goal.progressPercent ?? 0}%</span>
                  </div>
                  <Progress value={goal.progressPercent ?? 0} className="h-2" />
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {goal.targetDate && (
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                  )}
                  {goal.category && <Badge variant="outline" className="text-xs">{goal.category}</Badge>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}