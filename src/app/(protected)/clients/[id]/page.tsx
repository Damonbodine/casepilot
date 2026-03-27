"use client";

export const dynamic = "force-dynamic";

import { ClientProfile } from "@/components/clients/client-profile";
import { useParams } from "next/navigation";

export default function ClientProfilePage() {
  const params = useParams();
  const id = params.id as string;
  return <ClientProfile clientId={id as any} />;
}
