import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Flip due scheduled shares to "reminded" so the app can nudge the user.
crons.interval(
  "process scheduled reminders",
  { minutes: 5 },
  internal.schedule.processDueReminders,
  {}
);

// Delete stale ephemeral group sessions (and their participants).
crons.interval(
  "cleanup group sessions",
  { hours: 1 },
  internal.group.cleanupStale,
  {}
);

export default crons;
