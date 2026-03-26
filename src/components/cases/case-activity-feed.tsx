"use client";

import { useAuthedQuery } from "@/hooks/use-authed-query";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRightLeft,
  FileText,
  Target,
  Truck,
  ExternalLink,
  MessageSquare,
  Upload,
  Activity,
} from "lucide-react";

interface CaseActivityFeedProps {
  caseId: Id<"cases">;
}

const ACTIVITY_ICONS: Record<string, any> = {
  StatusChange: ArrowRightLeft,
  Assignment: ArrowRightLeft,
  NoteAdded: MessageSquare,
  DocumentUploaded: Upload,
  ServiceDelivered: Truck,
  GoalCreated: Target,
  GoalUpdated: Target,
  ReferralCreated: ExternalLink,
  ReferralStatusChanged: ExternalLink,
};

export function CaseActivityFeed({ caseId }: CaseActivityFeedProps) {
  const activities = useAuthedQuery(api.caseActivities.listByCase, { caseId });

  if (!activities) {
    return <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>;
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
          No activity recorded yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-1">
      <h2 className="text-lg font-semibold mb-4">Activity Timeline</h2>
      <div className="relative pl-8">
        <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />
        {activities.map((activity: any, idx: number) => {
          const Icon = ACTIVITY_ICONS[activity.type] || Activity;
          return (
            <div key={activity._id || idx} className="relative mb-6">
              <div className="absolute -left-8 top-0 h-6 w-6 rounded-full bg-background border-2 border-border flex items-center justify-center">
                <Icon className="h-3 w-3 text-muted-foreground" />
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{activity.type}</Badge>
                    {activity.userName && <span className="text-xs text-muted-foreground">by {activity.userName}</span>}
                  </div>
                  <p className="text-sm mt-1">{activity.description}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                  {activity.createdAt ? new Date(activity.createdAt).toLocaleString() : ""}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}