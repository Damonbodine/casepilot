"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useAuthedQuery } from "@/hooks/use-authed-query";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Check, CheckCheck } from "lucide-react";

export function NotificationList() {
  const notifications = useAuthedQuery(api.notifications.listForUser, {});
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);
  const [filter, setFilter] = useState<string>("all");

  if (!notifications) {
    return <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>;
  }

  let filtered = notifications;
  if (filter === "unread") {
    filtered = notifications.filter((n: any) => !n.isRead);
  } else if (filter === "read") {
    filtered = notifications.filter((n: any) => n.isRead);
  }

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && <Badge variant="destructive">{unreadCount} unread</Badge>}
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="read">Read</SelectItem>
            </SelectContent>
          </Select>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={() => markAllAsRead({})}>
              <CheckCheck className="h-4 w-4 mr-1" /> Mark all read
            </Button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground"><Bell className="h-10 w-10 mx-auto mb-3 opacity-50" /><p>No notifications to show.</p></CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((n: any) => (
            <Card key={n._id} className={!n.isRead ? "border-primary/20 bg-primary/5" : ""}>
              <CardContent className="py-3 flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {!n.isRead && <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />}
                    <p className={`text-sm ${!n.isRead ? "font-medium" : "text-muted-foreground"}`}>{n.message || n.title}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {n.type && <Badge variant="outline" className="text-xs">{n.type}</Badge>}
                    <span className="text-xs text-muted-foreground">{n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}</span>
                  </div>
                </div>
                {!n.isRead && (
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => markAsRead({ id: n._id })}>
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}