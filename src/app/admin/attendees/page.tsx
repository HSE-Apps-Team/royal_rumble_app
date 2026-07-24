// /admin/freshmen/page.tsx (server component)
import { getFreshmen } from "@/actions/freshmen";
import AdminFreshmen from "./ui";

export default async function FreshmenPage() {
  const freshmen = await getFreshmen(); // fetch from DB
  const sanitizedFreshmen = freshmen.map((f) => ({
    freshmenId: f.freshmenId,
    fName: f.fName ?? "",
    lName: f.lName ?? "",
    email: f.email ?? "",
    tshirtSize: f.tshirtSize ?? "",
    primaryLanguage: f.primaryLanguage ?? "",
    interests: f.interests ?? "",
    healthConcerns: f.healthConcerns ?? "",
    present: f.present ?? false,
  }));
  return <AdminFreshmen freshmenData={sanitizedFreshmen} />;
}
