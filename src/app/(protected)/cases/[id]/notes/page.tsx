"use client";

export const dynamic = "force-dynamic";

import { CaseNotesList } from "@/components/cases/case-notes-list";
import { useParams } from "next/navigation";

export default function CaseNotesPage() {
  const params = useParams();
  const id = params.id as string;
  return <CaseNotesList caseId={id as any} />;
}
