import AdminGhostGroups from "./ui";
import { getAllGhostGroups, getSeminarGroupIds } from "@/actions/group";

export default async function AdminGhostGroupsPage() {
  const ghostGroups = await getAllGhostGroups(); // fetch from DB
  const groupIds = await getSeminarGroupIds();

  return <AdminGhostGroups ghostGroups={ghostGroups} groupIds={groupIds} />;
}
