"use client";

export const dynamic = "force-dynamic";

import { GoalForm } from "@/components/cases/goal-form";
import { useAuthedQuery } from "@/hooks/use-authed-query";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";

export default function NewGoalPage() {
  const params = useParams();
  const caseId = params.id as Id<"cases">;
  const caseData = useAuthedQuery(api.cases.getById, { id: caseId });
  if (!caseData) return <div className="p-6">Loading...</div>;
  return <GoalForm caseId={caseId} clientId={caseData.clientId} />;
}
