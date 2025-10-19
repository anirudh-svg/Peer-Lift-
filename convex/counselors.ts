import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Create counselor profile
export const createCounselorProfile = mutation({
  args: {
    ngoName: v.string(),
    specializations: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("counselors")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();

    if (existing) {
      throw new Error("Counselor profile already exists");
    }

    return await ctx.db.insert("counselors", {
      userId,
      ngoName: args.ngoName,
      isVerified: false, // Requires admin verification
      isOnline: false,
      specializations: args.specializations,
      currentSessions: [],
      maxConcurrentSessions: 3,
    });
  },
});

// Get counselor profile
export const getCounselorProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("counselors")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();
  },
});

// Update online status
export const updateOnlineStatus = mutation({
  args: { isOnline: v.boolean() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const counselor = await ctx.db
      .query("counselors")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();

    if (!counselor) throw new Error("Counselor profile not found");

    await ctx.db.patch(counselor._id, {
      isOnline: args.isOnline,
    });
  },
});

// Get online counselors count
export const getOnlineCounselorsCount = query({
  args: {},
  handler: async (ctx) => {
    const onlineCounselors = await ctx.db
      .query("counselors")
      .withIndex("by_online_status", (q) => q.eq("isOnline", true))
      .collect();

    return onlineCounselors.length;
  },
});

// Verify counselor (admin function)
export const verifyCounselor = mutation({
  args: { counselorId: v.id("counselors") },
  handler: async (ctx, args) => {
    // In a real app, you'd check if the current user is an admin
    await ctx.db.patch(args.counselorId, {
      isVerified: true,
    });
  },
});
