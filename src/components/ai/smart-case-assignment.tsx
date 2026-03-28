"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, AlertTriangle, UserCheck, ChevronDown, ChevronUp } from "lucide-react";

interface SmartCaseAssignmentProps {
  clientId: string;
  caseType: string;
  orgId: Id<"organizations">;
  onSelectWorker: (workerId: string) => void;
}

export function SmartCaseAssignment({
  clientId,
  caseType,
  orgId,
  onSelectWorker,
}: SmartCaseAssignmentProps) {
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const suggest = useAction(api.ai.suggestCaseWorker);

  async function handleSuggest() {
    if (!clientId || !caseType) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await suggest({
        clientId: clientId as Id<"clients">,
        caseType,
        orgId,
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get AI suggestion");
    } finally {
      setIsLoading(false);
    }
  }

  if (!clientId || !caseType) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleSuggest}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              Finding best match...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-3 w-3" />
              AI Suggest Worker
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-destructive">
          <AlertTriangle className="h-3 w-3" />
          {error}
        </div>
      )}

      {result && !isLoading && result.suggestedWorkerId && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="py-3 px-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                AI Suggestion: {result.workerName}
              </span>
              <Badge variant="secondary" className="text-xs">Recommended</Badge>
              <Button
                type="button"
                variant="default"
                size="sm"
                className="ml-auto"
                onClick={() => onSelectWorker(result.suggestedWorkerId)}
              >
                Assign
              </Button>
            </div>
            <div className="mt-1">
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {expanded ? "Hide" : "Show"} reasoning
              </button>
              {expanded && (
                <div className="mt-2 space-y-2">
                  <p className="text-xs text-muted-foreground">{result.reasoning}</p>
                  {result.factors?.length > 0 && (
                    <div className="space-y-1">
                      {result.factors.map((f: any, i: number) => (
                        <div key={i} className="text-xs">
                          <span className="font-medium">{f.factor}:</span>{" "}
                          <span className="text-muted-foreground">{f.detail}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
