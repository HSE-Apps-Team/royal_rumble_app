import { getFreshmen } from "@/actions/freshmen";
import { getMentors } from "@/actions/mentor";
import AdminSearchUI from "./ui";

export default async function AdminSearchPage() {
  const [freshmen, mentors] = await Promise.all([getFreshmen(), getMentors()]);
  return <AdminSearchUI freshmen={freshmen} mentors={mentors} />;
}
