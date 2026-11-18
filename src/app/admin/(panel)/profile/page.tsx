import type { Metadata } from "next";
import Link from "next/link";
import { loadForEditing } from "@/components/admin/load";
import { ProfileEditor } from "@/components/admin/profile-editor";
import { PageHeader } from "@/components/admin/shell";

export const metadata: Metadata = { title: "Profile & stats" };

export default async function ProfilePage() {
  const { content, error } = await loadForEditing("Profile & stats");
  if (!content) return error;
  const { links, verifiedDomain, metrics, metricsSince } = content.data;

  return (
    <>
      <PageHeader
        title="Profile & stats"
        description={
          <>
            Photo, CV, citation metrics and profile links. The name, titles and biography are edited in{" "}
            <Link href="/admin/content/profile" className="text-primary hover:underline">Site text</Link>.
          </>
        }
      />
      <ProfileEditor initial={{ links, verifiedDomain, metrics, metricsSince }} />
    </>
  );
}
