// @ts-nocheck
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import { BarChart3, Users, TrendingUp, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function AnalyticsDashboard() {
  const stats = useQuery(api.dashboard.getAnalyticsStats);

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
        <StatCard label="Total Clients" value={stats.totalClients ?? 0} icon={<Users className="h-5 w-5" />} />
        <StatCard label="Open Cases" value={stats.openCases ?? 0} icon={<BarChart3 className="h-5 w-5" />} />
        <StatCard label="Cases This Month" value={stats.casesThisMonth ?? 0} icon={<TrendingUp className="h-5 w-5" />} trend={stats.casesTrend ? { value: stats.casesTrend, positive: stats.casesTrend > 0 } : undefined} />
        <StatCard label="Services Delivered" value={stats.servicesDelivered ?? 0} icon={<Activity className="h-5 w-5" />} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cases by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.casesByStatus ? (
              <div className="space-y-4">
                {Object.entries(stats.casesByStatus).map(([status, count]: [string, any]) => {
                  const total = Object.values(stats.casesByStatus).reduce((s: number, v: any) => s + (v as number), 0) as number;
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
            <CardTitle>Client Demographics — Primary Need</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.clientsByPrimaryNeed ? (
              <div className="space-y-3">
                {Object.entries(stats.clientsByPrimaryNeed).map(([need, count]: [string, any]) => (
                  <div key={need} className="flex items-center justify-between">
                    <span className="text-sm">{need}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No data available.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Client Demographics — Risk Level</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.clientsByRiskLevel ? (
              <div className="space-y-3">
                {Object.entries(stats.clientsByRiskLevel).map(([level, count]: [string, any]) => (
                  <div key={level} className="flex items-center justify-between">
                    <span className="text-sm">{level}</span>
                    <Badge variant={level === "Critical" || level === "High" ? "destructive" : "secondary"}>{count}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No data available.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Delivery Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.serviceDeliveryStats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(stats.serviceDeliveryStats).map(([key, val]: [string, any]) => (
                <div key={key} className="text-center">
                  <p className="text-2xl font-bold">{val}</p>
                  <p className="text-xs text-muted-foreground">{key}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No service delivery data.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}