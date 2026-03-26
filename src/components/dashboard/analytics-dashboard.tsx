"use client";

import { useAuthedQuery } from "@/hooks/use-authed-query";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import { BarChart3, Users, TrendingUp, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function AnalyticsDashboard() {
  const stats = useAuthedQuery(api.dashboard.getAnalyticsStats, {});

  if (!stats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Organization Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Open Cases" value={stats.totalOpenCases ?? 0} icon={<BarChart3 className="h-5 w-5" />} />
        <StatCard label="New Cases (30d)" value={stats.newCases30d ?? 0} icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label="Closed Cases (30d)" value={stats.closedCases30d ?? 0} icon={<Users className="h-5 w-5" />} />
        <StatCard label="Services Delivered (30d)" value={stats.serviceDeliveries30d ?? 0} icon={<Activity className="h-5 w-5" />} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cases by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.casesByType ? (
              <div className="space-y-4">
                {Object.entries(stats.casesByType).map(([status, count]: [string, any]) => {
                  const total = Object.values(stats.casesByType).reduce((s: number, v: any) => s + (v as number), 0) as number;
                  const pct = total > 0 ? Math.round(((count as number) / total) * 100) : 0;
                  return (
                    <div key={status} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{status}</span>
                        <span className="text-muted-foreground">{count} ({pct}%)</span>
                      </div>
                      <Progress value={pct} className="h-2" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No data available.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cases by Type</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.casesByType ? (
              <div className="space-y-3">
                {Object.entries(stats.casesByType).map(([type, count]: [string, any]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm">{type}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No data available.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Key Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Avg. Resolution (days)</span>
                <Badge variant="secondary">{stats.avgResolutionDays}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Referrals (30d)</span>
                <Badge variant="outline">{stats.referrals30d}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Service Deliveries (30d)</span>
                <Badge variant="outline">{stats.serviceDeliveries30d}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}