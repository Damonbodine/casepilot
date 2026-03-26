import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAuth, requireRole } from "./lib/auth";

export const list = query({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    return await ctx.db.query("caseNotes").order("desc").take(100);
  },
});

export const getById = query({
  args: { id: v.id("caseNotes") },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    const note = await ctx.db.get(args.id);
    if (!note) throw new Error("The requested record was not found");
    if (note.isPrivate && note.authorId !== user._id && user.role !== "Admin" && user.role !== "CaseManager") {
      throw new Error("You do not have permission to view private notes");
    }
    return note;
  },
});

export const listByCase = query({
  args: {
    caseId: v.id("cases"),
    includePrivate: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    let notes = await ctx.db
      .query("caseNotes")
      .withIndex("by_case", (q) => q.eq("caseId", args.caseId))
      .order("desc")
      .collect();
    if (!args.includePrivate || (user.role !== "Admin" && user.role !== "CaseManager")) {
      notes = notes.filter((n) => !n.isPrivate || n.authorId === user._id);
    }
    const enriched = await Promise.all(
      notes.map(async (n) => {
        const author = await ctx.db.get(n.authorId);
        return { ...n, authorName: author?.name ?? "Unknown" };
      })
    );
    return enriched;
  },
});

export const create = mutation({
  args: {
    caseId: v.id("cases"),
    content: v.string(),
    noteType: v.optional(v.string()),
    isPrivate: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["Admin", "CaseManager", "CaseWorker"]);
    const caseDoc = await ctx.db.get(args.caseId);
    if (!caseDoc) throw new Error("The requested record was not found");
    const now = Date.now();
    const noteId = await ctx.db.insert("caseNotes", {
      caseId: args.caseId,
      authorId: user._id,
      content: args.content,
      category: (args.noteType as any) || "General",
      isPrivate: args.isPrivate ?? false,
      isPinned: false,
      createdAt: now,
    });
    await ctx.db.insert("caseActivities", {
      caseId: args.caseId,
      userId: user._id,
      type: "NoteAdded",
      description: `Note added: ${args.content.substring(0, 100)}`,
      createdAt: now,
    });
    await ctx.db.insert("auditLogs", {
      userId: user._id,
      action: "Create",
      entityType: "caseNotes",
      entityId: noteId,
      organizationId: user.organizationId,
      createdAt: now,
    });
    return noteId;
  },
});

export const update = mutation({
  args: {
    id: v.id("caseNotes"),
    content: v.optional(v.string()),
    noteType: v.optional(v.string()),
    isPrivate: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["Admin", "CaseManager", "CaseWorker"]);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("The requested record was not found");
    if (user.role === "CaseWorker" && existing.authorId !== user._id) {
      throw new Error("Your role does not have permission for this action");
    }
    const updates: Record<string, any> = {};
    if (args.content !== undefined) updates.content = args.content;
    if (args.noteType !== undefined) updates.category = args.noteType;
    if (args.isPrivate !== undefined) updates.isPrivate = args.isPrivate;
    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

export const remove = mutation({
  args: { id: v.id("caseNotes") },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["Admin", "CaseManager"]);
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("The requested record was not found");
    await ctx.db.delete(args.id);
    await ctx.db.insert("auditLogs", {
      userId: user._id,
      action: "Delete",
      entityType: "caseNotes",
      entityId: args.id,
      organizationId: user.organizationId,
      createdAt: Date.now(),
    });
    return args.id;
  },
});
