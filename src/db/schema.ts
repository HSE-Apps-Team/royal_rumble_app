import { pgTable, integer, text, boolean, date, serial, varchar, timestamp, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ---------------- group_data ----------------
export const groupData = pgTable("group_data", {
  groupId:    serial("group_id").primaryKey(),
  name:       text("name").notNull(),
  eventOrder: text("event_order"),
  routeNum:   integer("route_num"),
});

// ---------------- mentor_attendance_data ----------------
export const mentorAttendanceData = pgTable("mentor_attendance_data", {
  mentorId: integer("mentor_id"),
  eventId:  integer("event_id"),
  status:   boolean("status"),
});

// ---------------- events_data ----------------
export const eventsData = pgTable("events_data", {
  eventId:       integer("event_id").primaryKey().generatedAlwaysAsIdentity(),
  name:          text("name"),
  job:           text("job"),
  date:          date("date"),
  time:          text("time"),
  date2:         date("date2"),
  time2:         text("time2"),
  location:      text("location"),
  description:   text("description"),
  isRoyalRumble: boolean("is_royal_rumble").default(false),
});

// ---------------- hallway_stop_data ----------------
export const hallwayStopData = pgTable("hallway_stop_data", {
  hallwayStopId: integer("hallway_stop_id").primaryKey().generatedAlwaysAsIdentity(),
  location:      text("location"),
});

// ---------------- hallway_host_data ----------------
export const hallwayHostData = pgTable("hallway_host_data", {
  mentorId:      integer("mentor_id"),
  hallwayStopId: integer("hallway_stop_id"),
});

// ---------------- seminar_data ----------------
export const seminarData = pgTable("seminar_data", {
  fName:           text("f_name"),
  lName:           text("l_name"),
  freshmenId:      integer("freshmen_id"),
  semester:        text("semester"),
  teacherFullName: text("teacher_full_name"),
  period:          text("period"),
  groupId:         integer("group_id"),
});

// ---------------- attendee_data ----------------
export const attendeeData = pgTable("attendee_data", {
  attendeeId:      integer("attendee_id").primaryKey(),
  fName:           text("f_name"),
  lName:           text("l_name"),
  tshirtSize:      text("tshirt_size"),
  email:           text("email"),
  primaryLanguage: text("primary_language"),
  interests:       text("interests"),
  healthConcerns:  text("health_concerns"),
  present:         boolean("present"),
  groupId:         integer("group_id"),
});

// ---------------- ambassador_data ----------------
export const ambassadorData = pgTable("ambassador_data", {
  mentorId: integer("mentor_id"),
  groupId:  integer("group_id"),
});

// ---------------- mentor_data ----------------
export const mentorData = pgTable("mentor_data", {
  mentorId:             integer("mentor_id").primaryKey(),
  email:                text("email").notNull(),
  fName:                text("f_name"),
  lName:                text("l_name"),
  gradYear:             integer("grad_year"),
  job:                  text("job"),
  pizzaType:            text("pizza_type"),
  languages:            text("languages"),
  trainingDay:          text("training_day"),
  tshirtSize:           text("tshirt_size"),
  phoneNum:             text("phone_num"),
  pastMentor:           boolean("past_mentor"),
  interestsInvolvement: text("interests_involvement"),
});

// ---------------- admin_data ----------------
export const adminData = pgTable("admin_data", {
  adminId: integer("admin_id").primaryKey(),
  email:   text("email"),
  fName:   text("f_name"),
  lName:   text("l_name"),
});

// ---------------- site_content ----------------
export const siteContent = pgTable("site_content", {
  id:      serial("id").primaryKey(),
  key:     varchar("key", { length: 100 }).unique().notNull(),
  content: text("content").notNull(),
});

// ---------------- FAQ_content ----------------
export const faqContentData = pgTable("faq_content", {
  id:      serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
});

// ============================================================
//  ROUTE MANAGEMENT SYSTEM
// ============================================================

// ---------------- event_order_pattern ----------------
export const eventOrderPattern = pgTable("event_order_pattern", {
  patternId:  serial("pattern_id").primaryKey(),
  patternNum: integer("pattern_num").notNull().unique(),
  blockOrder: text("block_order").notNull(),
});

// ---------------- block_schedule ----------------
export const blockSchedule = pgTable("block_schedule", {
  blockScheduleId: serial("block_schedule_id").primaryKey(),
  blockName:       text("block_name").notNull().unique(),
  startTime:       text("start_time").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
});

// ---------------- tour_route ----------------
export const tourRoute = pgTable("tour_route", {
  routeId:  serial("route_id").primaryKey(),
  routeNum: integer("route_num").notNull().unique(),
});

// ---------------- tour_route_stop ----------------
export const tourRouteStop = pgTable(
  "tour_route_stop",
  {
    routeStopId:     serial("route_stop_id").primaryKey(),
    routeId:         integer("route_id").notNull().references(() => tourRoute.routeId, { onDelete: "cascade" }),
    hallwayStopId:   integer("hallway_stop_id").notNull().references(() => hallwayStopData.hallwayStopId),
    stopOrder:       integer("stop_order").notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
  },
  (t) => ({
    uniqueRouteStop:  unique("unique_route_stop").on(t.routeId, t.hallwayStopId),
    uniqueRouteOrder: unique("unique_route_order").on(t.routeId, t.stopOrder),
  }),
);

// ---------------- group_route_attendance ----------------
export const groupRouteAttendance = pgTable(
  "group_route_attendance",
  {
    attendanceId:  serial("attendance_id").primaryKey(),
    groupId:       integer("group_id").notNull().references(() => groupData.groupId, { onDelete: "cascade" }),
    hallwayStopId: integer("hallway_stop_id").notNull().references(() => hallwayStopData.hallwayStopId),
    present:       boolean("present").notNull().default(false),
    markedAt:      timestamp("marked_at"),
  },
  (t) => ({
    uniqueGroupStop: unique("unique_group_stop").on(t.groupId, t.hallwayStopId),
  }),
);

// ============================================================
//  RELATIONS
// ============================================================

export const mentorRelations = relations(mentorData, ({ many }) => ({
  attendance:   many(mentorAttendanceData),
  hallwayHost:  many(hallwayHostData),
  ambassador:   many(ambassadorData),
}));

export const groupRelations = relations(groupData, ({ many }) => ({
  leaders:           many(ambassadorData),
  seminars:          many(seminarData),
  routeAttendance:   many(groupRouteAttendance),
}));

export const attendeeRelations = relations(attendeeData, ({ one }) => ({
  seminar: one(seminarData, {
    fields:     [attendeeData.attendeeId],
    references: [seminarData.freshmenId],
  }),
}));

export const tourRouteRelations = relations(tourRoute, ({ many }) => ({
  stops: many(tourRouteStop),
}));

export const tourRouteStopRelations = relations(tourRouteStop, ({ one }) => ({
  route:       one(tourRoute, {
    fields:     [tourRouteStop.routeId],
    references: [tourRoute.routeId],
  }),
  hallwayStop: one(hallwayStopData, {
    fields:     [tourRouteStop.hallwayStopId],
    references: [hallwayStopData.hallwayStopId],
  }),
}));

export const hallwayStopRelations = relations(hallwayStopData, ({ many }) => ({
  routeStops:      many(tourRouteStop),
  routeAttendance: many(groupRouteAttendance),
}));