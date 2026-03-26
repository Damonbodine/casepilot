// @ts-nocheck
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CaseNotesList } from "@/components/cases/case-notes-list";
import { CaseActivityFeed } from "@/components/cases/case-activity-feed";
import { GoalsList } from "@/components/cases/goals-list";
import { ServiceDeliveryList } from "@/components/cases/service-delivery-list";
import { DocumentList } from "@/components/cases/document-list";
import { ReferralList } from "@/components/cases/referral-list";
import { Calendar, User, Clock, FileText } from "lucide-react";

interface CaseWorkspaceProps {
  caseId: Id<"cases">;
}

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Intake: "outline", Assessment: "secondary", Active: "default", Monitoring: "secondary", Closed: "outline",
};

export function CaseWorkspace({ caseId }: CaseWorkspaceProps) {
  const caseData = useQuery(api.cases.getById, { id: caseId });

  if (!caseData) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{caseData.caseNumber}</h1>
                <Badge variant={STATUS_VARIANT[caseData.status] ?? "secondary"}>{caseData.status}</Badge>
                <Badge variant="outline">{caseData.priority}</Badge>
                <Badge variant="secondary">{caseData.type}</Badge>
              </div>
              <p className="text-sm text-muted-foreground max-w-2xl">{caseData.description}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Opened: {caseData.openDate ? new Date(caseData.openDate).toLocaleDateString() : "N/A"}</span>
            {caseData.targetCloseDate && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Target: {new Date(caseData.targetCloseDate).toLocaleDateString()}</span>}
            <span className="flex items-center gap-1"><User className="h-3 w-3" />Risk at Intake: {caseData.riskAtIntake}</span>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Case Details</CardTitle></CardHeader>
              <CardContent className="text-sm space-y-2">
                <div><span className="text-muted-foreground">Case Number:</span> {caseData.caseNumber}</div>
                <div><span className="text-muted-foreground">Type:</span> {caseData.type}</div>
                <div><span className="text-muted-foreground">Priority:</span> {caseData.priority}</div>
                <div><span className="text-muted-foreground">Status:</span> {caseData.status}</div>
                <div><span className="text-muted-foreground">Opened:</span> {caseData.openDate ? new Date(caseData.openDate).toLocaleDateString() : "N/A"}</div>
                {caseData.closeDate && <div><span className="text-muted-foreground">Closed:</span> {new Date(caseData.closeDate).toLocaleDateString()}</div>}
                {caseData.resolution && <div><span className="text-muted-foreground">Resolution:</span> {caseData.resolution}</div>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Intake Assessment</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{caseData.intakeAssessment || "No intake assessment recorded."}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notes" className="mt-4">
          <CaseNotesList caseId={caseId} />
        </TabsContent>
        <TabsContent value="activity" className="mt-4">
          <CaseActivityFeed caseId={caseId} />
        </TabsContent>
        <TabsContent value="goals" className="mt-4">
          <GoalsList caseId={caseId} />
        </TabsContent>
        <TabsContent value="services" className="mt-4">
          <ServiceDeliveryList caseId={caseId} />
        </TabsContent>
        <TabsContent value="documents" className="mt-4">
          <DocumentList caseId={caseId} clientId={caseData.clientId} />
        </TabsContent>
        <TabsContent value="referrals" className="mt-4">
          <ReferralList caseId={caseId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}