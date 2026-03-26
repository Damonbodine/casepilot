"use client";

import { CaseWorkspace } from "@/components/cases/case-workspace";
import { useParams } from "next/navigation";

export default function CaseWorkspacePage() {
  const params = useParams();
  const id = params.id as string;
  return <CaseWorkspace caseId={id as any} />;
}
