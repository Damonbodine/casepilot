"use client";

import { useAuthedQuery } from "@/hooks/use-authed-query";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Phone, Mail, MapPin, AlertTriangle, Calendar } from "lucide-react";
import Link from "next/link";
import { RiskAssessmentCard } from "@/components/ai/risk-assessment-card";
import { ServiceRecommendations } from "@/components/ai/service-recommendations";

interface ClientProfileProps {
  clientId: Id<"clients">;
}

const RISK_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Low: "outline", Medium: "secondary", High: "default", Critical: "destructive",
};

export function ClientProfile({ clientId }: ClientProfileProps) {
  const client = useAuthedQuery(api.clients.getById, { id: clientId });
  const cases = useAuthedQuery(api.cases.list, {});
  const documents = useAuthedQuery(api.documents.listByClient, { clientId });

  if (!client) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const clientCases = cases?.filter((c: any) => c.clientId === clientId) ?? [];

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary/10 text-primary text-xl">
                {client.firstName?.[0]}{client.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{client.firstName} {client.lastName}</h1>
                <Badge variant={client.status === "Active" ? "default" : "secondary"}>{client.status}</Badge>
                <Badge variant={RISK_VARIANT[client.riskLevel] ?? "secondary"}>{client.riskLevel} Risk</Badge>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {client.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{client.email}</span>}
                {client.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{client.phone}</span>}
                {client.city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{client.city}, {client.state}</span>}
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Intake: {client.intakeDate ? new Date(client.intakeDate).toLocaleDateString() : "N/A"}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RiskAssessmentCard clientId={clientId} />
        <ServiceRecommendations clientId={clientId} />
      </div>

      <Tabs defaultValue="demographics">
        <TabsList>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="cases">Cases ({clientCases.length})</TabsTrigger>
          <TabsTrigger value="documents">Documents ({documents?.length ?? 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="demographics" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-sm">
                <div><span className="text-muted-foreground">Date of Birth:</span> {client.dateOfBirth ? new Date(client.dateOfBirth).toLocaleDateString() : "N/A"}</div>
                <div><span className="text-muted-foreground">Gender:</span> {client.gender}</div>
                <div><span className="text-muted-foreground">Race:</span> {client.race || "Not specified"}</div>
                <div><span className="text-muted-foreground">Language:</span> {client.preferredLanguage}</div>
                <div><span className="text-muted-foreground">Primary Need:</span> {client.primaryNeed}</div>
                <div><span className="text-muted-foreground">Address:</span> {[client.address, client.city, client.state, client.zipCode].filter(Boolean).join(", ") || "N/A"}</div>
              </div>
            </CardContent>
          </Card>
          <Card className="mt-4">
            <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Emergency Contact</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div><span className="text-muted-foreground">Name:</span> {client.emergencyContactName}</div>
                <div><span className="text-muted-foreground">Phone:</span> {client.emergencyContactPhone}</div>
                <div><span className="text-muted-foreground">Relationship:</span> {client.emergencyContactRelation}</div>
              </div>
            </CardContent>
          </Card>
          {client.notes && (
            <Card className="mt-4">
              <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
              <CardContent><p className="text-sm whitespace-pre-wrap">{client.notes}</p></CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="cases" className="mt-4">
          {clientCases.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No cases for this client.</CardContent></Card>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Case #</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead>Priority</TableHead><TableHead>Opened</TableHead></TableRow></TableHeader>
              <TableBody>
                {clientCases.map((c: any) => (
                  <TableRow key={c._id}>
                    <TableCell><Link href={`/cases/${c._id}`} className="font-medium text-primary hover:underline">{c.caseNumber}</Link></TableCell>
                    <TableCell>{c.type}</TableCell>
                    <TableCell><Badge variant="secondary">{c.status}</Badge></TableCell>
                    <TableCell><Badge variant="outline">{c.priority}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{new Date(c.openDate).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          {(!documents || documents.length === 0) ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No documents uploaded.</CardContent></Card>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Uploaded</TableHead></TableRow></TableHeader>
              <TableBody>
                {documents.map((d: any) => (
                  <TableRow key={d._id}>
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell>{d.type}</TableCell>
                    <TableCell className="text-muted-foreground">{new Date(d.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}