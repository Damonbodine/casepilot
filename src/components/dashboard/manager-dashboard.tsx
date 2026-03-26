// @ts-nocheck
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import { Users, AlertTriangle, Clock, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function ManagerDashboard() {
  const stats = useQuery(api.dashboard.getManagerStats);

  if (!stats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Team Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Team Members" value={stats.teamMembers ?? 0} icon={<Users className="h-5 w-5" />} />
        <StatCard label="Total Active Cases" value={stats.totalActiveCases ?? 0} icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label="Stale Cases" value={stats.staleCases ?? 0} icon={<AlertTriangle className="h-5 w-5" />} trend={stats.staleCases > 0 ? { value: stats.staleCases, positive: false } : undefined} />
        <StatCard label="Avg. Case Age (days)" value={stats.avgCaseAge ?? 0} icon={<Clock className="h-5 w-5" />} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Caseload</CardTitle>
        </CardHeader>
        <CardContent>
          {(!stats.workerCaseloads || stats.workerCaseloads.length === 0) ? (
            <div className="py-8 text-center text-muted-foreground">No team data available.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Worker</TableHead>
                  <TableHead>Active Cases</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Overdue</TableHead>
                  <TableHead>Load</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.workerCaseloads.map((w: any) => {
                  const loadPct = w.caseloadLimit ? Math.round((w.activeCases / w.caseloadLimit) * 100) : 0;
                  return (
                    <TableRow key={w.userId}>
                      <TableCell className="font-medium">{w.name}</TableCell>
                      <TableCell>{w.activeCases}</TableCell>
                      <TableCell>{w.caseloadLimit ?? "N/A"}</TableCell>
                      <TableCell>
                        {w.overdueCount > 0 ? (
                          <Badge variant="destructive">{w.overdueCount}</Badge>
                        ) : (
                          <Badge variant="outline">0</Badge>
                        )}
                      </TableCell>
                      <TableCell className="w-32">
                        <Progress value={loadPct} className="h-2" />
                        <span className="text-xs text-muted-foreground">{loadPct}%</span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Case Aging</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.caseAging ? (
              <div className="space-y-3">
                {Object.entries(stats.caseAging).map(([bucket, count]: [string, any]) => (
                  <div key={bucket} className="flex items-center justify-between">
                    <span className="text-sm">{bucket}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No aging data available.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stale Cases (No Activity 14+ Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {(!stats.staleCasesList || stats.staleCasesList.length === 0) ? (
              <p className="text-muted-foreground text-sm">No stale cases. Great work!</p>
            ) : (
              <ul className="space-y-2">
                {stats.staleCasesList.map((c: any) => (
                  <li key={c._id} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{c.caseNumber}</span>
                    <span className="text-muted-foreground">{c.daysSinceActivity} days</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}