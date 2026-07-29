import AdminGhostGroups from "./ui";
import {
  getAllGhostGroups,
  getSeminarGroupIds,
  getNonGhostGroups,
} from "@/actions/group";

export default async function AdminGhostGroupsPage() {
  const ghostGroups = await getAllGhostGroups(); // fetch from DB
  const groupIds = await getSeminarGroupIds();
  const nonGhostGroups = await getNonGhostGroups();

  return (
    <AdminGhostGroups
      ghostGroups={ghostGroups}
      groupIds={groupIds}
      nonGhostGroups={nonGhostGroups}
    />
  );
}
