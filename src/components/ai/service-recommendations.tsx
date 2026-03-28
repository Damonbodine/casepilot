"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Lightbulb, Sparkles, Loader2, AlertTriangle } from "lucide-react";

interface ServiceRecommendationsProps {
  clientId: Id<"clients">;
}

const PRIORITY_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  high: "default",
  medium: "secondary",
  low: "outline",
};

export function ServiceRecommendations({ clientId }: ServiceRecommendationsProps) {
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recommend = useAction(api.ai.recommendServices);

  async function handleRecommend() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await recommend({ clientId });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate recommendations");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="h-4 w-4" />
            AI Service Recommendations
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRecommend}
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
                {result ? "Refresh" : "Get Recommendations"}
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4" />
            {error}
            <Button variant="ghost" size="sm" onClick={handleRecommend}>
              Retry
            </Button>
          </div>
        )}

        {result && !isLoading && (
          <div className="space-y-3">
            {result.recommendations?.length === 0 ? (
              <p className="text-sm text-muted-foreground">No matching services found for this client.</p>
            ) : (
              result.recommendations?.map((rec: any, i: number) => (
                <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                    {i + 1}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{rec.serviceName}</span>
                      <Badge variant={PRIORITY_VARIANT[rec.priority] ?? "outline"} className="text-xs">
                        {rec.priority}
                      </Badge>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {rec.matchScore}% match
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{rec.reasoning}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {!result && !isLoading && !error && (
          <p className="text-sm text-muted-foreground">
            Click &quot;Get Recommendations&quot; to receive AI-powered service suggestions based on this client&apos;s profile.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
