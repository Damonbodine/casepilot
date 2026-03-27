"use client";

export const dynamic = "force-dynamic";

import { ReferralList } from "@/components/cases/referral-list";
import { useParams } from "next/navigation";

export default function CaseReferralsPage() {
  const params = useParams();
  const id = params.id as string;
  return <ReferralList caseId={id as any} />;
}
