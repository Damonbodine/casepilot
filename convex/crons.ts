import { cronJobs } from "convex/server";
import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

// Internal function: find goals/cases with approaching deadlines and notify
export const deadlineReminder = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
    const threeDaysFromNow = now + threeDaysMs;

    // Check goals with targetDate within 3 days
    const goals = await ctx.db.query("goals").collect();
    for (const goal of goals) {
      if (
        (goal.status === "InProgress" || goal.status === "NotStarted") &&
        goal.targetDate > now &&
        goal.targetDate <= threeDaysFromNow
      ) {
        const caseDoc = await ctx.db.get(goal.caseId);
        if (caseDoc) {
          await ctx.db.insert("notifications", {
            userId: caseDoc.assignedWorkerId,
            type: "Reminder",
            title: "Goal Deadline Approaching",
            message: `Goal "${goal.title}" is due within 3 days.`,
            link: `/cases/${caseDoc._id}/goals`,
            priority: "High",
            isRead: false,
            createdAt: now,
          });
        }
      }
    }

    // Check cases with targetCloseDate within 3 days
    const cases = await ctx.db.query("cases").collect();
    for (const c of cases) {
      if (
        c.status !== "Closed" &&
        c.targetCloseDate &&
        c.targetCloseDate > now &&
        c.targetCloseDate <= threeDaysFromNow
      ) {
        await ctx.db.insert("notifications", {
          userId: c.assignedWorkerId,
          type: "Reminder",
          title: "Case Deadline Approaching",
          message: `Case ${c.caseNumber} target close date is within 3 days.`,
          link: `/cases/${c._id}`,
          priority: "High",
          isRead: false,
          createdAt: now,
        });
      }
    }
  },
});

// Internal function: find stale cases (no update in 14 days) and notify
export const staleCase = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;
    const staleThreshold = now - fourteenDaysMs;

    const cases = await ctx.db.query("cases").collect();
    for (const c of cases) {
      if (
        (c.status === "Open" || c.status === "InProgress") &&
        c.updatedAt < staleThreshold
      ) {
        await ctx.db.insert("notifications", {
          userId: c.assignedWorkerId,
          type: "SystemAlert",
          title: "Stale Case Alert",
          message: `Case ${c.caseNumber} has had no activity for 14+ days.`,
          link: `/cases/${c._id}`,
          priority: "Medium",
          isRead: false,
          createdAt: now,
        });
      }
    }
  },
});

// Internal function: find overdue goals, mark OnHold, and notify
export const overdueGoalCheck = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    const goals = await ctx.db.query("goals").collect();
    for (const goal of goals) {
      if (
        (goal.status === "InProgress" || goal.status === "NotStarted") &&
        goal.targetDate < now
      ) {
        await ctx.db.patch(goal._id, {
          status: "OnHold",
          updatedAt: now,
        });
        const caseDoc = await ctx.db.get(goal.caseId);
        if (caseDoc) {
          await ctx.db.insert("notifications", {
            userId: caseDoc.assignedWorkerId,
            type: "GoalDue",
            title: "Overdue Goal",
            message: `Goal "${goal.title}" is past its target date and has been placed on hold.`,
            link: `/cases/${caseDoc._id}/goals`,
            priority: "High",
            isRead: false,
            createdAt: now,
          });
        }
      }
    }
  },
});

const crons = cronJobs();

crons.daily(
  "deadlineReminder",
  { hourUTC: 8, minuteUTC: 0 },
  internal.crons.deadlineReminder
);

crons.daily(
  "staleCase",
  { hourUTC: 7, minuteUTC: 0 },
  internal.crons.staleCase
);

crons.daily(
  "overdueGoalCheck",
  { hourUTC: 6, minuteUTC: 0 },
  internal.crons.overdueGoalCheck
);

export default crons;
