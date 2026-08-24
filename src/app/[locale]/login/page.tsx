import Link from "next/link";
import AuthForm from "@/components/auth/AuthForm";
import AnimatedAuthLayout from "@/components/marketing/AnimatedAuthLayout";
import { getMessages } from "@/i18n/messages";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getMessages(locale);

  return (
    <AnimatedAuthLayout
      left={
        <div className="mx-auto w-full max-w-sm">
          <div data-auth-anim>
            <Link
              href={`/${locale}`}
              className="text-[15px] font-semibold tracking-tight text-zinc-900"
            >
              {t.common.appName}
            </Link>
          </div>
          <h1
            data-auth-anim
            className="mt-10 text-2xl font-semibold tracking-tight text-zinc-900"
          >
            {t.auth.loginTitle}
          </h1>
          <p data-auth-anim className="mt-1 text-sm text-zinc-500">
            {t.auth.loginSubtitle}
          </p>

          <div data-auth-anim className="mt-8">
            <AuthForm mode="signin" />
          </div>

          <p data-auth-anim className="mt-6 text-sm text-zinc-500">
            {t.auth.noAccount}{" "}
            <Link
              href={`/${locale}/register`}
              className="font-medium text-zinc-900 underline underline-offset-4"
            >
              {t.auth.signUp}
            </Link>
          </p>
        </div>
      }
      right={
        <div className="flex h-full flex-col justify-between p-12 text-zinc-100">
          <span className="text-sm text-zinc-400">{t.common.appName}</span>
          <div>
            <p className="max-w-md text-3xl font-semibold leading-tight tracking-tight">
              {t.marketing.heroTitleA}
              <br />
              <span className="text-zinc-400">{t.marketing.heroTitleB}</span>
            </p>
            <p className="mt-4 max-w-sm text-sm text-zinc-400">
              {t.marketing.heroSubtitle}
            </p>
          </div>
          <div className="flex gap-2">
            {["#F6F6F5", "#FDF0E2", "#1D4ED8", "#A78BFA"].map((color) => (
              <span
                key={color}
                className="size-8 rounded-lg"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      }
    />
  );
}
