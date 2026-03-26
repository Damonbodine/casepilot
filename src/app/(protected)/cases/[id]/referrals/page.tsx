// @ts-nocheck
"use client";

import { ReferralList } from "@/components/cases/referral-list";
import { useParams } from "next/navigation";

export default function CaseReferralsPage() {
  const params = useParams();
  const id = params.id as string;
  return <ReferralList id={id} />;
}
