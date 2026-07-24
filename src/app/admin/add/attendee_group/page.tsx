// src/app/admin/add/freshmen_group/page.tsx

import AdminAddFreshmenGroupPage from "./ui";
import { getEventOrderPatterns } from "@/actions/routes";

export default async function AdminAddCustomGroup() {
  const rawPatterns = await getEventOrderPatterns();
  // Convert to string[][] — same shape the existing UI already expects
  const orders = rawPatterns.map((p) => p.blockOrder);
  return <AdminAddFreshmenGroupPage orders={orders} />;
}
