"use client";

import { useAuthedQuery } from "@/hooks/use-authed-query";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import { Users, AlertTriangle, Clock, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function ManagerDashboard() {
  const stats = useAuthedQuery(api.dashboard.getManagerStats, {});

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
        <StatCard label="Team Members" value={stats.totalWorkers ?? 0} icon={<Users className="h-5 w-5" />} />
        <StatCard label="Total Active Cases" value={stats.totalActive ?? 0} icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label="Total Closed" value={stats.totalClosed ?? 0} icon={<AlertTriangle className="h-5 w-5" />} />
        <StatCard label="Total Clients" value={stats.totalClients ?? 0} icon={<Clock className="h-5 w-5" />} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Caseload</CardTitle>
        </CardHeader>
        <CardContent>
          {(!stats.workerStats || stats.workerStats.length === 0) ? (
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
                {stats.workerStats.map((w: any) => {
                  const loadPct = w.caseloadLimit ? Math.round((w.activeCases / w.caseloadLimit) * 100) : 0;
                  return (
                    <TableRow key={w.workerId}>
                      <TableCell className="font-medium">{w.workerName}</TableCell>
                      <TableCell>{w.activeCases}</TableCell>
                      <TableCell>{w.caseloadLimit ?? "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">-</Badge>
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
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Total Cases</span>
                <Badge variant="secondary">{stats.totalCases}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Active Cases</span>
                <Badge variant="default">{stats.totalActive}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Active Clients</span>
                <Badge variant="outline">{stats.activeClients}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}