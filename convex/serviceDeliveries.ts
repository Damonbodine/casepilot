import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAuth, requireRole } from "./lib/auth";

export const list = query({
  args: {
    orgId: v.optional(v.id("organizations")),
    serviceId: v.optional(v.id("services")),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    if (args.serviceId) {
      return await ctx.db
        .query("serviceDeliveries")
        .withIndex("by_service", (q) => q.eq("serviceId", args.serviceId!))
        .order("desc")
        .collect();
    }
    // Scope to org cases
    const effectiveOrgId = args.orgId ?? user.organizationId;
    const orgCases = await ctx.db
      .query("cases")
      .withIndex("by_organization", (q) => q.eq("organizationId", effectiveOrgId))
      .collect();
    const caseIds = new Set(orgCases.map((c) => c._id));
    const all = await ctx.db.query("serviceDeliveries").order("desc").take(200);
    return all.filter((d) => caseIds.has(d.caseId));
  },
});

export const getById = query({
  args: { id: v.id("serviceDeliveries") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const delivery = await ctx.db.get(args.id);
    if (!delivery) throw new Error("The requested record was not found");
    return delivery;
  },
});

export const listByCase = query({
  args: { caseId: v.id("cases") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const deliveries = await ctx.db
      .query("serviceDeliveries")
      .withIndex("by_case", (q) => q.eq("caseId", args.caseId))
      .order("desc")
      .collect();
    const enriched = await Promise.all(
      deliveries.map(async (d) => {
        const service = await ctx.db.get(d.serviceId);
        return { ...d, serviceName: service?.name ?? "Unknown" };
      })
    );
    return enriched;
  },
});

export const getWeeklyStats = query({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const now = Date.now();
    const weekAgo = now - 7 * 86400000;
    const all = await ctx.db
      .query("serviceDeliveries")
      .withIndex("by_deliveryDate")
      .order("desc")
      .collect();
    const thisWeek = all.filter((d) => d.deliveryDate >= weekAgo);
    const byService: Record<string, { count: number; totalDuration: number }> = {};
    for (const d of thisWeek) {
      const key = d.serviceId;
      if (!byService[key]) byService[key] = { count: 0, totalDuration: 0 };
      byService[key].count++;
      byService[key].totalDuration += d.duration;
    }
    return {
      totalDeliveries: thisWeek.length,
      totalDuration: thisWeek.reduce((sum, d) => sum + d.duration, 0),
      byService: Object.entries(byService).map(([serviceId, stats]) => ({
        serviceId,
        ...stats,
      })),
    };
  },
});

export const create = mutation({
  args: {
    caseId: v.id("cases"),
    clientId: v.optional(v.id("clients")),
    serviceId: v.id("services"),
    deliveredDate: v.optional(v.string()),
    deliveryDate: v.optional(v.string()),
    units: v.optional(v.number()),
    duration: v.optional(v.number()),
    notes: v.optional(v.string()),
    outcome: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["Admin", "CaseManager", "CaseWorker"]);
    const caseDoc = await ctx.db.get(args.caseId);
    if (!caseDoc) throw new Error("The requested record was not found");
    const dateStr = args.deliveredDate ?? args.deliveryDate;
    const deliveredTs = dateStr ? new Date(dateStr).getTime() : Date.now();
    if (deliveredTs > Date.now() + 86400000) {
      throw new Error("Service delivery date cannot be in the future");
    }
    const now = Date.now();
    const unitValue = args.units ?? args.duration ?? 1;
    const deliveryId = await ctx.db.insert("serviceDeliveries", {
      caseId: args.caseId,
      clientId: args.clientId ?? caseDoc.clientId,
      serviceId: args.serviceId,
      providerId: user._id,
      deliveryDate: deliveredTs,
      duration: unitValue,
      outcome: (args.outcome ?? args.status ?? "Completed") as any,
      notes: args.notes,
      followUpNeeded: false,
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.insert("caseActivities", {
      caseId: args.caseId,
      userId: user._id,
      type: "ServiceDelivered",
      description: `Service delivered on ${dateStr ?? new Date().toISOString().split("T")[0]}`,
      createdAt: now,
    });
    await ctx.db.insert("auditLogs", {
      userId: user._id,
      action: "Create",
      entityType: "serviceDeliveries",
      entityId: deliveryId,
      organizationId: user.organizationId,
      createdAt: now,
    });
    return deliveryId;
  },
});

export const update = mutation({
  args: {
    id: v.id("serviceDeliveries"),
    deliveredDate: v.optional(v.string()),
    units: v.optional(v.number()),
    notes: v.optional(v.string()),
    outcome: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["Admin", "CaseManager", "CaseWorker"]);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("The requested record was not found");
    if (user.role === "CaseWorker") {
      const caseDoc = await ctx.db.get(existing.caseId);
      if (caseDoc && caseDoc.assignedWorkerId !== user._id) {
        throw new Error("You can only access your assigned cases");
      }
    }
    const updates: Record<string, any> = { updatedAt: Date.now() };
    if (args.deliveredDate !== undefined) updates.deliveryDate = new Date(args.deliveredDate).getTime();
    if (args.units !== undefined) updates.duration = args.units;
    if (args.notes !== undefined) updates.notes = args.notes;
    if (args.outcome !== undefined) updates.outcome = args.outcome;
    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

export const remove = mutation({
  args: { id: v.id("serviceDeliveries") },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["Admin", "CaseManager"]);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("The requested record was not found");
    await ctx.db.delete(args.id);
    await ctx.db.insert("auditLogs", {
      userId: user._id,
      action: "Delete",
      entityType: "serviceDeliveries",
      entityId: args.id,
      organizationId: user.organizationId,
      createdAt: Date.now(),
    });
    return args.id;
  },
});
