import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAuth, requireRole } from "./lib/auth";

export const list = query({
  args: {
    orgId: v.optional(v.id("organizations")),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    const effectiveOrgId = args.orgId ?? user.organizationId;
    const orgCases = await ctx.db
      .query("cases")
      .withIndex("by_organization", (q) => q.eq("organizationId", effectiveOrgId))
      .collect();
    const caseIds = new Set(orgCases.map((c) => c._id));
    const all = await ctx.db.query("goals").order("desc").collect();
    const scoped = all.filter((g) => caseIds.has(g.caseId));
    if (args.status) {
      return scoped.filter((g) => g.status === args.status);
    }
    return scoped;
  },
});

export const getById = query({
  args: { id: v.id("goals") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const goal = await ctx.db.get(args.id);
    if (!goal) throw new Error("The requested record was not found");
    return goal;
  },
});

export const listByCase = query({
  args: { caseId: v.id("cases") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    return await ctx.db
      .query("goals")
      .withIndex("by_case", (q) => q.eq("caseId", args.caseId))
      .collect();
  },
});

export const create = mutation({
  args: {
    caseId: v.id("cases"),
    clientId: v.optional(v.id("clients")),
    title: v.string(),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    targetDate: v.optional(v.string()),
    status: v.optional(v.string()),
    progressPercent: v.optional(v.number()),
    measurableCriteria: v.optional(v.string()),
    milestones: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["Admin", "CaseManager", "CaseWorker"]);
    const caseDoc = await ctx.db.get(args.caseId);
    if (!caseDoc) throw new Error("The requested record was not found");
    const now = Date.now();
    const targetTs = args.targetDate ? new Date(args.targetDate).getTime() : now + 90 * 86400000;
    const goalId = await ctx.db.insert("goals", {
      caseId: args.caseId,
      clientId: args.clientId ?? caseDoc.clientId,
      title: args.title,
      description: args.description ?? "",
      category: (args.category as any) || "Other",
      status: (args.status as any) || "NotStarted",
      priority: "Medium",
      targetDate: targetTs,
      progressPercent: args.progressPercent ?? 0,
      milestones: args.milestones,
      notes: args.measurableCriteria,
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.insert("caseActivities", {
      caseId: args.caseId,
      userId: user._id,
      type: "GoalUpdated",
      description: `Goal created: ${args.title}`,
      createdAt: now,
    });
    await ctx.db.insert("auditLogs", {
      userId: user._id,
      action: "Create",
      entityType: "goals",
      entityId: goalId,
      organizationId: user.organizationId,
      createdAt: now,
    });
    return goalId;
  },
});

export const update = mutation({
  args: {
    id: v.id("goals"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    targetDate: v.optional(v.string()),
    status: v.optional(v.string()),
    measurableCriteria: v.optional(v.string()),
    milestones: v.optional(v.string()),
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
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.category !== undefined) updates.category = args.category;
    if (args.targetDate !== undefined) updates.targetDate = new Date(args.targetDate).getTime();
    if (args.status !== undefined) {
      updates.status = args.status;
      if (args.status === "Completed") updates.completedDate = Date.now();
    }
    if (args.measurableCriteria !== undefined) updates.notes = args.measurableCriteria;
    if (args.milestones !== undefined) updates.milestones = args.milestones;
    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

export const updateProgress = mutation({
  args: {
    id: v.id("goals"),
    progressPercent: v.number(),
    progressNotes: v.optional(v.string()),
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
    const updates: Record<string, any> = {
      progressPercent: args.progressPercent,
      updatedAt: Date.now(),
    };
    if (args.progressNotes) updates.notes = args.progressNotes;
    if (args.progressPercent >= 100) {
      updates.status = "Completed";
      updates.completedDate = Date.now();
    }
    await ctx.db.patch(existing._id, updates);
    await ctx.db.insert("caseActivities", {
      caseId: existing.caseId,
      userId: user._id,
      type: "GoalUpdated",
      description: `Goal progress updated to ${args.progressPercent}%: ${existing.title}`,
      createdAt: Date.now(),
    });
    return existing._id;
  },
});

export const remove = mutation({
  args: { id: v.id("goals") },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["Admin", "CaseManager"]);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("The requested record was not found");
    await ctx.db.delete(args.id);
    await ctx.db.insert("auditLogs", {
      userId: user._id,
      action: "Delete",
      entityType: "goals",
      entityId: args.id,
      organizationId: user.organizationId,
      createdAt: Date.now(),
    });
    return args.id;
  },
});
