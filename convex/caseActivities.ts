import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAuth, requireRole } from "./lib/auth";

export const list = query({
  args: {
    orgId: v.optional(v.id("organizations")),
    activityType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    const effectiveOrgId = args.orgId ?? user.organizationId;
    const orgCases = await ctx.db
      .query("cases")
      .withIndex("by_organization", (q) => q.eq("organizationId", effectiveOrgId))
      .collect();
    const caseIds = new Set(orgCases.map((c) => c._id));
    const all = await ctx.db.query("caseActivities").order("desc").take(200);
    const filtered = all.filter((a) => caseIds.has(a.caseId));
    if (args.activityType) {
      return filtered.filter((a) => a.type === args.activityType);
    }
    return filtered;
  },
});

export const getById = query({
  args: { id: v.id("caseActivities") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const activity = await ctx.db.get(args.id);
    if (!activity) throw new Error("The requested record was not found");
    return activity;
  },
});

export const listByCase = query({
  args: {
    caseId: v.id("cases"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const lim = args.limit ?? 50;
    const activities = await ctx.db
      .query("caseActivities")
      .withIndex("by_case", (q) => q.eq("caseId", args.caseId))
      .order("desc")
      .take(lim);
    const enriched = await Promise.all(
      activities.map(async (a) => {
        const activityUser = await ctx.db.get(a.userId);
        return { ...a, userName: activityUser?.name ?? "System" };
      })
    );
    return enriched;
  },
});

export const create = mutation({
  args: {
    caseId: v.id("cases"),
    activityType: v.string(),
    description: v.string(),
    metadata: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["Admin", "CaseManager", "CaseWorker"]);
    return await ctx.db.insert("caseActivities", {
      caseId: args.caseId,
      userId: user._id,
      type: args.activityType as any,
      description: args.description,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("caseActivities") },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["Admin"]);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("The requested record was not found");
    await ctx.db.delete(args.id);
    return args.id;
  },
});
