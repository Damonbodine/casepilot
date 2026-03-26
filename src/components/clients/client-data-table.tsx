"use client";

import { useState } from "react";
import { useAuthedQuery } from "@/hooks/use-authed-query";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, X } from "lucide-react";
import Link from "next/link";

const STATUSES = ["Active", "Inactive", "Waitlisted", "Discharged", "Referred"];
const RISK_LEVELS = ["Low", "Medium", "High", "Critical"];

const RISK_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Low: "outline", Medium: "secondary", High: "default", Critical: "destructive",
};

interface ClientDataTableProps {
  organizationId?: Id<"organizations">;
}

export function ClientDataTable({ organizationId }: ClientDataTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");

  const clients = useAuthedQuery(api.clients.list, {});

  if (!clients) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  let filtered = clients;
  if (organizationId) {
    filtered = filtered.filter((c: any) => c.organizationId === organizationId);
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter((c: any) =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      (c.email && c.email.toLowerCase().includes(q))
    );
  }
  if (statusFilter !== "all") {
    filtered = filtered.filter((c: any) => c.status === statusFilter);
  }
  if (riskFilter !== "all") {
    filtered = filtered.filter((c: any) => c.riskLevel === riskFilter);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search clients..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={riskFilter} onValueChange={setRiskFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Risk" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Risk Levels</SelectItem>
            {RISK_LEVELS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
        {(search || statusFilter !== "all" || riskFilter !== "all") && (
          <Button variant="ghost" size="icon" onClick={() => { setSearch(""); setStatusFilter("all"); setRiskFilter("all"); }}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">No clients found.</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Risk Level</TableHead>
              <TableHead>Primary Need</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Intake Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((client: any) => (
              <TableRow key={client._id}>
                <TableCell>
                  <Link href={`/clients/${client._id}`} className="font-medium text-primary hover:underline">
                    {client.firstName} {client.lastName}
                  </Link>
                </TableCell>
                <TableCell><Badge variant={client.status === "Active" ? "default" : "secondary"}>{client.status}</Badge></TableCell>
                <TableCell><Badge variant={RISK_VARIANT[client.riskLevel] ?? "secondary"}>{client.riskLevel}</Badge></TableCell>
                <TableCell className="text-sm">{client.primaryNeed}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{client.phone || "N/A"}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{client.intakeDate ? new Date(client.intakeDate).toLocaleDateString() : "N/A"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <p className="text-xs text-muted-foreground">{filtered.length} client{filtered.length !== 1 ? "s" : ""}</p>
    </div>
  );
}