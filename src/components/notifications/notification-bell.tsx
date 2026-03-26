"use client";

import { useMutation } from "convex/react";
import { useAuthedQuery } from "@/hooks/use-authed-query";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export function NotificationBell() {
  const unreadCount = useAuthedQuery(api.notifications.getUnreadCount, {});
  const notifications = useAuthedQuery(api.notifications.listForUser, {});
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  const count = typeof unreadCount === "number" ? unreadCount : (unreadCount as any)?.count ?? 0;
  const recent = (notifications ?? []).slice(0, 5);

  return (
    <Popover>
      <PopoverTrigger>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
              {count > 99 ? "99+" : count}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {count > 0 && (
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => markAllAsRead({})}>
              <Check className="h-3 w-3 mr-1" /> Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-64">
          {recent.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No notifications.</div>
          ) : (
            <div className="divide-y divide-border">
              {recent.map((n: any) => (
                <div
                  key={n._id}
                  className={`p-3 text-sm cursor-pointer hover:bg-accent/50 transition-colors ${!n.isRead ? "bg-primary/5" : ""}`}
                  onClick={() => !n.isRead && markAsRead({ id: n._id })}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className={`flex-1 ${!n.isRead ? "font-medium" : "text-muted-foreground"}`}>{n.message || n.title}</p>
                    {!n.isRead && <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}</p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="p-2 border-t border-border">
          <Button variant="ghost" size="sm" className="w-full text-xs">
            <Link href="/notifications">View all notifications</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}