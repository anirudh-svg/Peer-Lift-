import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";

// Send a message in a chat session
export const sendMessage = mutation({
  args: {
    sessionId: v.id("chatSessions"),
    content: v.string(),
    senderType: v.union(v.literal("anonymous"), v.literal("counselor")),
    anonymousSessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.status === "ended") {
      throw new Error("Session not found or ended");
    }

    let senderId: any;
    
    if (args.senderType === "counselor") {
      const userId = await getAuthUserId(ctx);
      if (!userId) throw new Error("Not authenticated");
      senderId = userId;
    } else {
      if (!args.anonymousSessionId) throw new Error("Anonymous session ID required");
      
      const anonymousUser = await ctx.db
        .query("anonymousUsers")
        .withIndex("by_session_id", (q) => q.eq("sessionId", args.anonymousSessionId!))
        .unique();
      
      if (!anonymousUser) throw new Error("Anonymous user not found");
      senderId = anonymousUser._id;
    }

    const now = Date.now();
    const messageId = await ctx.db.insert("messages", {
      sessionId: args.sessionId,
      senderId,
      senderType: args.senderType,
      content: args.content,
      timestamp: now,
      expiresAt: now + 24 * 60 * 60 * 1000, // 24 hours
    });

    // Update session activity
    await ctx.db.patch(args.sessionId, {
      lastActivity: now,
      expiresAt: now + 30 * 60 * 1000, // Extend session by 30 minutes
    });

    // Schedule AI analysis for anonymous user messages
    if (args.senderType === "anonymous") {
      await ctx.scheduler.runAfter(0, api.messages.analyzeMessage, {
        messageId,
      });
    }

    return messageId;
  },
});

// AI analysis of message sentiment and emotions
export const analyzeMessage = action({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const message = await ctx.runQuery(api.messages.getMessage, { messageId: args.messageId });
    if (!message) return;

    try {
      const response = await fetch(`${process.env.CONVEX_OPENAI_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.CONVEX_OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4.1-nano",
          messages: [
            {
              role: "system",
              content: `You are an AI assistant that analyzes text for emotional content and sentiment. 
              Analyze the following message and return a JSON response with:
              1. sentiment: { score: number (-1 to 1), label: "positive" | "neutral" | "negative" }
              2. emotions: array of { emotion: "joy" | "sadness" | "anger" | "fear" | "neutral", confidence: number (0-1) }
              3. crisis_indicators: boolean (true if message indicates self-harm, suicide ideation, or severe distress)
              
              Focus on mental health context. Be sensitive to subtle indicators of distress.`
            },
            {
              role: "user",
              content: message.content
            }
          ],
          temperature: 0.1,
        }),
      });

      const data = await response.json();
      const analysis = JSON.parse(data.choices[0].message.content);

      // Determine if this is a crisis situation
      const isCrisis = analysis.crisis_indicators || 
        (analysis.sentiment.score < -0.3 && 
         analysis.emotions.some((e: any) => 
           (e.emotion === "sadness" || e.emotion === "anger") && e.confidence > 0.6
         ));

      await ctx.runMutation(api.messages.updateMessageAnalysis, {
        messageId: args.messageId,
        sentiment: analysis.sentiment,
        emotions: analysis.emotions,
        isCrisisFlag: isCrisis,
      });

      // If crisis detected, flag the session
      if (isCrisis) {
        await ctx.runMutation(api.messages.flagSessionCrisis, {
          sessionId: message.sessionId,
        });
      }

    } catch (error) {
      console.error("AI analysis failed:", error);
    }
  },
});

// Update message with AI analysis
export const updateMessageAnalysis = mutation({
  args: {
    messageId: v.id("messages"),
    sentiment: v.object({
      score: v.number(),
      label: v.union(v.literal("positive"), v.literal("neutral"), v.literal("negative")),
    }),
    emotions: v.array(v.object({
      emotion: v.union(v.literal("joy"), v.literal("sadness"), v.literal("anger"), v.literal("fear"), v.literal("neutral")),
      confidence: v.number(),
    })),
    isCrisisFlag: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, {
      sentiment: args.sentiment,
      emotions: args.emotions,
      isCrisisFlag: args.isCrisisFlag,
    });
  },
});

// Flag session as crisis
export const flagSessionCrisis = mutation({
  args: { sessionId: v.id("chatSessions") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      isCrisisDetected: true,
    });
  },
});

// Get message by ID
export const getMessage = query({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.messageId);
  },
});

// Get messages for a session
export const getSessionMessages = query({
  args: { sessionId: v.id("chatSessions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    // If user is a counselor, return all data including AI analysis
    if (userId) {
      const counselor = await ctx.db
        .query("counselors")
        .withIndex("by_user_id", (q) => q.eq("userId", userId))
        .unique();
      
      if (counselor) {
        return messages; // Full data for counselors
      }
    }

    // For anonymous users, strip AI analysis data
    return messages.map(msg => ({
      _id: msg._id,
      sessionId: msg.sessionId,
      senderId: msg.senderId,
      senderType: msg.senderType,
      content: msg.content,
      timestamp: msg.timestamp,
      _creationTime: msg._creationTime,
    }));
  },
});

// Clean up expired messages
export const cleanupExpiredMessages = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    const expiredMessages = await ctx.db
      .query("messages")
      .withIndex("by_expires_at", (q) => q.lt("expiresAt", now))
      .collect();

    for (const message of expiredMessages) {
      await ctx.db.delete(message._id);
    }
  },
});
