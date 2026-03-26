import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAuth, requireRole } from "./lib/auth";

export const list = query({
  args: {
    orgId: v.optional(v.id("organizations")),
    status: v.optional(v.string()),
    riskLevel: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    const effectiveOrgId = args.orgId ?? user.organizationId;
    let results;
    if (args.status) {
      results = await ctx.db
        .query("clients")
        .withIndex("by_organization_status", (q) =>
          q.eq("organizationId", effectiveOrgId).eq("status", args.status as any)
        )
        .collect();
    } else {
      results = await ctx.db
        .query("clients")
        .withIndex("by_organization", (q) => q.eq("organizationId", effectiveOrgId))
        .collect();
    }
    if (args.riskLevel) {
      results = results.filter((c) => c.riskLevel === args.riskLevel);
    }
    return results;
  },
});

export const getById = query({
  args: { id: v.id("clients") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const client = await ctx.db.get(args.id);
    if (!client) throw new Error("The requested record was not found");
    const cases = await ctx.db
      .query("cases")
      .withIndex("by_client", (q) => q.eq("clientId", args.id))
      .collect();
    return { ...client, caseCount: cases.length };
  },
});

export const search = query({
  args: {
    orgId: v.id("organizations"),
    query: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const all = await ctx.db
      .query("clients")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.orgId))
      .collect();
    const q = args.query.toLowerCase();
    return all.filter(
      (c) =>
        c.firstName.toLowerCase().includes(q) ||
        c.lastName.toLowerCase().includes(q)
    );
  },
});

export const listByOrganization = query({
  args: {
    orgId: v.id("organizations"),
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const lim = args.limit ?? 50;
    return await ctx.db
      .query("clients")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.orgId))
      .order("desc")
      .take(lim);
  },
});

export const create = mutation({
  args: {
    orgId: v.optional(v.id("organizations")),
    firstName: v.string(),
    lastName: v.string(),
    dateOfBirth: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    alternatePhone: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    gender: v.optional(v.string()),
    race: v.optional(v.string()),
    ethnicity: v.optional(v.string()),
    preferredLanguage: v.optional(v.string()),
    primaryLanguage: v.optional(v.string()),
    riskLevel: v.optional(v.string()),
    primaryNeed: v.optional(v.string()),
    emergencyContactName: v.optional(v.string()),
    emergencyContactPhone: v.optional(v.string()),
    emergencyContactRelation: v.optional(v.string()),
    needsAssessment: v.optional(v.string()),
    intakeNotes: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["Admin", "CaseManager", "CaseWorker", "IntakeSpecialist"]);
    const effectiveOrgId = args.orgId ?? user.organizationId;
    const now = Date.now();
    const clientId = await ctx.db.insert("clients", {
      firstName: args.firstName,
      lastName: args.lastName,
      dateOfBirth: args.dateOfBirth ? new Date(args.dateOfBirth).getTime() : now,
      gender: (args.gender as any) || "PreferNotToSay",
      race: args.race ? (args.race as any) : undefined,
      preferredLanguage: (args.preferredLanguage ?? args.primaryLanguage ?? "English") as any,
      email: args.email,
      phone: args.phone,
      alternatePhone: args.alternatePhone,
      address: args.address,
      city: args.city,
      state: args.state,
      zipCode: args.zipCode,
      emergencyContactName: args.emergencyContactName ?? "Not provided",
      emergencyContactPhone: args.emergencyContactPhone ?? "Not provided",
      emergencyContactRelation: args.emergencyContactRelation ?? "Not provided",
      status: "Active",
      riskLevel: (args.riskLevel as any) || "Low",
      primaryNeed: (args.primaryNeed as any) || "Other",
      intakeDate: now,
      notes: args.notes ?? args.intakeNotes ?? args.needsAssessment,
      organizationId: effectiveOrgId,
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.insert("auditLogs", {
      userId: user._id,
      action: "Create",
      entityType: "clients",
      entityId: clientId,
      organizationId: user.organizationId,
      createdAt: now,
    });
    return clientId;
  },
});

export const update = mutation({
  args: {
    id: v.id("clients"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    gender: v.optional(v.string()),
    ethnicity: v.optional(v.string()),
    primaryLanguage: v.optional(v.string()),
    riskLevel: v.optional(v.string()),
    status: v.optional(v.string()),
    needsAssessment: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["Admin", "CaseManager", "CaseWorker"]);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("The requested record was not found");
    const updates: Record<string, any> = { updatedAt: Date.now() };
    if (args.firstName !== undefined) updates.firstName = args.firstName;
    if (args.lastName !== undefined) updates.lastName = args.lastName;
    if (args.dateOfBirth !== undefined) updates.dateOfBirth = new Date(args.dateOfBirth).getTime();
    if (args.email !== undefined) updates.email = args.email;
    if (args.phone !== undefined) updates.phone = args.phone;
    if (args.address !== undefined) updates.address = args.address;
    if (args.gender !== undefined) updates.gender = args.gender;
    if (args.primaryLanguage !== undefined) updates.preferredLanguage = args.primaryLanguage;
    if (args.riskLevel !== undefined) updates.riskLevel = args.riskLevel;
    if (args.status !== undefined) updates.status = args.status;
    if (args.needsAssessment !== undefined) updates.notes = args.needsAssessment;
    if (args.ethnicity !== undefined) updates.race = args.ethnicity;
    await ctx.db.patch(args.id, updates);
    await ctx.db.insert("auditLogs", {
      userId: user._id,
      action: "Update",
      entityType: "clients",
      entityId: args.id,
      organizationId: user.organizationId,
      createdAt: Date.now(),
    });
    return args.id;
  },
});

export const remove = mutation({
  args: { id: v.id("clients") },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["Admin", "CaseManager"]);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("The requested record was not found");
    const openCases = await ctx.db
      .query("cases")
      .withIndex("by_client", (q) => q.eq("clientId", args.id))
      .collect();
    const hasOpen = openCases.some((c) => c.status !== "Closed");
    if (hasOpen) throw new Error("Cannot delete client with open cases");
    await ctx.db.patch(args.id, { status: "Discharged", updatedAt: Date.now() });
    await ctx.db.insert("auditLogs", {
      userId: user._id,
      action: "Delete",
      entityType: "clients",
      entityId: args.id,
      organizationId: user.organizationId,
      createdAt: Date.now(),
    });
    return args.id;
  },
});
