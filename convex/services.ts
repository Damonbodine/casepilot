import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAuth, requireRole } from "./lib/auth";

export const list = query({
  args: {
    orgId: v.id("organizations"),
    category: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    let results;
    if (args.isActive !== undefined) {
      results = await ctx.db
        .query("services")
        .withIndex("by_organization_isActive", (q) =>
          q.eq("organizationId", args.orgId).eq("isActive", args.isActive!)
        )
        .collect();
    } else {
      results = await ctx.db
        .query("services")
        .withIndex("by_organization", (q) => q.eq("organizationId", args.orgId))
        .collect();
    }
    if (args.category) {
      results = results.filter((s) => s.category === args.category);
    }
    return results;
  },
});

export const getById = query({
  args: { id: v.id("services") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const service = await ctx.db.get(args.id);
    if (!service) throw new Error("The requested record was not found");
    return service;
  },
});

export const create = mutation({
  args: {
    orgId: v.id("organizations"),
    name: v.string(),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    unitOfMeasure: v.optional(v.string()),
    costPerUnit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["Admin", "CaseManager"]);
    const now = Date.now();
    return await ctx.db.insert("services", {
      name: args.name,
      description: args.description ?? "",
      category: (args.category as any) || "Other",
      deliveryMethod: "InPerson",
      isActive: true,
      requiresApproval: false,
      organizationId: args.orgId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("services"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    unitOfMeasure: v.optional(v.string()),
    costPerUnit: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["Admin", "CaseManager"]);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("The requested record was not found");
    const updates: Record<string, any> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.category !== undefined) updates.category = args.category;
    if (args.isActive !== undefined) updates.isActive = args.isActive;
    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

export const remove = mutation({
  args: { id: v.id("services") },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["Admin"]);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("The requested record was not found");
    await ctx.db.patch(args.id, { isActive: false, updatedAt: Date.now() });
    return args.id;
  },
});
