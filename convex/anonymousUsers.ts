import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create or update anonymous user session
export const createOrUpdateSession = mutation({
  args: {
    sessionId: v.string(),
    ipHash: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("anonymousUsers")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .unique();

    const now = Date.now();
    const thirtyMinutesAgo = now - 30 * 60 * 1000;

    if (existing) {
      // Reset message count if it's a new day
      const lastActivityDate = new Date(existing.lastActivity).toDateString();
      const todayDate = new Date(now).toDateString();
      const messageCount = lastActivityDate === todayDate ? existing.messageCount : 0;

      await ctx.db.patch(existing._id, {
        isActive: true,
        lastActivity: now,
        messageCount,
        ipHash: args.ipHash,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("anonymousUsers", {
        sessionId: args.sessionId,
        isActive: true,
        messageCount: 0,
        lastActivity: now,
        ipHash: args.ipHash,
      });
    }
  },
});

// Check if user can send more messages (rate limiting)
export const canSendMessage = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("anonymousUsers")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .unique();

    if (!user) return false;

    const today = new Date().toDateString();
    const lastActivityDate = new Date(user.lastActivity).toDateString();
    
    // Reset count if it's a new day
    const messageCount = lastActivityDate === today ? user.messageCount : 0;
    
    return messageCount < 50; // Daily limit of 50 messages
  },
});

// Increment message count
export const incrementMessageCount = mutation({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("anonymousUsers")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .unique();

    if (!user) throw new Error("User session not found");

    const today = new Date().toDateString();
    const lastActivityDate = new Date(user.lastActivity).toDateString();
    
    // Reset count if it's a new day
    const messageCount = lastActivityDate === today ? user.messageCount + 1 : 1;

    await ctx.db.patch(user._id, {
      messageCount,
      lastActivity: Date.now(),
    });
  },
});

// Clean up expired sessions
export const cleanupExpiredSessions = mutation({
  args: {},
  handler: async (ctx) => {
    const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
    
    const expiredUsers = await ctx.db
      .query("anonymousUsers")
      .withIndex("by_last_activity", (q) => q.lt("lastActivity", thirtyMinutesAgo))
      .collect();

    for (const user of expiredUsers) {
      await ctx.db.delete(user._id);
    }
  },
});
