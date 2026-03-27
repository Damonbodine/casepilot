"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthedQuery } from "@/hooks/use-authed-query";
import { api } from "@/convex/_generated/api";

export default function HomePage() {
  const router = useRouter();
  const currentUser = useAuthedQuery(api.users.getCurrentUser);

  useEffect(() => {
    if (!currentUser) return;
    // Admin and CaseManager users see the manager/team dashboard by default
    if (currentUser.role === "Admin" || currentUser.role === "CaseManager") {
      router.replace("/dashboard/manager");
    } else {
      router.replace("/dashboard/caseload");
    }
  }, [router, currentUser]);

  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <p className="text-muted-foreground">Redirecting...</p>
    </div>
  );
}
