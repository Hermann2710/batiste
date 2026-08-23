import type { Locale } from "@/i18n/messages";

export function publicPath(prefix: string, path = "") {
  const cleanPrefix = prefix === "/" ? "" : prefix.replace(/\/$/, "");
  const cleanPath = path.replace(/^\//, "");
  return `${cleanPrefix}${cleanPath ? `/${cleanPath}` : ""}` || "/";
}

export function publicLanguagePrefix(
  root: string,
  language: string,
  defaultLanguage: string
) {
  return language === defaultLanguage ? root : publicPath(root, language);
}

export function isSupportedLocale(value: string): value is Locale {
  return value === "fr" || value === "en";
}