-- Block start times are no longer stored per-block. They're now derived at
-- read time by chaining each block's duration_minutes from a single overall
-- event start time (stored in site_content), following each group's own
-- event order. The start_time column is dead weight now that nothing reads
-- it.
ALTER TABLE "block_schedule" DROP COLUMN "start_time";
