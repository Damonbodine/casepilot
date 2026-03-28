"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  CalendarIcon,
  Sparkles,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { cn } from "@/lib/utils";

interface CaseNotesSummarizerProps {
  caseId: Id<"cases">;
}

const SECTIONS = [
  { key: "overview", label: "Overview" },
  { key: "keyEvents", label: "Key Events" },
  { key: "serviceDelivery", label: "Service Delivery" },
  { key: "goalsProgress", label: "Goals Progress" },
  { key: "concerns", label: "Concerns" },
  { key: "recommendations", label: "Recommendations" },
] as const;

export function CaseNotesSummarizer({ caseId }: CaseNotesSummarizerProps) {
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const summarize = useAction(api.ai.summarizeCaseNotes);

  async function handleSummarize() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await summarize({
        caseId,
        startDate: startOfDay(startDate).getTime(),
        endDate: endOfDay(endDate).getTime(),
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate summary");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-4 w-4" />
          AI Case Notes Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground">From</span>
            <Popover>
              <PopoverTrigger>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn("w-[140px] justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-3 w-3" />
                  {startDate ? format(startDate, "MMM d, yyyy") : "Start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={startDate} onSelect={(d) => d && setStartDate(d)} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground">To</span>
            <Popover>
              <PopoverTrigger>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn("w-[140px] justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-3 w-3" />
                  {endDate ? format(endDate, "MMM d, yyyy") : "End date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={endDate} onSelect={(d) => d && setEndDate(d)} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
          <Button size="sm" onClick={handleSummarize} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Summarizing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Summarize
              </>
            )}
          </Button>
        </div>

        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
        )}

        {result && !isLoading && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              {result.noteCount} note{result.noteCount !== 1 ? "s" : ""} analyzed
            </p>
            <Separator />
            {SECTIONS.map(({ key, label }) => {
              const content = result[key];
              if (!content) return null;
              return (
                <div key={key}>
                  <h4 className="text-sm font-semibold mb-1">{label}</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{content}</p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
