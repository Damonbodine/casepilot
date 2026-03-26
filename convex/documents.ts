import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { requireAuth, requireRole } from "./lib/auth";

export const list = query({
  args: {
    orgId: v.id("organizations"),
    documentType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const all = await ctx.db.query("documents").order("desc").take(100);
    if (args.documentType) {
      return all.filter((d) => d.type === args.documentType);
    }
    return all;
  },
});

export const getById = query({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const doc = await ctx.db.get(args.id);
    if (!doc) throw new Error("The requested record was not found");
    return doc;
  },
});

export const listByCase = query({
  args: { caseId: v.id("cases") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    return await ctx.db
      .query("documents")
      .withIndex("by_case", (q) => q.eq("caseId", args.caseId))
      .order("desc")
      .collect();
  },
});

export const listByClient = query({
  args: { clientId: v.id("clients") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    return await ctx.db
      .query("documents")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .order("desc")
      .collect();
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAuth(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const create = mutation({
  args: {
    caseId: v.id("cases"),
    clientId: v.id("clients"),
    name: v.string(),
    storageId: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    documentType: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["Admin", "CaseManager", "CaseWorker"]);
    const now = Date.now();
    const docId = await ctx.db.insert("documents", {
      caseId: args.caseId,
      clientId: args.clientId,
      name: args.name,
      type: (args.documentType as any) || "Other",
      description: args.description,
      storageId: args.storageId,
      fileUrl: args.storageId,
      fileSize: args.fileSize,
      mimeType: args.fileType,
      uploadedById: user._id,
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.insert("caseActivities", {
      caseId: args.caseId,
      userId: user._id,
      type: "DocumentUploaded",
      description: `Document uploaded: ${args.name}`,
      createdAt: now,
    });
    await ctx.db.insert("auditLogs", {
      userId: user._id,
      action: "Create",
      entityType: "documents",
      entityId: docId,
      organizationId: user.organizationId,
      createdAt: now,
    });
    return docId;
  },
});

export const update = mutation({
  args: {
    id: v.id("documents"),
    name: v.optional(v.string()),
    documentType: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["Admin", "CaseManager", "CaseWorker"]);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("The requested record was not found");
    const updates: Record<string, any> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.documentType !== undefined) updates.type = args.documentType;
    if (args.description !== undefined) updates.description = args.description;
    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

export const remove = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["Admin", "CaseManager"]);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("The requested record was not found");
    await ctx.db.delete(args.id);
    await ctx.db.insert("auditLogs", {
      userId: user._id,
      action: "Delete",
      entityType: "documents",
      entityId: args.id,
      organizationId: user.organizationId,
      createdAt: Date.now(),
    });
    return args.id;
  },
});
