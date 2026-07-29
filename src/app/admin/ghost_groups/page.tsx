import AdminGhostGroups from "./ui";
import { getAllGhostGroups } from "@/actions/group";

export default async function AdminGhostGroupsPage() {
  const ghostGroups = await getAllGhostGroups(); // fetch from DB

  return <AdminGhostGroups ghostGroups={ghostGroups} />;
}
