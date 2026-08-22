import Link from "next/link";
import AuthForm from "@/components/auth/AuthForm";
import AnimatedAuthLayout from "@/components/marketing/AnimatedAuthLayout";
import { getMessages } from "@/i18n/messages";

export default async function RegisterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = getMessages(locale);

  return (
    <AnimatedAuthLayout
      left={
        <div className="mx-auto w-full max-w-sm">
          <div data-auth-anim>
            <Link href={`/${locale}`} className="text-[15px] font-semibold tracking-tight text-zinc-900">
              {t.common.appName}
            </Link>
          </div>
          <h1 data-auth-anim className="mt-10 text-2xl font-semibold tracking-tight text-zinc-900">
            {t.auth.registerTitle}
          </h1>
          <p data-auth-anim className="mt-1 text-sm text-zinc-500">{t.auth.registerSubtitle}</p>

          <div data-auth-anim className="mt-8">
            <AuthForm mode="signup" />
          </div>

          <p data-auth-anim className="mt-6 text-sm text-zinc-500">
            {t.auth.hasAccount}{" "}
            <Link href={`/${locale}/login`} className="font-medium text-zinc-900 underline underline-offset-4">
              {t.auth.signIn}
            </Link>
          </p>
        </div>
      }
      right={
        <div className="flex h-full flex-col justify-between p-12 text-zinc-100">
          <span className="text-sm text-zinc-400">{t.common.appName}</span>
          <ol className="space-y-6">
            {[
              [t.marketing.step1, t.marketing.step1Desc],
              [t.marketing.step2, t.marketing.step2Desc],
              [t.marketing.step3, t.marketing.step3Desc],
            ].map(([title, desc], index) => (
              <li key={title} className="flex gap-4">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-zinc-700 text-xs text-zinc-400">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-sm text-zinc-400">{desc}</p>
                </div>
              </li>
            ))}
          </ol>
          <span className="text-xs text-zinc-500">{t.marketing.finalCtaDesc}</span>
        </div>
      }
    />
  );
}
