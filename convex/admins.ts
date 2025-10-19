import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Create admin profile (first admin can self-register, others need approval)
export const createAdminProfile = mutation({
  args: {
    adminKey: v.string(), // Secret key for first admin
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existingAdmin = await ctx.db
      .query("admins")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();

    if (existingAdmin) {
      throw new Error("Admin profile already exists");
    }

    // Check if this is the first admin
    const adminCount = await ctx.db.query("admins").collect();
    const isFirstAdmin = adminCount.length === 0;

    // For first admin, check secret key
    if (isFirstAdmin && args.adminKey !== "PEERLIFT_ADMIN_2024") {
      throw new Error("Invalid admin key");
    }

    // For subsequent admins, they need approval
    if (!isFirstAdmin) {
      throw new Error("Admin registration requires approval from existing admin");
    }

    return await ctx.db.insert("admins", {
      userId,
      isActive: true,
      permissions: ["manage_counselors", "view_analytics", "manage_admins"],
      createdAt: Date.now(),
    });
  },
});

// Get admin profile
export const getAdminProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("admins")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();
  },
});

// Get all counselors for admin management
export const getAllCounselors = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const admin = await ctx.db
      .query("admins")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();

    if (!admin || !admin.isActive) return [];

    const counselors = await ctx.db.query("counselors").collect();
    
    // Get user details for each counselor
    const counselorsWithUsers = await Promise.all(
      counselors.map(async (counselor) => {
        const user = await ctx.db.get(counselor.userId);
        return {
          ...counselor,
          user,
        };
      })
    );

    return counselorsWithUsers;
  },
});

// Verify counselor
export const verifyCounselor = mutation({
  args: { counselorId: v.id("counselors") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const admin = await ctx.db
      .query("admins")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();

    if (!admin || !admin.isActive || !admin.permissions.includes("manage_counselors")) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.counselorId, {
      isVerified: true,
    });
  },
});

// Reject counselor
export const rejectCounselor = mutation({
  args: { counselorId: v.id("counselors") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const admin = await ctx.db
      .query("admins")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();

    if (!admin || !admin.isActive || !admin.permissions.includes("manage_counselors")) {
      throw new Error("Not authorized");
    }

    // Delete the counselor profile
    await ctx.db.delete(args.counselorId);
  },
});

// Get platform analytics
export const getAnalytics = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const admin = await ctx.db
      .query("admins")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();

    if (!admin || !admin.isActive || !admin.permissions.includes("view_analytics")) {
      return null;
    }

    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

    const [
      totalCounselors,
      verifiedCounselors,
      onlineCounselors,
      totalSessions,
      activeSessions,
      sessionsToday,
      sessionsThisWeek,
      messagesThisWeek,
    ] = await Promise.all([
      ctx.db.query("counselors").collect(),
      ctx.db.query("counselors").filter((q) => q.eq(q.field("isVerified"), true)).collect(),
      ctx.db.query("counselors").filter((q) => q.eq(q.field("isOnline"), true)).collect(),
      ctx.db.query("chatSessions").collect(),
      ctx.db.query("chatSessions").filter((q) => q.eq(q.field("status"), "active")).collect(),
      ctx.db.query("chatSessions").filter((q) => q.gt(q.field("createdAt"), oneDayAgo)).collect(),
      ctx.db.query("chatSessions").filter((q) => q.gt(q.field("createdAt"), oneWeekAgo)).collect(),
      ctx.db.query("messages").filter((q) => q.gt(q.field("timestamp"), oneWeekAgo)).collect(),
    ]);

    return {
      counselors: {
        total: totalCounselors.length,
        verified: verifiedCounselors.length,
        online: onlineCounselors.length,
        pending: totalCounselors.filter(c => !c.isVerified).length,
      },
      sessions: {
        total: totalSessions.length,
        active: activeSessions.length,
        today: sessionsToday.length,
        thisWeek: sessionsThisWeek.length,
      },
      messages: {
        thisWeek: messagesThisWeek.length,
      },
    };
  },
});
