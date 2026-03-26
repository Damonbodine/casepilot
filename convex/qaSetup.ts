import { internalMutation } from "./_generated/server";

export const createTestUsers = internalMutation({
  args: {},
  handler: async (ctx) => {
    const org = await ctx.db.query("organizations").first();
    if (!org) throw new Error("No organization found. Run seed first.");
    const now = Date.now();
    const testUsers = [
      { clerkId: "user_3BUBIHEfymSwNz8r2MMtg1Gq1zf", name: "Test Admin", email: "test-admin@factory512.dev", role: "Admin" as const },
      { clerkId: "user_3BTGwUPPEskEuIER4Og8bMlIEOX", name: "Test CaseManager", email: "test-casemanager@factory512.dev", role: "CaseManager" as const },
      { clerkId: "user_3BTGwW27anA5xuiWbfdiY9gPzZJ", name: "Test CaseWorker", email: "test-caseworker@factory512.dev", role: "CaseWorker" as const },
      { clerkId: "user_3BTGwa8zBzDTSzKTzWgZW1Yvsyh", name: "Test IntakeSpecialist", email: "test-intakespecialist@factory512.dev", role: "IntakeSpecialist" as const },
      { clerkId: "user_3BTH0vfadZRtXkEcSeq1CkX64z7", name: "Test ReadOnlyViewer", email: "test-readonlyviewer@factory512.dev", role: "ReadOnlyViewer" as const },
    ];
    const results = [];
    for (const u of testUsers) {
      const existing = await ctx.db.query("users").withIndex("by_clerkId", q => q.eq("clerkId", u.clerkId)).first();
      if (existing) {
        results.push({ ...u, id: existing._id, status: "already_exists" });
        continue;
      }
      const existingByEmail = await ctx.db.query("users").withIndex("by_email", q => q.eq("email", u.email)).first();
      if (existingByEmail) {
        await ctx.db.patch(existingByEmail._id, { clerkId: u.clerkId, updatedAt: now });
        results.push({ ...u, id: existingByEmail._id, status: "updated" });
        continue;
      }
      const id = await ctx.db.insert("users", {
        clerkId: u.clerkId, name: u.name, email: u.email, role: u.role,
        organizationId: org._id, isActive: true,
        caseloadLimit: u.role === "CaseWorker" ? 15 : u.role === "CaseManager" ? 25 : undefined,
        createdAt: now, updatedAt: now,
      });
      results.push({ ...u, id, status: "created" });
    }
    return results;
  },
});

export const fixBadAuditLogs = internalMutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("auditLogs").collect();
    let deleted = 0;
    for (const doc of all) {
      if (!doc.action) { await ctx.db.delete(doc._id); deleted++; }
    }
    return { deleted, total: all.length };
  },
});

export const getDbStatus = internalMutation({
  args: {},
  handler: async (ctx) => {
    const org = await ctx.db.query("organizations").first();
    const tables = ["cases","clients","users","services","partners","goals","referrals","serviceDeliveries","caseNotes","documents","notifications","auditLogs","caseActivities"] as const;
    const counts: Record<string, number> = {};
    for (const t of tables) {
      counts[t] = (await ctx.db.query(t as any).collect()).length;
    }
    return { org: org ? { id: org._id, name: org.name } : null, counts };
  },
});

export const assignCaseToTestWorker = internalMutation({
  args: {},
  handler: async (ctx) => {
    const testWorker = await ctx.db.query("users").withIndex("by_clerkId", q => q.eq("clerkId", "user_3BTGwW27anA5xuiWbfdiY9gPzZJ")).first();
    if (!testWorker) throw new Error("Test worker not found");
    const testManager = await ctx.db.query("users").withIndex("by_clerkId", q => q.eq("clerkId", "user_3BTGwUPPEskEuIER4Og8bMlIEOX")).first();
    const firstCase = await ctx.db.query("cases").first();
    if (!firstCase) throw new Error("No cases found");
    await ctx.db.patch(firstCase._id, {
      assignedWorkerId: testWorker._id,
      assignedManagerId: testManager?._id,
      updatedAt: Date.now(),
    });
    return { caseId: firstCase._id, workerId: testWorker._id };
  },
});
