// @ts-nocheck
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ServiceDeliveryForm } from "@/components/cases/service-delivery-form";
import { Plus, Truck } from "lucide-react";
import { useState } from "react";

interface ServiceDeliveryListProps {
  caseId: Id<"cases">;
}

export function ServiceDeliveryList({ caseId }: ServiceDeliveryListProps) {
  const deliveries = useQuery(api.serviceDeliveries.listByCase, { caseId });
  const [formOpen, setFormOpen] = useState(false);

  if (!deliveries) {
    return <Skeleton className="h-48 w-full" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Service Deliveries ({deliveries.length})</h2>
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Log Service</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <ServiceDeliveryForm caseId={caseId} clientId={"" as any} />
          </DialogContent>
        </Dialog>
      </div>

      {deliveries.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground"><Truck className="h-8 w-8 mx-auto mb-2 opacity-50" />No services delivered yet.</CardContent></Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Units</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deliveries.map((d: any) => (
              <TableRow key={d._id}>
                <TableCell className="font-medium">{d.serviceName || d.serviceId}</TableCell>
                <TableCell>{d.deliveryDate ? new Date(d.deliveryDate).toLocaleDateString() : "N/A"}</TableCell>
                <TableCell>{d.duration ? `${d.duration} min` : "N/A"}</TableCell>
                <TableCell>{d.units ?? "N/A"}</TableCell>
                <TableCell><Badge variant={d.status === "Completed" ? "default" : "secondary"}>{d.status}</Badge></TableCell>
                <TableCell className="max-w-48 truncate text-muted-foreground">{d.notes || ""}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}