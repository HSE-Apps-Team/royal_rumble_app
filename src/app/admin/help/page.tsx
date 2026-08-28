// src/app/admin/help/page.tsx

import AdminHelpUI from "./ui";
import { getContent } from "@/src/actions/other";
import { HELP_PROMPTS } from "./prompts";

export const dynamic = "force-dynamic";

export default async function AdminHelpPage() {
  const prompts = await Promise.all(
    HELP_PROMPTS.map(async (p) => ({
      ...p,
      text: (await getContent(p.contentKey)) || p.defaultText,
    })),
  );

  return <AdminHelpUI prompts={prompts} />;
}
