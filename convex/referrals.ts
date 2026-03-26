import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAuth, requireRole } from "./lib/auth";

export const list = query({
  args: {
    orgId: v.id("organizations"),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const all = await ctx.db.query("referrals").order("desc").collect();
    if (args.status) {
      return all.filter((r) => r.status === args.status);
    }
    return all;
  },
});

export const getById = query({
  args: { id: v.id("referrals") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const referral = await ctx.db.get(args.id);
    if (!referral) throw new Error("The requested record was not found");
    return referral;
  },
});

export const listByCase = query({
  args: { caseId: v.id("cases") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const referrals = await ctx.db
      .query("referrals")
      .withIndex("by_case", (q) => q.eq("caseId", args.caseId))
      .order("desc")
      .collect();
    const enriched = await Promise.all(
      referrals.map(async (r) => {
        const partner = await ctx.db.get(r.partnerId);
        return { ...r, partnerName: partner?.name ?? "Unknown" };
      })
    );
    return enriched;
  },
});

export const listAll = query({
  args: {
    orgId: v.id("organizations"),
    status: v.optional(v.string()),
    partnerId: v.optional(v.id("partners")),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    let results = await ctx.db.query("referrals").order("desc").collect();
    if (args.status) {
      results = results.filter((r) => r.status === args.status);
    }
    if (args.partnerId) {
      results = results.filter((r) => r.partnerId === args.partnerId);
    }
    return results;
  },
});

export const create = mutation({
  args: {
    caseId: v.id("cases"),
    partnerId: v.id("partners"),
    reason: v.string(),
    urgency: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["Admin", "CaseManager", "CaseWorker"]);
    const partner = await ctx.db.get(args.partnerId);
    if (!partner || !partner.isActive) {
      throw new Error("Referrals require an active partner organization");
    }
    const caseDoc = await ctx.db.get(args.caseId);
    if (!caseDoc) throw new Error("The requested record was not found");
    const now = Date.now();
    const referralId = await ctx.db.insert("referrals", {
      caseId: args.caseId,
      clientId: caseDoc.clientId,
      partnerId: args.partnerId,
      direction: "Outgoing",
      referredById: user._id,
      reason: args.reason,
      serviceNeeded: args.reason,
      status: "Pending",
      urgency: (args.urgency as any) || "Medium",
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.insert("caseActivities", {
      caseId: args.caseId,
      userId: user._id,
      type: "ReferralMade",
      description: `Referral to ${partner.name}: ${args.reason}`,
      createdAt: now,
    });
    await ctx.db.insert("auditLogs", {
      userId: user._id,
      action: "Create",
      entityType: "referrals",
      entityId: referralId,
      organizationId: user.organizationId,
      createdAt: now,
    });
    return referralId;
  },
});

export const update = mutation({
  args: {
    id: v.id("referrals"),
    reason: v.optional(v.string()),
    urgency: v.optional(v.string()),
    notes: v.optional(v.string()),
    outcome: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["Admin", "CaseManager", "CaseWorker"]);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("The requested record was not found");
    const updates: Record<string, any> = { updatedAt: Date.now() };
    if (args.reason !== undefined) updates.reason = args.reason;
    if (args.urgency !== undefined) updates.urgency = args.urgency;
    if (args.notes !== undefined) updates.notes = args.notes;
    if (args.outcome !== undefined) updates.outcomeNotes = args.outcome;
    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("referrals"),
    status: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["Admin", "CaseManager"]);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("The requested record was not found");
    const updates: Record<string, any> = {
      status: args.status,
      updatedAt: Date.now(),
    };
    if (args.notes) updates.outcomeNotes = args.notes;
    await ctx.db.patch(args.id, updates);
    await ctx.db.insert("auditLogs", {
      userId: user._id,
      action: "Update",
      entityType: "referrals",
      entityId: args.id,
      details: `Status changed to ${args.status}`,
      organizationId: user.organizationId,
      createdAt: Date.now(),
    });
    return args.id;
  },
});

export const remove = mutation({
  args: { id: v.id("referrals") },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["Admin", "CaseManager"]);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("The requested record was not found");
    await ctx.db.delete(args.id);
    await ctx.db.insert("auditLogs", {
      userId: user._id,
      action: "Delete",
      entityType: "referrals",
      entityId: args.id,
      organizationId: user.organizationId,
      createdAt: Date.now(),
    });
    return args.id;
  },
});
