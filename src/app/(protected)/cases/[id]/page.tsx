"use client";

export const dynamic = "force-dynamic";

import { CaseWorkspace } from "@/components/cases/case-workspace";
import { useParams } from "next/navigation";

export default function CaseWorkspacePage() {
  const params = useParams();
  const id = params.id as string;
  return <CaseWorkspace caseId={id as any} />;
}
