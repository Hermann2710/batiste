import { requireUser } from "@/lib/guards";
import { normalizeLocale } from "@/i18n/messages";
import ProfileForm from "@/components/auth/ProfileForm";

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  await requireUser(normalizeLocale(rawLocale));
  return <ProfileForm />;
}