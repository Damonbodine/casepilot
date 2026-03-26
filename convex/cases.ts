import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAuth, requireRole } from "./lib/auth";

const STATUS_PIPELINE = ["Open", "InProgress", "PendingReview", "OnHold", "Closed"];
const VALID_TRANSITIONS: Record<string, string[]> = {
  Open: ["InProgress", "Closed"],
  InProgress: ["PendingReview", "OnHold", "Closed"],
  PendingReview: ["InProgress", "Closed"],
  OnHold: ["InProgress", "Closed"],
  Closed: ["Reopened"],
  Reopened: ["InProgress"],
};

export const list = query({
  args: {
    orgId: v.id("organizations"),
    status: v.optional(v.string()),
    priority: v.optional(v.string()),
    assignedWorkerId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    let results;
    if (args.status) {
      results = await ctx.db
        .query("cases")
        .withIndex("by_organization_status", (q) =>
          q.eq("organizationId", args.orgId).eq("status", args.status as any)
        )
        .collect();
    } else {
      results = await ctx.db
        .query("cases")
        .withIndex("by_organization", (q) => q.eq("organizationId", args.orgId))
        .collect();
    }
    if (args.priority) {
      results = results.filter((c) => c.priority === args.priority);
    }
    if (args.assignedWorkerId) {
      results = results.filter((c) => c.assignedWorkerId === args.assignedWorkerId);
    }
    return results;
  },
});

export const getById = query({
  args: { id: v.id("cases") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const caseDoc = await ctx.db.get(args.id);
    if (!caseDoc) throw new Error("The requested record was not found");
    const client = await ctx.db.get(caseDoc.clientId);
    const worker = await ctx.db.get(caseDoc.assignedWorkerId);
    const manager = caseDoc.assignedManagerId ? await ctx.db.get(caseDoc.assignedManagerId) : null;
    return { ...caseDoc, client, assignedWorker: worker, assignedManager: manager };
  },
});

export const listByAssignedWorker = query({
  args: {
    workerId: v.id("users"),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    if (user.role === "CaseWorker" && user._id !== args.workerId) {
      throw new Error("You can only access your assigned cases");
    }
    let results;
    if (args.status) {
      results = await ctx.db
        .query("cases")
        .withIndex("by_assignedWorker_status", (q) =>
          q.eq("assignedWorkerId", args.workerId).eq("status", args.status as any)
        )
        .collect();
    } else {
      results = await ctx.db
        .query("cases")
        .withIndex("by_assignedWorker", (q) => q.eq("assignedWorkerId", args.workerId))
        .collect();
    }
    const enriched = await Promise.all(
      results.map(async (c) => {
        const client = await ctx.db.get(c.clientId);
        return { ...c, client };
      })
    );
    return enriched;
  },
});

export const listByStatus = query({
  args: {
    orgId: v.id("organizations"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    return await ctx.db
      .query("cases")
      .withIndex("by_organization_status", (q) =>
        q.eq("organizationId", args.orgId).eq("status", args.status as any)
      )
      .collect();
  },
});

export const getStats = query({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const all = await ctx.db
      .query("cases")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.orgId))
      .collect();
    const statusCounts: Record<string, number> = {};
    const priorityCounts: Record<string, number> = {};
    let totalActive = 0;
    let totalClosed = 0;
    for (const c of all) {
      statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
      priorityCounts[c.priority] = (priorityCounts[c.priority] || 0) + 1;
      if (c.status === "Closed") totalClosed++;
      else totalActive++;
    }
    return { statusCounts, priorityCounts, totalActive, totalClosed, total: all.length };
  },
});

export const getAgingMetrics = query({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const all = await ctx.db
      .query("cases")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.orgId))
      .collect();
    const now = Date.now();
    const openCases = all.filter((c) => c.status !== "Closed");
    const avgDaysOpen =
      openCases.length > 0
        ? openCases.reduce((sum, c) => sum + (now - c.openDate) / 86400000, 0) / openCases.length
        : 0;
    const staleDays = 30;
    const staleCases = openCases
      .filter((c) => now - c.openDate > staleDays * 86400000)
      .map((c) => ({ _id: c._id, caseNumber: c.caseNumber, daysOpen: Math.floor((now - c.openDate) / 86400000) }));
    const stageCounts: Record<string, number> = {};
    for (const c of openCases) {
      stageCounts[c.status] = (stageCounts[c.status] || 0) + 1;
    }
    return { avgDaysOpen: Math.round(avgDaysOpen), staleCases, stageCounts };
  },
});

export const create = mutation({
  args: {
    orgId: v.id("organizations"),
    clientId: v.id("clients"),
    title: v.string(),
    description: v.optional(v.string()),
    priority: v.optional(v.string()),
    assignedWorkerId: v.optional(v.id("users")),
    caseType: v.optional(v.string()),
    dueDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["Admin", "CaseManager", "CaseWorker", "IntakeSpecialist"]);
    const workerId = args.assignedWorkerId ?? user._id;
    const worker = await ctx.db.get(workerId);
    if (!worker || (worker.role !== "CaseWorker" && worker.role !== "CaseManager")) {
      throw new Error("Case must have an assigned worker with CaseWorker or CaseManager role");
    }
    if (worker.caseloadLimit) {
      const workerCases = await ctx.db
        .query("cases")
        .withIndex("by_assignedWorker", (q) => q.eq("assignedWorkerId", workerId))
        .collect();
      const activeCases = workerCases.filter((c) => c.status !== "Closed");
      if (activeCases.length >= worker.caseloadLimit) {
        throw new Error("Worker has reached their maximum caseload limit");
      }
    }
    const now = Date.now();
    const count = (await ctx.db.query("cases").collect()).length;
    const caseNumber = `CP-${String(count + 1).padStart(5, "0")}`;
    const caseId = await ctx.db.insert("cases", {
      caseNumber,
      clientId: args.clientId,
      type: (args.caseType as any) || "General",
      priority: (args.priority as any) || "Medium",
      status: "Open",
      assignedWorkerId: workerId,
      description: args.description ?? args.title,
      openDate: now,
      targetCloseDate: args.dueDate ? new Date(args.dueDate).getTime() : undefined,
      organizationId: args.orgId,
      riskAtIntake: "Medium",
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.insert("caseActivities", {
      caseId,
      userId: user._id,
      type: "Created",
      description: `Case ${caseNumber} created: ${args.title}`,
      createdAt: now,
    });
    await ctx.db.insert("auditLogs", {
      userId: user._id,
      action: "Create",
      entityType: "cases",
      entityId: caseId,
      organizationId: user.organizationId,
      createdAt: now,
    });
    return caseId;
  },
});

export const update = mutation({
  args: {
    id: v.id("cases"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    priority: v.optional(v.string()),
    caseType: v.optional(v.string()),
    dueDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["Admin", "CaseManager", "CaseWorker"]);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("The requested record was not found");
    if (user.role === "CaseWorker" && existing.assignedWorkerId !== user._id) {
      throw new Error("You can only access your assigned cases");
    }
    const updates: Record<string, any> = { updatedAt: Date.now() };
    if (args.description !== undefined) updates.description = args.description;
    if (args.priority !== undefined) updates.priority = args.priority;
    if (args.caseType !== undefined) updates.type = args.caseType;
    if (args.dueDate !== undefined) updates.targetCloseDate = new Date(args.dueDate).getTime();
    await ctx.db.patch(args.id, updates);
    await ctx.db.insert("auditLogs", {
      userId: user._id,
      action: "Update",
      entityType: "cases",
      entityId: args.id,
      organizationId: user.organizationId,
      createdAt: Date.now(),
    });
    return args.id;
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("cases"),
    status: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["Admin", "CaseManager", "CaseWorker"]);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("The requested record was not found");
    if (user.role === "CaseWorker" && existing.assignedWorkerId !== user._id) {
      throw new Error("You can only access your assigned cases");
    }
    const allowed = VALID_TRANSITIONS[existing.status];
    if (!allowed || !allowed.includes(args.status)) {
      throw new Error("Cases can only advance one stage at a time");
    }
    const updates: Record<string, any> = {
      status: args.status,
      updatedAt: Date.now(),
    };
    if (args.status === "Closed") {
      updates.closeDate = Date.now();
      updates.resolutionNotes = args.reason;
    }
    await ctx.db.patch(args.id, updates);
    await ctx.db.insert("caseActivities", {
      caseId: args.id,
      userId: user._id,
      type: args.status === "Closed" ? "Closed" : args.status === "Reopened" ? "Reopened" : "StatusChange",
      description: `Status changed from ${existing.status} to ${args.status}${args.reason ? ": " + args.reason : ""}`,
      previousValue: existing.status,
      newValue: args.status,
      createdAt: Date.now(),
    });
    await ctx.db.insert("auditLogs", {
      userId: user._id,
      action: "Update",
      entityType: "cases",
      entityId: args.id,
      details: `Status: ${existing.status} -> ${args.status}`,
      organizationId: user.organizationId,
      createdAt: Date.now(),
    });
    return args.id;
  },
});

export const reassign = mutation({
  args: {
    id: v.id("cases"),
    newWorkerId: v.id("users"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["Admin", "CaseManager"]);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("The requested record was not found");
    const newWorker = await ctx.db.get(args.newWorkerId);
    if (!newWorker || (newWorker.role !== "CaseWorker" && newWorker.role !== "CaseManager")) {
      throw new Error("Case must have an assigned worker with CaseWorker or CaseManager role");
    }
    if (newWorker.caseloadLimit) {
      const workerCases = await ctx.db
        .query("cases")
        .withIndex("by_assignedWorker", (q) => q.eq("assignedWorkerId", args.newWorkerId))
        .collect();
      const activeCases = workerCases.filter((c) => c.status !== "Closed");
      if (activeCases.length >= newWorker.caseloadLimit) {
        throw new Error("Worker has reached their maximum caseload limit");
      }
    }
    const oldWorkerId = existing.assignedWorkerId;
    await ctx.db.patch(args.id, { assignedWorkerId: args.newWorkerId, updatedAt: Date.now() });
    await ctx.db.insert("caseActivities", {
      caseId: args.id,
      userId: user._id,
      type: "Assignment",
      description: `Case reassigned${args.reason ? ": " + args.reason : ""}`,
      previousValue: oldWorkerId,
      newValue: args.newWorkerId,
      createdAt: Date.now(),
    });
    await ctx.db.insert("auditLogs", {
      userId: user._id,
      action: "Update",
      entityType: "cases",
      entityId: args.id,
      details: "Case reassigned",
      organizationId: user.organizationId,
      createdAt: Date.now(),
    });
    return args.id;
  },
});

export const remove = mutation({
  args: { id: v.id("cases") },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["Admin", "CaseManager"]);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("The requested record was not found");
    await ctx.db.delete(args.id);
    await ctx.db.insert("auditLogs", {
      userId: user._id,
      action: "Delete",
      entityType: "cases",
      entityId: args.id,
      organizationId: user.organizationId,
      createdAt: Date.now(),
    });
    return args.id;
  },
});
