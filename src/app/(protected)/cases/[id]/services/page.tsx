// @ts-nocheck
"use client";

import { ServiceDeliveryList } from "@/components/cases/service-delivery-list";
import { useParams } from "next/navigation";

export default function CaseServicesPage() {
  const params = useParams();
  const id = params.id as string;
  return <ServiceDeliveryList id={id} />;
}
