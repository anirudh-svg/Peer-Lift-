import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";

// Create a new chat session for anonymous user
export const createSession = mutation({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const anonymousUser = await ctx.db
      .query("anonymousUsers")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .unique();

    if (!anonymousUser) {
      throw new Error("Anonymous user session not found");
    }

    const now = Date.now();
    const expiresAt = now + 30 * 60 * 1000; // 30 minutes

    return await ctx.db.insert("chatSessions", {
      anonymousUserId: anonymousUser._id,
      status: "waiting",
      createdAt: now,
      lastActivity: now,
      expiresAt,
      isCrisisDetected: false,
    });
  },
});

// Get waiting sessions for counselors
export const getWaitingSessions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const counselor = await ctx.db
      .query("counselors")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();

    if (!counselor || !counselor.isVerified) return [];

    return await ctx.db
      .query("chatSessions")
      .withIndex("by_status", (q) => q.eq("status", "waiting"))
      .collect();
  },
});

// Counselor joins a chat session
export const joinSession = mutation({
  args: { sessionId: v.id("chatSessions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const counselor = await ctx.db
      .query("counselors")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();

    if (!counselor || !counselor.isVerified) {
      throw new Error("Not a verified counselor");
    }

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.status !== "waiting") {
      throw new Error("Session not available");
    }

    // Check if counselor has reached max concurrent sessions
    if (counselor.currentSessions.length >= counselor.maxConcurrentSessions) {
      throw new Error("Maximum concurrent sessions reached");
    }

    await ctx.db.patch(args.sessionId, {
      counselorId: userId,
      status: "active",
      lastActivity: Date.now(),
    });

    // Update counselor's current sessions
    await ctx.db.patch(counselor._id, {
      currentSessions: [...counselor.currentSessions, args.sessionId],
    });

    return args.sessionId;
  },
});

// Get active sessions for a counselor
export const getCounselorSessions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("chatSessions")
      .withIndex("by_counselor", (q) => q.eq("counselorId", userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();
  },
});

// Get session for anonymous user
export const getUserSession = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const anonymousUser = await ctx.db
      .query("anonymousUsers")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .unique();

    if (!anonymousUser) return null;

    return await ctx.db
      .query("chatSessions")
      .withIndex("by_anonymous_user", (q) => q.eq("anonymousUserId", anonymousUser._id))
      .filter((q) => q.neq(q.field("status"), "ended"))
      .first();
  },
});

// End a chat session
export const endSession = mutation({
  args: { sessionId: v.id("chatSessions") },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");

    await ctx.db.patch(args.sessionId, {
      status: "ended",
      lastActivity: Date.now(),
    });

    // Remove from counselor's active sessions
    if (session.counselorId) {
      const counselor = await ctx.db
        .query("counselors")
        .withIndex("by_user_id", (q) => q.eq("userId", session.counselorId!))
        .unique();

      if (counselor) {
        const updatedSessions = counselor.currentSessions.filter(
          (id) => id !== args.sessionId
        );
        await ctx.db.patch(counselor._id, {
          currentSessions: updatedSessions,
        });
      }
    }

    // Schedule message cleanup
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    const deleteAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours from now
    for (const message of messages) {
      await ctx.db.patch(message._id, { expiresAt: deleteAt });
    }
  },
});

// Clean up expired sessions
export const cleanupExpiredSessions = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    const expiredSessions = await ctx.db
      .query("chatSessions")
      .withIndex("by_expires_at", (q) => q.lt("expiresAt", now))
      .collect();

    for (const session of expiredSessions) {
      if (session.status !== "ended") {
        await ctx.runMutation(api.chatSessions.endSession, { sessionId: session._id });
      }
    }
  },
});
