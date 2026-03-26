"use client";

import { DocumentList } from "@/components/cases/document-list";
import { useAuthedQuery } from "@/hooks/use-authed-query";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";

export default function CaseDocumentsPage() {
  const params = useParams();
  const caseId = params.id as Id<"cases">;
  const caseData = useAuthedQuery(api.cases.getById, { id: caseId });
  if (!caseData) return <div className="p-6">Loading...</div>;
  return <DocumentList caseId={caseId} clientId={caseData.clientId} />;
}
