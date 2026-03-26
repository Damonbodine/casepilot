// @ts-nocheck
"use client";

import { ServiceDeliveryForm } from "@/components/cases/service-delivery-form";
import { useParams } from "next/navigation";

export default function NewServiceDeliveryPage() {
  const params = useParams();
  const id = params.id as string;
  return <ServiceDeliveryForm id={id} />;
}
