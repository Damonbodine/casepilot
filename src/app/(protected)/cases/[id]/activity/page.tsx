// @ts-nocheck
"use client";

import { CaseActivityFeed } from "@/components/cases/case-activity-feed";
import { useParams } from "next/navigation";

export default function CaseActivityPage() {
  const params = useParams();
  const id = params.id as string;
  return <CaseActivityFeed id={id} />;
}
