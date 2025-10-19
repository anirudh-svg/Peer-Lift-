import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

// Clean up expired sessions every 5 minutes
crons.interval(
  "cleanup expired sessions",
  { minutes: 5 },
  api.chatSessions.cleanupExpiredSessions,
  {}
);

// Clean up expired anonymous users every 10 minutes
crons.interval(
  "cleanup expired anonymous users",
  { minutes: 10 },
  api.anonymousUsers.cleanupExpiredSessions,
  {}
);

// Clean up expired messages every hour
crons.interval(
  "cleanup expired messages",
  { hours: 1 },
  api.messages.cleanupExpiredMessages,
  {}
);

export default crons;
