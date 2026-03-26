"use client";

import { useAuthedQuery } from "@/hooks/use-authed-query";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";

const COLUMNS = ["Open", "InProgress", "PendingReview", "OnHold", "Closed", "Reopened"] as const;

const COLUMN_LABELS: Record<string, string> = {
  Open: "Open",
  InProgress: "In Progress",
  PendingReview: "Pending Review",
  OnHold: "On Hold",
  Closed: "Closed",
  Reopened: "Reopened",
};

const COLUMN_COLORS: Record<string, string> = {
  Open: "bg-blue-500/10 border-blue-500/30",
  InProgress: "bg-green-500/10 border-green-500/30",
  PendingReview: "bg-yellow-500/10 border-yellow-500/30",
  OnHold: "bg-purple-500/10 border-purple-500/30",
  Closed: "bg-muted border-border",
  Reopened: "bg-orange-500/10 border-orange-500/30",
};

const PRIORITY_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Low: "outline", Medium: "secondary", High: "default", Urgent: "destructive",
};

export function CasePipelineKanban() {
  const cases = useAuthedQuery(api.cases.listByStatus, {});

  if (!cases) {
    return (
      <div className="grid grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-8 w-full" />
            {Array.from({ length: 3 }).map((_, j) => <Skeleton key={j} className="h-24 w-full" />)}
          </div>
        ))}
      </div>
    );
  }

  const grouped: Record<string, any[]> = {};
  COLUMNS.forEach((col) => { grouped[col] = []; });
  if (Array.isArray(cases)) {
    cases.forEach((c: any) => {
      if (grouped[c.status]) grouped[c.status].push(c);
    });
  } else if (typeof cases === "object") {
    Object.entries(cases).forEach(([status, items]: [string, any]) => {
      if (grouped[status] && Array.isArray(items)) grouped[status] = items;
    });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Case Pipeline</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {COLUMNS.map((status) => (
          <div key={status} className={`rounded-lg border p-3 ${COLUMN_COLORS[status]}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">{COLUMN_LABELS[status]}</h3>
              <Badge variant="secondary" className="text-xs">{grouped[status].length}</Badge>
            </div>
            <ScrollArea className="h-[calc(100vh-280px)]">
              <div className="space-y-2">
                {grouped[status].length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No cases</p>
                ) : (
                  grouped[status].map((c: any) => (
                    <Link key={c._id} href={`/cases/${c._id}`}>
                      <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                        <CardContent className="p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-xs">{c.caseNumber}</span>
                            <Badge variant={PRIORITY_VARIANT[c.priority] ?? "secondary"} className="text-xs">{c.priority}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{c.clientName ?? c.description?.slice(0, 50) ?? ""}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{c.type}</span>
                            <span>{c.openDate ? new Date(c.openDate).toLocaleDateString() : ""}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        ))}
      </div>
    </div>
  );
}