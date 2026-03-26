"use client";

import { useAuthedQuery } from "@/hooks/use-authed-query";
import { api } from "@/convex/_generated/api";
import Link from "next/link";

export default function ReferralsListPage() {
  const referrals = useAuthedQuery(api.referrals.list, {});
  if (!referrals) return <div className="p-6">Loading referrals...</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Referrals</h1>
      <div className="space-y-2">
        {referrals.map((r: any) => (
          <div key={r._id} className="p-4 border rounded-lg">
            <div className="font-medium">{r.serviceNeeded}</div>
            <div className="text-sm text-muted-foreground">{r.status} - {r.urgency}</div>
          </div>
        ))}
        {referrals.length === 0 && <p className="text-muted-foreground">No referrals found.</p>}
      </div>
    </div>
  );
}
