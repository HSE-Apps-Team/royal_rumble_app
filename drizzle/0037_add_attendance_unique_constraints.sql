ALTER TABLE "mentor_attendance_data" ADD CONSTRAINT "unique_mentor_event" UNIQUE("mentor_id","event_id");
--> statement-breakpoint
ALTER TABLE "hallway_host_data" ADD CONSTRAINT "unique_hallway_host_mentor" UNIQUE("mentor_id");
--> statement-breakpoint
ALTER TABLE "ambassador_data" ADD CONSTRAINT "unique_ambassador_mentor" UNIQUE("mentor_id");
--> statement-breakpoint
ALTER TABLE "seminar_data" ADD CONSTRAINT "unique_seminar_freshmen" UNIQUE("freshmen_id");
