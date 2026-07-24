-- Rename freshmen_data table to attendee_data, and its primary key column
-- freshmen_id to attendee_id, to reflect that this table represents general
-- event attendees (not always literally freshmen). seminar_data and its
-- freshmen_id column are left unchanged since that table is always
-- populated from the school's freshman seminar roster.

ALTER TABLE "freshmen_data" RENAME TO "attendee_data";
ALTER TABLE "attendee_data" RENAME COLUMN "freshmen_id" TO "attendee_id";
