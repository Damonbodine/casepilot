"use client";

import { SignIn } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function SignInPage() {
  const [redirectUrl, setRedirectUrl] = useState("/dashboard/caseload");

  useEffect(() => {
    const hash = window.location.hash.replace(/^#\/?\??/, "");
    const params = new URLSearchParams(hash);
    const redirect = params.get("redirect");

    if (redirect && redirect.startsWith("/")) {
      setRedirectUrl(redirect);
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-6 px-4">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">CasePilot</h1>
          <p className="text-sm text-muted-foreground">Nonprofit Case Management Platform</p>
        </div>
        <SignIn
          fallbackRedirectUrl={redirectUrl}
          forceRedirectUrl={redirectUrl}
          appearance={{
            elements: {
              rootBox: "mx-auto w-full",
              card: "shadow-md border border-border bg-card",
              headerTitle: "text-foreground",
              headerSubtitle: "text-muted-foreground",
              formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
              footerActionLink: "text-primary hover:text-primary/80",
              formFieldInput: "border-input bg-background text-foreground",
              formFieldLabel: "text-foreground",
              identityPreviewEditButton: "text-primary",
            },
          }}
        />
      </div>
    </div>
  );
}
