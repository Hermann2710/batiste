import { notFound } from "next/navigation";
import { I18nProvider } from "@/i18n/client";
import { LOCALES, type Locale } from "@/i18n/messages";
import { ensureThemesSeeded } from "@/lib/theme-seed";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!(LOCALES as readonly string[]).includes(locale)) notFound();

  await ensureThemesSeeded();

  return <I18nProvider locale={locale as Locale}>{children}</I18nProvider>;
}
