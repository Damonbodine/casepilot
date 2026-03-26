import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .first();
  return user;
}

export async function requireAuth(ctx: QueryCtx | MutationCtx) {
  const user = await getCurrentUser(ctx);
  if (!user) throw new Error("Authentication required");
  return user;
}

export async function requireRole(
  ctx: QueryCtx | MutationCtx,
  allowedRoles: string[]
) {
  const user = await requireAuth(ctx);
  if (!allowedRoles.includes(user.role)) {
    throw new Error("Your role does not have permission for this action");
  }
  return user;
}

export async function checkCaseAccess(
  ctx: QueryCtx | MutationCtx,
  caseId: Id<"cases">
) {
  const user = await requireAuth(ctx);
  const caseDoc = await ctx.db.get(caseId);
  if (!caseDoc) throw new Error("The requested record was not found");
  if (user.role === "CaseWorker" && caseDoc.assignedWorkerId !== user._id) {
    throw new Error("You can only access your assigned cases");
  }
  return { user, caseDoc };
}
