import OnboardingWizard from "@/components/onboarding/OnboardingWizard";
import { requireUser } from "@/lib/guards";
import { normalizeLocale } from "@/i18n/messages";

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireUser(normalizeLocale(locale));
  return <OnboardingWizard />;
}
