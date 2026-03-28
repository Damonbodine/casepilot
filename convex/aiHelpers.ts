import { internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const getClient = internalQuery({
  args: { id: v.id("clients") },
  handler: async (ctx, args) => {
    const client = await ctx.db.get(args.id);
    if (!client) throw new Error("Client not found");
    return client;
  },
});

export const listCaseNotes = internalQuery({
  args: { caseId: v.id("cases") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("caseNotes")
      .withIndex("by_case", (q) => q.eq("caseId", args.caseId))
      .order("desc")
      .collect();
  },
});

export const listActiveServices = internalQuery({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("services")
      .withIndex("by_organization_isActive", (q) =>
        q.eq("organizationId", args.orgId).eq("isActive", true)
      )
      .collect();
  },
});

export const listOrgUsers = internalQuery({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.orgId))
      .collect();
  },
});

export const listCasesByWorker = internalQuery({
  args: { workerId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("cases")
      .withIndex("by_assignedWorker", (q) => q.eq("assignedWorkerId", args.workerId))
      .collect();
  },
});
