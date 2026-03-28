"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldAlert, ChevronDown, ChevronUp, Sparkles, Loader2, AlertTriangle } from "lucide-react";

interface RiskAssessmentCardProps {
  clientId: Id<"clients">;
}

const SCORE_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Low: "outline",
  Medium: "secondary",
  High: "default",
  Critical: "destructive",
};

const SCORE_COLOR: Record<string, string> = {
  Low: "text-green-600",
  Medium: "text-yellow-600",
  High: "text-orange-600",
  Critical: "text-red-600",
};

export function RiskAssessmentCard({ clientId }: RiskAssessmentCardProps) {
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const assessRisk = useAction(api.ai.assessRisk);

  async function handleAssess() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await assessRisk({ clientId });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate risk assessment");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldAlert className="h-4 w-4" />
            AI Risk Assessment
          </CardTitle>
          {!result && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAssess}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Assess Risk
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4" />
            {error}
            <Button variant="ghost" size="sm" onClick={handleAssess}>
              Retry
            </Button>
          </div>
        )}

        {result && !isLoading && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className={`text-3xl font-bold ${SCORE_COLOR[result.level] ?? "text-foreground"}`}>
                  {result.score}
                </span>
                <span className="text-sm text-muted-foreground">/10</span>
              </div>
              <Badge variant={SCORE_VARIANT[result.level] ?? "secondary"}>
                {result.level} Risk
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto"
                onClick={handleAssess}
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Re-assess
              </Button>
            </div>

            <div>
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                {expanded ? "Hide" : "Show"} reasoning
              </button>

              {expanded && (
                <div className="mt-3 space-y-3">
                  <p className="text-sm whitespace-pre-wrap">{result.reasoning}</p>
                  {result.factors?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Risk Factors</p>
                      {result.factors.map((f: any, i: number) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <Badge
                            variant="outline"
                            className={
                              f.impact === "negative"
                                ? "border-red-300 text-red-700"
                                : f.impact === "positive"
                                  ? "border-green-300 text-green-700"
                                  : ""
                            }
                          >
                            {f.impact}
                          </Badge>
                          <div>
                            <span className="font-medium">{f.name}:</span>{" "}
                            <span className="text-muted-foreground">{f.detail}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {!result && !isLoading && !error && (
          <p className="text-sm text-muted-foreground">
            Click &quot;Assess Risk&quot; to generate an AI-powered risk assessment based on client intake data.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
