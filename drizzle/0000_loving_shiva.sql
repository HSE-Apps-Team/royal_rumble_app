CREATE TABLE "admin_data" (
	"admin_id" integer PRIMARY KEY NOT NULL,
	"email" text,
	"f_name" text,
	"l_name" text
);
--> statement-breakpoint
CREATE TABLE "ambassador_data" (
	"mentor_id" integer,
	"group_id" integer,
	CONSTRAINT "unique_ambassador_mentor" UNIQUE("mentor_id")
);
--> statement-breakpoint
CREATE TABLE "attendee_data" (
	"attendee_id" integer PRIMARY KEY NOT NULL,
	"f_name" text,
	"l_name" text,
	"tshirt_size" text,
	"primary_language" text,
	"interests" text,
	"health_concerns" text,
	"present" boolean,
	"group_id" integer
);
--> statement-breakpoint
CREATE TABLE "block_schedule" (
	"block_schedule_id" serial PRIMARY KEY NOT NULL,
	"block_name" text NOT NULL,
	"duration_minutes" integer NOT NULL,
	CONSTRAINT "block_schedule_block_name_unique" UNIQUE("block_name")
);
--> statement-breakpoint
CREATE TABLE "event_order_pattern" (
	"pattern_id" serial PRIMARY KEY NOT NULL,
	"pattern_num" integer NOT NULL,
	"block_order" text NOT NULL,
	CONSTRAINT "event_order_pattern_pattern_num_unique" UNIQUE("pattern_num")
);
--> statement-breakpoint
CREATE TABLE "events_data" (
	"event_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "events_data_event_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text,
	"job" text,
	"date" date,
	"time" text,
	"date2" date,
	"time2" text,
	"location" text,
	"description" text,
	"is_royal_rumble" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "faq_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "group_data" (
	"group_id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"event_order" text,
	"route_num" integer
);
--> statement-breakpoint
CREATE TABLE "group_route_attendance" (
	"attendance_id" serial PRIMARY KEY NOT NULL,
	"group_id" integer NOT NULL,
	"hallway_stop_id" integer NOT NULL,
	"present" boolean DEFAULT false NOT NULL,
	"marked_at" timestamp,
	CONSTRAINT "unique_group_stop" UNIQUE("group_id","hallway_stop_id")
);
--> statement-breakpoint
CREATE TABLE "hallway_host_data" (
	"mentor_id" integer,
	"hallway_stop_id" integer,
	CONSTRAINT "unique_hallway_host_mentor" UNIQUE("mentor_id")
);
--> statement-breakpoint
CREATE TABLE "hallway_stop_data" (
	"hallway_stop_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "hallway_stop_data_hallway_stop_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"location" text
);
--> statement-breakpoint
CREATE TABLE "job_data" (
	"job_id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(100) NOT NULL,
	"db_job" text NOT NULL,
	"label" text NOT NULL,
	"content_key" varchar(100) NOT NULL,
	"is_protected" boolean DEFAULT false NOT NULL,
	"is_non_utility" boolean DEFAULT true NOT NULL,
	CONSTRAINT "job_data_slug_unique" UNIQUE("slug"),
	CONSTRAINT "job_data_db_job_unique" UNIQUE("db_job"),
	CONSTRAINT "job_data_content_key_unique" UNIQUE("content_key")
);
--> statement-breakpoint
CREATE TABLE "mentor_attendance_data" (
	"mentor_id" integer,
	"event_id" integer,
	"status" boolean,
	CONSTRAINT "unique_mentor_event" UNIQUE("mentor_id","event_id")
);
--> statement-breakpoint
CREATE TABLE "mentor_data" (
	"mentor_id" integer PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"f_name" text,
	"l_name" text,
	"grad_year" integer,
	"job" text,
	"pizza_type" text,
	"languages" text,
	"training_day" text,
	"tshirt_size" text,
	"phone_num" text,
	"past_mentor" boolean,
	"interests_involvement" text
);
--> statement-breakpoint
CREATE TABLE "seminar_data" (
	"f_name" text,
	"l_name" text,
	"freshmen_id" integer,
	"semester" text,
	"teacher_full_name" text,
	"period" text,
	"group_id" integer,
	CONSTRAINT "unique_seminar_freshmen" UNIQUE("freshmen_id")
);
--> statement-breakpoint
CREATE TABLE "site_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(100) NOT NULL,
	"content" text NOT NULL,
	CONSTRAINT "site_content_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "tour_route" (
	"route_id" serial PRIMARY KEY NOT NULL,
	"route_num" integer NOT NULL,
	CONSTRAINT "tour_route_route_num_unique" UNIQUE("route_num")
);
--> statement-breakpoint
CREATE TABLE "tour_route_stop" (
	"route_stop_id" serial PRIMARY KEY NOT NULL,
	"route_id" integer NOT NULL,
	"hallway_stop_id" integer NOT NULL,
	"stop_order" integer NOT NULL,
	"duration_minutes" integer NOT NULL,
	CONSTRAINT "unique_route_stop" UNIQUE("route_id","hallway_stop_id"),
	CONSTRAINT "unique_route_order" UNIQUE("route_id","stop_order")
);
--> statement-breakpoint
ALTER TABLE "group_route_attendance" ADD CONSTRAINT "group_route_attendance_group_id_group_data_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."group_data"("group_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_route_attendance" ADD CONSTRAINT "group_route_attendance_hallway_stop_id_hallway_stop_data_hallway_stop_id_fk" FOREIGN KEY ("hallway_stop_id") REFERENCES "public"."hallway_stop_data"("hallway_stop_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tour_route_stop" ADD CONSTRAINT "tour_route_stop_route_id_tour_route_route_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."tour_route"("route_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tour_route_stop" ADD CONSTRAINT "tour_route_stop_hallway_stop_id_hallway_stop_data_hallway_stop_id_fk" FOREIGN KEY ("hallway_stop_id") REFERENCES "public"."hallway_stop_data"("hallway_stop_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "admin_data_email_lower_unique" ON "admin_data" USING btree (lower("email"));--> statement-breakpoint
CREATE UNIQUE INDEX "block_schedule_block_name_lower_unique" ON "block_schedule" USING btree (lower("block_name"));--> statement-breakpoint
CREATE UNIQUE INDEX "hallway_stop_data_location_lower_unique" ON "hallway_stop_data" USING btree (lower("location"));--> statement-breakpoint
CREATE UNIQUE INDEX "job_data_slug_lower_unique" ON "job_data" USING btree (lower("slug"));--> statement-breakpoint
CREATE UNIQUE INDEX "job_data_db_job_lower_unique" ON "job_data" USING btree (lower("db_job"));--> statement-breakpoint
CREATE UNIQUE INDEX "mentor_data_email_lower_unique" ON "mentor_data" USING btree (lower("email"));