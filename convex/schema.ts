import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // Anonymous user sessions (temporary, auto-expire)
  anonymousUsers: defineTable({
    sessionId: v.string(), // Generated client-side, stored in localStorage
    isActive: v.boolean(),
    messageCount: v.number(), // Daily message limit tracking
    lastActivity: v.number(), // Timestamp for auto-expiry
    ipHash: v.optional(v.string()), // Hashed IP for rate limiting (not stored permanently)
  })
    .index("by_session_id", ["sessionId"])
    .index("by_last_activity", ["lastActivity"]),

  // Chat sessions between anonymous users and counselors
  chatSessions: defineTable({
    anonymousUserId: v.id("anonymousUsers"),
    counselorId: v.optional(v.id("users")), // Counselor from auth system
    status: v.union(v.literal("waiting"), v.literal("active"), v.literal("ended")),
    createdAt: v.number(),
    lastActivity: v.number(),
    expiresAt: v.number(), // Auto-expire after 30 minutes
    isCrisisDetected: v.boolean(),
  })
    .index("by_status", ["status"])
    .index("by_counselor", ["counselorId"])
    .index("by_expires_at", ["expiresAt"])
    .index("by_anonymous_user", ["anonymousUserId"]),

  // Messages in chat sessions
  messages: defineTable({
    sessionId: v.id("chatSessions"),
    senderId: v.union(v.id("anonymousUsers"), v.id("users")), // Anonymous user or counselor
    senderType: v.union(v.literal("anonymous"), v.literal("counselor")),
    content: v.string(),
    timestamp: v.number(),
    
    // AI Analysis (visible only to counselors)
    sentiment: v.optional(v.object({
      score: v.number(), // -1 to 1
      label: v.union(v.literal("positive"), v.literal("neutral"), v.literal("negative")),
    })),
    emotions: v.optional(v.array(v.object({
      emotion: v.union(v.literal("joy"), v.literal("sadness"), v.literal("anger"), v.literal("fear"), v.literal("neutral")),
      confidence: v.number(),
    }))),
    isCrisisFlag: v.optional(v.boolean()),
    
    expiresAt: v.number(), // Auto-delete after session ends
  })
    .index("by_session", ["sessionId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_expires_at", ["expiresAt"]),

  // Counselor profiles (extends auth users)
  counselors: defineTable({
    userId: v.id("users"), // Links to auth system
    ngoName: v.string(),
    isVerified: v.boolean(),
    isOnline: v.boolean(),
    specializations: v.array(v.string()),
    currentSessions: v.array(v.id("chatSessions")),
    maxConcurrentSessions: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_online_status", ["isOnline"]),

  // Admin profiles
  admins: defineTable({
    userId: v.id("users"), // Links to auth system
    isActive: v.boolean(),
    permissions: v.array(v.string()), // ["manage_counselors", "view_analytics", "manage_admins"]
    createdAt: v.number(),
  })
    .index("by_user_id", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
