"use client";

import { useAuthedQuery } from "@/hooks/use-authed-query";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  FileText,
  Bell,
  Settings,
  Building2,
  Handshake,
  Briefcase,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard/caseload", icon: LayoutDashboard, roles: ["Admin", "CaseManager", "CaseWorker", "IntakeSpecialist", "ReadOnlyViewer"] },
  { label: "Manager View", href: "/dashboard/manager", icon: LayoutDashboard, roles: ["Admin", "CaseManager"] },
  { label: "Analytics", href: "/dashboard/analytics", icon: LayoutDashboard, roles: ["Admin", "CaseManager"] },
  { label: "Clients", href: "/clients", icon: Users, roles: ["Admin", "CaseManager", "CaseWorker", "IntakeSpecialist", "ReadOnlyViewer"] },
  { label: "New Intake", href: "/clients/new", icon: FileText, roles: ["Admin", "IntakeSpecialist", "CaseManager", "CaseWorker"] },
  { label: "Cases", href: "/cases", icon: FolderKanban, roles: ["Admin", "CaseManager", "CaseWorker", "IntakeSpecialist", "ReadOnlyViewer"] },
  { label: "Pipeline", href: "/cases/pipeline", icon: FolderKanban, roles: ["Admin", "CaseManager", "CaseWorker"] },
  { label: "Referrals", href: "/referrals", icon: Handshake, roles: ["Admin", "CaseManager", "CaseWorker"] },
  { label: "Notifications", href: "/notifications", icon: Bell, roles: ["Admin", "CaseManager", "CaseWorker", "IntakeSpecialist", "ReadOnlyViewer"] },
  { label: "Users", href: "/users", icon: Users, roles: ["Admin"] },
  { label: "Settings", href: "/settings", icon: Settings, roles: ["Admin"] },
];

export function AppSidebar() {
  const currentUser = useAuthedQuery(api.users.getCurrentUser);
  const pathname = usePathname();

  if (!currentUser) {
    return (
      <Sidebar>
        <SidebarHeader className="p-4">
          <Skeleton className="h-8 w-32" />
        </SidebarHeader>
        <SidebarContent className="p-2 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </SidebarContent>
      </Sidebar>
    );
  }

  const visibleItems = NAV_ITEMS.filter((item) =>
    item.roles.includes(currentUser.role)
  );

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">CP</span>
          </div>
          <span className="font-bold text-lg">CasePilot</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {visibleItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                render={<Link href={item.href} className="flex items-center gap-3" />}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-muted text-muted-foreground text-xs">
              {currentUser.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{currentUser.name}</p>
            <p className="text-xs text-muted-foreground truncate">{currentUser.role}</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}