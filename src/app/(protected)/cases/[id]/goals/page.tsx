"use client";

import { GoalsList } from "@/components/cases/goals-list";
import { useParams } from "next/navigation";

export default function CaseGoalsPage() {
  const params = useParams();
  const id = params.id as string;
  return <GoalsList caseId={id as any} />;
}
