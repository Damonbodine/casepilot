"use client";

import { useAuthedQuery } from "@/hooks/use-authed-query";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import { FolderOpen, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Open: "outline",
  InProgress: "default",
  PendingReview: "secondary",
  OnHold: "destructive",
  Closed: "outline",
  Reopened: "secondary",
};

const PRIORITY_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Low: "outline",
  Medium: "secondary",
  High: "default",
  Urgent: "destructive",
};

export function CaseloadDashboard() {
  const stats = useAuthedQuery(api.dashboard.getCaseloadStats, {});

  if (!stats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Caseload</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Cases" value={stats.totalActive ?? 0} icon={<FolderOpen className="h-5 w-5" />} />
        <StatCard label="Overdue" value={stats.overdueCount ?? 0} icon={<AlertTriangle className="h-5 w-5" />} trend={stats.overdueCount > 0 ? { value: stats.overdueCount, positive: false } : undefined} />
        <StatCard label="Recent Activities" value={stats.recentActivities ?? 0} icon={<Clock className="h-5 w-5" />} />
        <StatCard label="Closed" value={stats.totalClosed ?? 0} icon={<CheckCircle className="h-5 w-5" />} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Cases by Status</CardTitle></CardHeader>
          <CardContent>
            {stats.statusCounts && Object.keys(stats.statusCounts).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(stats.statusCounts).map(([status, count]: [string, any]) => (
                  <div key={status} className="flex items-center justify-between text-sm">
                    <span><Badge variant={STATUS_VARIANT[status] ?? "secondary"}>{status}</Badge></span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No cases assigned.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Cases by Priority</CardTitle></CardHeader>
          <CardContent>
            {stats.priorityCounts && Object.keys(stats.priorityCounts).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(stats.priorityCounts).map(([priority, count]: [string, any]) => (
                  <div key={priority} className="flex items-center justify-between text-sm">
                    <span><Badge variant={PRIORITY_VARIANT[priority] ?? "secondary"}>{priority}</Badge></span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No cases assigned.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}