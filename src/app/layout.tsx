import type { Metadata } from "next";
import { headers } from "next/headers";
import { Toaster } from "sonner";
import { normalizeLocale } from "@/i18n/messages";
import "./globals.css";

export const metadata: Metadata = {
  title: "Batiste — Créez votre site vitrine",
  description: "Plateforme de création de sites vitrines multilingues, sans code.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headerList = await headers();
  const locale = normalizeLocale(headerList.get("x-batiste-locale") ?? undefined);

  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Inter:wght@400;500;600;700&family=Lora:wght@400;500;600&family=Playfair+Display:wght@500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-zinc-50 text-zinc-900 antialiased">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              borderRadius: "14px",
              border: "1px solid rgb(228 228 231)",
              fontSize: "13px",
              boxShadow: "0 16px 40px -24px rgba(24, 24, 27, 0.45)",
            },
          }}
        />
      </body>
    </html>
  );
}
