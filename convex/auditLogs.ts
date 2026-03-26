import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAuth } from "./lib/auth";

export const list = query({
  args: {
    orgId: v.id("organizations"),
    entityType: v.optional(v.string()),
    action: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const lim = args.limit ?? 50;
    let results;
    if (args.entityType) {
      results = await ctx.db
        .query("auditLogs")
        .withIndex("by_organization_entityType", (q) =>
          q.eq("organizationId", args.orgId).eq("entityType", args.entityType!)
        )
        .order("desc")
        .take(lim);
    } else if (args.action) {
      results = await ctx.db
        .query("auditLogs")
        .withIndex("by_organization_action", (q) =>
          q.eq("organizationId", args.orgId).eq("action", args.action as any)
        )
        .order("desc")
        .take(lim);
    } else {
      results = await ctx.db
        .query("auditLogs")
        .withIndex("by_organization", (q) => q.eq("organizationId", args.orgId))
        .order("desc")
        .take(lim);
    }
    if (args.userId) {
      results = results.filter((l) => l.userId === args.userId);
    }
    return results;
  },
});

export const getById = query({
  args: { id: v.id("auditLogs") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const log = await ctx.db.get(args.id);
    if (!log) throw new Error("The requested record was not found");
    return log;
  },
});

export const create = mutation({
  args: {
    orgId: v.id("organizations"),
    userId: v.id("users"),
    entityType: v.string(),
    entityId: v.string(),
    action: v.string(),
    changes: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("auditLogs", {
      userId: args.userId,
      action: args.action as any,
      entityType: args.entityType,
      entityId: args.entityId,
      details: args.changes,
      ipAddress: args.ipAddress,
      organizationId: args.orgId,
      createdAt: Date.now(),
    });
  },
});
