// @ts-nocheck
"use client";

import { ReferralForm } from "@/components/cases/referral-form";
import { useParams } from "next/navigation";

export default function NewReferralPage() {
  const params = useParams();
  const id = params.id as string;
  return <ReferralForm id={id} />;
}
