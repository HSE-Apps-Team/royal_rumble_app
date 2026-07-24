-- Add optional second date/time to events_data, allowing an event to offer
-- two alternative date/time slots ("or" choice) that share one attendance record.
ALTER TABLE "events_data" ADD COLUMN "date2" date;
ALTER TABLE "events_data" ADD COLUMN "time2" text;
