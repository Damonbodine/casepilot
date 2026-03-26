import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAuth, requireRole } from "./lib/auth";

export const list = query({
  args: {
    orgId: v.id("organizations"),
    isActive: v.optional(v.boolean()),
    serviceType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    let results;
    if (args.isActive !== undefined) {
      results = await ctx.db
        .query("partners")
        .withIndex("by_isActive", (q) => q.eq("isActive", args.isActive!))
        .collect();
    } else {
      results = await ctx.db.query("partners").collect();
    }
    if (args.serviceType) {
      results = results.filter((p) => p.category === args.serviceType);
    }
    return results;
  },
});

export const getById = query({
  args: { id: v.id("partners") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const partner = await ctx.db.get(args.id);
    if (!partner) throw new Error("The requested record was not found");
    return partner;
  },
});

export const create = mutation({
  args: {
    orgId: v.id("organizations"),
    name: v.string(),
    contactName: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    address: v.optional(v.string()),
    serviceTypes: v.optional(v.string()),
    website: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["Admin", "CaseManager"]);
    const now = Date.now();
    return await ctx.db.insert("partners", {
      name: args.name,
      description: args.notes,
      category: (args.serviceTypes as any) || "Other",
      address: args.address,
      phone: args.contactPhone ?? "",
      email: args.contactEmail ?? "",
      website: args.website,
      primaryContactName: args.contactName ?? "",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("partners"),
    name: v.optional(v.string()),
    contactName: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    address: v.optional(v.string()),
    serviceTypes: v.optional(v.string()),
    website: v.optional(v.string()),
    notes: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["Admin", "CaseManager"]);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("The requested record was not found");
    const updates: Record<string, any> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.contactName !== undefined) updates.primaryContactName = args.contactName;
    if (args.contactEmail !== undefined) updates.email = args.contactEmail;
    if (args.contactPhone !== undefined) updates.phone = args.contactPhone;
    if (args.address !== undefined) updates.address = args.address;
    if (args.serviceTypes !== undefined) updates.category = args.serviceTypes;
    if (args.website !== undefined) updates.website = args.website;
    if (args.notes !== undefined) updates.description = args.notes;
    if (args.isActive !== undefined) updates.isActive = args.isActive;
    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

export const remove = mutation({
  args: { id: v.id("partners") },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["Admin"]);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("The requested record was not found");
    await ctx.db.patch(args.id, { isActive: false, updatedAt: Date.now() });
    return args.id;
  },
});
