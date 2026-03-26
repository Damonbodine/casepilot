"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/caseload");
  }, [router]);
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <p className="text-muted-foreground">Redirecting...</p>
    </div>
  );
}
