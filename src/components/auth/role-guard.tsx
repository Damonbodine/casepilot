// @ts-nocheck
"use client";

import { ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type Role = "Admin" | "CaseManager" | "CaseWorker" | "IntakeSpecialist";

interface RoleGuardProps {
  allowedRoles: Role[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
  const router = useRouter();
  const currentUser = useQuery(api.users.getCurrentUser);

  if (currentUser === undefined) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (currentUser === null) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold text-foreground">Account Not Found</h2>
        <p className="text-sm text-muted-foreground">
          Your account has not been set up yet. Please contact your administrator.
        </p>
        <Button variant="outline" onClick={() => router.push("/dashboard/caseload")}>
          Go to Dashboard
        </Button>
      </div>
    );
  }

  const userRole = currentUser.role as Role;

  if (!allowedRoles.includes(userRole)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold text-foreground">Access Denied</h2>
        <p className="text-sm text-muted-foreground">
          You do not have permission to view this page. Required role:{" "}
          {allowedRoles.join(" or ")}.
        </p>
        <Button variant="outline" onClick={() => router.push("/dashboard/caseload")}>
          Go to Dashboard
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
