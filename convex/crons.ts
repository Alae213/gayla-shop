import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

/**
 * Auto-purge terminal orders older than 60 days.
 * Runs daily at 02:00 UTC — same logic as the Force Clean button.
 * Silent — no user-facing feedback (server-side only).
 */
crons.daily(
  "purge-old-archive",
  { hourUTC: 2, minuteUTC: 0 },
  api.orders.purgeOldArchive,
);

export default crons;
