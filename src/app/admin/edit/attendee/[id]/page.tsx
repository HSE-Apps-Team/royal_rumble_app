import AdminEditFreshmenUI from "./ui";

export default async function AdminEditFreshmenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  return <AdminEditFreshmenUI params={resolvedParams} />;
}
