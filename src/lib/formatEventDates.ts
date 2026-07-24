function formatDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) return date;
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
}

// Combines an event's primary date/time with its optional alternative
// date/time into a single "or" string, since the two slots are the same
// event (one shared attendance record), not a recurrence or a range.
export function formatEventDates(event: {
  date: string | null;
  time: string | null;
  date2?: string | null;
  time2?: string | null;
}): string {
  const first = event.date ? `${formatDate(event.date)} ${event.time ?? ""}`.trim() : "N/A";
  if (!event.date2) return first;

  const second = `${formatDate(event.date2)} ${event.time2 ?? ""}`.trim();
  return `${first} or ${second}`;
}
