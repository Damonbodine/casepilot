// @ts-nocheck
"use client";

import { GoalForm } from "@/components/cases/goal-form";
import { useParams } from "next/navigation";

export default function NewGoalPage() {
  const params = useParams();
  const id = params.id as string;
  return <GoalForm id={id} />;
}
