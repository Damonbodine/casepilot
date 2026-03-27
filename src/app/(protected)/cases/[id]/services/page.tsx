"use client";

export const dynamic = "force-dynamic";

import { ServiceDeliveryList } from "@/components/cases/service-delivery-list";
import { useParams } from "next/navigation";

export default function CaseServicesPage() {
  const params = useParams();
  const id = params.id as string;
  return <ServiceDeliveryList caseId={id as any} />;
}
