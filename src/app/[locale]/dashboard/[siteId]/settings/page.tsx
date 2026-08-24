import { requireSiteAccess } from "@/lib/guards";
import { normalizeLocale } from "@/i18n/messages";
import SettingsForm from "@/components/dashboard/SettingsForm";

export default async function SettingsRoute({
  params,
}: {
  params: Promise<{ locale: string; siteId: string }>;
}) {
  const { locale: rawLocale, siteId } = await params;
  const locale = normalizeLocale(rawLocale);
  const { site, features, role } = await requireSiteAccess(siteId, locale, [
    "owner",
    "admin",
  ]);

  return (
    <SettingsForm
      site={{
        id: site.id,
        name: site.name,
        subdomain: site.subdomain,
        themeId: site.themeId,
        defaultLanguage: site.defaultLanguage,
        supportedLanguages: (site.supportedLanguages as string[]) ?? [
          site.defaultLanguage,
        ],
        seoTitle: site.seoTitle,
        seoDescription: site.seoDescription,
        status: site.status,
      }}
      features={features}
      canDelete={role === "owner"}
    />
  );
}
