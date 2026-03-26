import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireAuth, requireRole } from "./lib/auth";

export const getCaseloadStats = query({
  args: { workerId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    const effectiveWorkerId = args.workerId ?? user._id;
    const cases = await ctx.db
      .query("cases")
      .withIndex("by_assignedWorker", (q) => q.eq("assignedWorkerId", effectiveWorkerId))
      .collect();
    const active = cases.filter((c) => c.status !== "Closed");
    const statusCounts: Record<string, number> = {};
    const priorityCounts: Record<string, number> = {};
    for (const c of active) {
      statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
      priorityCounts[c.priority] = (priorityCounts[c.priority] || 0) + 1;
    }
    const now = Date.now();
    const overdue = active.filter((c) => c.targetCloseDate && c.targetCloseDate < now);
    const recentActivities = await ctx.db.query("caseActivities").order("desc").take(10);
    return {
      totalActive: active.length,
      totalClosed: cases.length - active.length,
      statusCounts,
      priorityCounts,
      overdueCount: overdue.length,
      recentActivities: recentActivities.length,
    };
  },
});

export const getManagerStats = query({
  args: { orgId: v.optional(v.id("organizations")) },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["Admin", "CaseManager"]);
    const effectiveOrgId = args.orgId ?? user.organizationId;
    const allCases = await ctx.db
      .query("cases")
      .withIndex("by_organization", (q) => q.eq("organizationId", effectiveOrgId))
      .collect();
    const workers = await ctx.db
      .query("users")
      .withIndex("by_organization", (q) => q.eq("organizationId", effectiveOrgId))
      .collect();
    const activeWorkers = workers.filter((w) => w.isActive && (w.role === "CaseWorker" || w.role === "CaseManager"));
    const casesByWorker: Record<string, number> = {};
    for (const c of allCases.filter((c) => c.status !== "Closed")) {
      const wId = c.assignedWorkerId;
      casesByWorker[wId] = (casesByWorker[wId] || 0) + 1;
    }
    const workerStats = activeWorkers.map((w) => ({
      workerId: w._id,
      workerName: w.name,
      activeCases: casesByWorker[w._id] || 0,
      caseloadLimit: w.caseloadLimit,
    }));
    const now = Date.now();
    const activeCases = allCases.filter((c) => c.status !== "Closed");
    const clients = await ctx.db
      .query("clients")
      .withIndex("by_organization", (q) => q.eq("organizationId", effectiveOrgId))
      .collect();
    return {
      totalCases: allCases.length,
      totalActive: activeCases.length,
      totalClosed: allCases.length - activeCases.length,
      totalClients: clients.length,
      activeClients: clients.filter((c) => c.status === "Active").length,
      workerStats,
      totalWorkers: activeWorkers.length,
    };
  },
});

export const getAnalyticsStats = query({
  args: {
    orgId: v.optional(v.id("organizations")),
    dateRange: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["Admin", "CaseManager"]);
    const effectiveOrgId = args.orgId ?? user.organizationId;
    const allCases = await ctx.db
      .query("cases")
      .withIndex("by_organization", (q) => q.eq("organizationId", effectiveOrgId))
      .collect();
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 86400000;
    const recentCases = allCases.filter((c) => c.createdAt >= thirtyDaysAgo);
    const closedRecent = allCases.filter((c) => c.status === "Closed" && c.closeDate && c.closeDate >= thirtyDaysAgo);
    const closedCases = allCases.filter((c) => c.status === "Closed" && c.closeDate);
    const avgResolutionDays =
      closedCases.length > 0
        ? closedCases.reduce((sum, c) => sum + ((c.closeDate! - c.openDate) / 86400000), 0) / closedCases.length
        : 0;
    const deliveries = await ctx.db.query("serviceDeliveries").order("desc").take(500);
    const recentDeliveries = deliveries.filter((d) => d.deliveryDate >= thirtyDaysAgo);
    const referrals = await ctx.db.query("referrals").order("desc").take(500);
    const recentReferrals = referrals.filter((r) => r.createdAt >= thirtyDaysAgo);
    const typeCounts: Record<string, number> = {};
    for (const c of allCases) {
      typeCounts[c.type] = (typeCounts[c.type] || 0) + 1;
    }
    return {
      newCases30d: recentCases.length,
      closedCases30d: closedRecent.length,
      avgResolutionDays: Math.round(avgResolutionDays),
      serviceDeliveries30d: recentDeliveries.length,
      referrals30d: recentReferrals.length,
      casesByType: typeCounts,
      totalOpenCases: allCases.filter((c) => c.status !== "Closed").length,
    };
  },
});
