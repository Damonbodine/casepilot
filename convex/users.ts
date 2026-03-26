import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAuth, requireRole, getCurrentUser as getCurrentUserHelper } from "./lib/auth";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUserHelper(ctx);
  },
});


export const list = query({
  args: {
    orgId: v.optional(v.id("organizations")),
    role: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    const effectiveOrgId = args.orgId ?? user.organizationId;
    let results = await ctx.db
      .query("users")
      .withIndex("by_organization", (q) => q.eq("organizationId", effectiveOrgId))
      .collect();
    if (args.role) {
      results = results.filter((u) => u.role === args.role);
    }
    if (args.search) {
      const q = args.search.toLowerCase();
      results = results.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      );
    }
    return results;
  },
});

export const getById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const user = await ctx.db.get(args.id);
    if (!user) throw new Error("The requested record was not found");
    return user;
  },
});

export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

export const upsertFromClerk = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    role: v.optional(v.string()),
    orgId: v.optional(v.id("organizations")),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        name: `${args.firstName} ${args.lastName}`,
        email: args.email,
        avatarUrl: args.imageUrl,
        lastLoginAt: now,
        updatedAt: now,
      });
      return existing._id;
    }
    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      name: `${args.firstName} ${args.lastName}`,
      email: args.email,
      role: (args.role as any) || "CaseWorker",
      organizationId: args.orgId!,
      isActive: true,
      avatarUrl: args.imageUrl,
      lastLoginAt: now,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const create = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    role: v.string(),
    orgId: v.id("organizations"),
    phone: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["Admin"]);
    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      name: `${args.firstName} ${args.lastName}`,
      email: args.email,
      phone: args.phone,
      role: args.role as any,
      organizationId: args.orgId,
      isActive: true,
      avatarUrl: args.imageUrl,
      createdAt: now,
      updatedAt: now,
    });
    return userId;
  },
});

export const update = mutation({
  args: {
    id: v.id("users"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    role: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await requireAuth(ctx);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("The requested record was not found");
    if (currentUser.role !== "Admin" && currentUser._id !== args.id) {
      throw new Error("Your role does not have permission for this action");
    }
    if (args.role && currentUser.role !== "Admin") {
      throw new Error("Your role does not have permission for this action");
    }
    const updates: Record<string, any> = { updatedAt: Date.now() };
    if (args.firstName !== undefined || args.lastName !== undefined) {
      const fn = args.firstName ?? existing.name.split(" ")[0];
      const ln = args.lastName ?? existing.name.split(" ").slice(1).join(" ");
      updates.name = `${fn} ${ln}`;
    }
    if (args.email !== undefined) updates.email = args.email;
    if (args.phone !== undefined) updates.phone = args.phone;
    if (args.role !== undefined) updates.role = args.role;
    if (args.isActive !== undefined) updates.isActive = args.isActive;
    if (args.imageUrl !== undefined) updates.avatarUrl = args.imageUrl;
    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

export const remove = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["Admin"]);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("The requested record was not found");
    await ctx.db.patch(args.id, { isActive: false, updatedAt: Date.now() });
    return args.id;
  },
});
