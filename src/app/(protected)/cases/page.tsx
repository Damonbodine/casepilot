"use client";

export const dynamic = "force-dynamic";

import { useAuthedQuery } from "@/hooks/use-authed-query";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { withPreservedDemoQuery } from "@/lib/demo";

export default function CasesListPage() {
  const cases = useAuthedQuery(api.cases.list, {});
  const searchParams = useSearchParams();
  if (!cases) return <div className="p-6">Loading cases...</div>;

  return (
    <div className="p-6 space-y-4" data-demo="cases-list">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Cases</h1>
      </div>
      <div className="space-y-2">
        {cases.map((c: any, index: number) => (
          <Link
            key={c._id}
            href={withPreservedDemoQuery(`/cases/${c._id}`, searchParams)}
            className="block p-4 border rounded-lg hover:bg-muted/50"
            data-demo={index === 0 ? "primary-case-link" : undefined}
          >
            <div className="font-medium">{c.caseNumber}</div>
            <div className="text-sm text-muted-foreground">{c.status} - {c.priority}</div>
          </Link>
        ))}
        {cases.length === 0 && <p className="text-muted-foreground">No cases found.</p>}
      </div>
    </div>
  );
}
