// @ts-nocheck
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";

export default function CasesListPage() {
  const cases = useQuery(api.cases.list, {});
  if (!cases) return <div className="p-6">Loading cases...</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Cases</h1>
      </div>
      <div className="space-y-2">
        {cases.map((c: any) => (
          <Link key={c._id} href={`/cases/${c._id}`} className="block p-4 border rounded-lg hover:bg-muted/50">
            <div className="font-medium">{c.caseNumber}</div>
            <div className="text-sm text-muted-foreground">{c.status} - {c.priority}</div>
          </Link>
        ))}
        {cases.length === 0 && <p className="text-muted-foreground">No cases found.</p>}
      </div>
    </div>
  );
}
