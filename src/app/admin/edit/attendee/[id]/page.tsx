import AdminEditAttendeeUI from "./ui";

export default async function AdminEditAttendeePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  return <AdminEditAttendeeUI params={resolvedParams} />;
}
