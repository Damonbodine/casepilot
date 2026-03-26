"use client";

import { useAuthedQuery } from "@/hooks/use-authed-query";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ReferralForm } from "@/components/cases/referral-form";
import { Plus, ExternalLink } from "lucide-react";
import { useState } from "react";

interface ReferralListProps {
  caseId: Id<"cases">;
}

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Pending: "outline", Accepted: "default", Declined: "destructive", Completed: "secondary", Cancelled: "destructive",
};

export function ReferralList({ caseId }: ReferralListProps) {
  const referrals = useAuthedQuery(api.referrals.listByCase, { caseId });
  const [formOpen, setFormOpen] = useState(false);

  if (!referrals) {
    return <Skeleton className="h-48 w-full" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Referrals ({referrals.length})</h2>
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogTrigger>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Referral</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <ReferralForm caseId={caseId} clientId={"" as any} />
          </DialogContent>
        </Dialog>
      </div>

      {referrals.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground"><ExternalLink className="h-8 w-8 mx-auto mb-2 opacity-50" />No referrals for this case.</CardContent></Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Partner</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sent Date</TableHead>
              <TableHead>Response Date</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {referrals.map((r: any) => (
              <TableRow key={r._id}>
                <TableCell className="font-medium">{r.partnerName || r.partnerId}</TableCell>
                <TableCell className="max-w-48 truncate">{r.reason}</TableCell>
                <TableCell><Badge variant={STATUS_VARIANT[r.status] ?? "secondary"}>{r.status}</Badge></TableCell>
                <TableCell className="text-muted-foreground">{r.sentDate ? new Date(r.sentDate).toLocaleDateString() : "N/A"}</TableCell>
                <TableCell className="text-muted-foreground">{r.responseDate ? new Date(r.responseDate).toLocaleDateString() : "N/A"}</TableCell>
                <TableCell className="max-w-32 truncate text-muted-foreground">{r.notes || ""}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}