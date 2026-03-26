// @ts-nocheck
"use client";

import { DocumentList } from "@/components/cases/document-list";
import { useParams } from "next/navigation";

export default function CaseDocumentsPage() {
  const params = useParams();
  const id = params.id as string;
  return <DocumentList id={id} />;
}
