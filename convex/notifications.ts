import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAuth, requireRole } from "./lib/auth";

export const list = query({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    return await ctx.db.query("notifications").order("desc").take(100);
  },
});

export const getById = query({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    const notification = await ctx.db.get(args.id);
    if (!notification) throw new Error("The requested record was not found");
    if (notification.userId !== user._id && user.role !== "Admin") {
      throw new Error("Your role does not have permission for this action");
    }
    return notification;
  },
});

export const listForUser = query({
  args: {
    userId: v.id("users"),
    unreadOnly: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    if (user._id !== args.userId && user.role !== "Admin") {
      throw new Error("Your role does not have permission for this action");
    }
    const lim = args.limit ?? 50;
    if (args.unreadOnly) {
      return await ctx.db
        .query("notifications")
        .withIndex("by_user_isRead", (q) => q.eq("userId", args.userId).eq("isRead", false))
        .order("desc")
        .take(lim);
    }
    return await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(lim);
  },
});

export const getUnreadCount = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    if (user._id !== args.userId && user.role !== "Admin") {
      throw new Error("Your role does not have permission for this action");
    }
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_isRead", (q) => q.eq("userId", args.userId).eq("isRead", false))
      .collect();
    return { count: unread.length };
  },
});

export const create = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    message: v.string(),
    type: v.string(),
    linkTo: v.optional(v.string()),
    relatedCaseId: v.optional(v.id("cases")),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    return await ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type as any,
      title: args.title,
      message: args.message,
      link: args.linkTo,
      priority: "Medium",
      isRead: false,
      createdAt: Date.now(),
    });
  },
});

export const markAsRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    const notification = await ctx.db.get(args.id);
    if (!notification) throw new Error("The requested record was not found");
    if (notification.userId !== user._id) {
      throw new Error("Your role does not have permission for this action");
    }
    await ctx.db.patch(args.id, { isRead: true });
    return args.id;
  },
});

export const markAllAsRead = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    if (user._id !== args.userId) {
      throw new Error("Your role does not have permission for this action");
    }
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_isRead", (q) => q.eq("userId", args.userId).eq("isRead", false))
      .collect();
    for (const n of unread) {
      await ctx.db.patch(n._id, { isRead: true });
    }
    return { updated: unread.length };
  },
});

export const remove = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    const notification = await ctx.db.get(args.id);
    if (!notification) throw new Error("The requested record was not found");
    if (notification.userId !== user._id && user.role !== "Admin") {
      throw new Error("Your role does not have permission for this action");
    }
    await ctx.db.delete(args.id);
    return args.id;
  },
});
