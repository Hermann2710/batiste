"use client";

import { createContext, useContext } from "react";
import {
  DEFAULT_LOCALE,
  getMessages,
  type Locale,
  type Messages,
} from "./messages";

interface I18nValue {
  locale: Locale;
  t: Messages;
}

const I18nContext = createContext<I18nValue>({
  locale: DEFAULT_LOCALE,
  t: getMessages(DEFAULT_LOCALE),
});

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return (
    <I18nContext.Provider value={{ locale, t: getMessages(locale) }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

/** Prefix a path with the active locale. */
export function useLocalePath() {
  const { locale } = useI18n();
  return (path: string) =>
    `/${locale}${path.startsWith("/") ? path : `/${path}`}`;
}
