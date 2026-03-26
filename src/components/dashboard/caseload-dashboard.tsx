// @ts-nocheck
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import { FolderOpen, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Intake: "outline",
  Assessment: "secondary",
  Active: "default",
  Monitoring: "secondary",
  Closed: "outline",
};

const PRIORITY_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Low: "outline",
  Medium: "secondary",
  High: "default",
  Urgent: "destructive",
};

export function CaseloadDashboard() {
  const stats = useQuery(api.dashboard.getCaseloadStats);

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
        <StatCard label="Active Cases" value={stats.activeCases ?? 0} icon={<FolderOpen className="h-5 w-5" />} />
        <StatCard label="Overdue Tasks" value={stats.overdueTasks ?? 0} icon={<AlertTriangle className="h-5 w-5" />} trend={stats.overdueTasks > 0 ? { value: stats.overdueTasks, positive: false } : undefined} />
        <StatCard label="Upcoming Deadlines" value={stats.upcomingDeadlines ?? 0} icon={<Clock className="h-5 w-5" />} />
        <StatCard label="Closed This Month" value={stats.closedThisMonth ?? 0} icon={<CheckCircle className="h-5 w-5" />} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Cases</CardTitle>
        </CardHeader>
        <CardContent>
          {(!stats.cases || stats.cases.length === 0) ? (
            <div className="py-8 text-center text-muted-foreground">No cases assigned to you.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case #</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Opened</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.cases.map((c: any) => (
                  <TableRow key={c._id}>
                    <TableCell>
                      <Link href={`/cases/${c._id}`} className="font-medium text-primary hover:underline">
                        {c.caseNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{c.clientName ?? "Unknown"}</TableCell>
                    <TableCell>{c.type}</TableCell>
                    <TableCell><Badge variant={STATUS_VARIANT[c.status] ?? "secondary"}>{c.status}</Badge></TableCell>
                    <TableCell><Badge variant={PRIORITY_VARIANT[c.priority] ?? "secondary"}>{c.priority}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{new Date(c.openDate).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {stats.overdueItems && stats.overdueItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Overdue Items</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {stats.overdueItems.map((item: any, idx: number) => (
                <li key={idx} className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span>{item.description}</span>
                  <span className="text-muted-foreground ml-auto">{item.dueDate ? new Date(item.dueDate).toLocaleDateString() : ""}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}