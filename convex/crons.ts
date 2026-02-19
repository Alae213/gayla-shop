import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

/**
 * Daily at 02:00 UTC — purge terminal orders older than 60 days.
 * Mirrors the manual “Force Clean” button in the Archive view.
 * Both paths call the same purgeOldArchive mutation so the logic
 * is never duplicated.
 */
crons.daily(
  "purge-old-archive",
  { hourUTC: 2, minuteUTC: 0 },
  api.orders.purgeOldArchive,
  { olderThanDays: 60 },
);

export default crons;
