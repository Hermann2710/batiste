"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import gsap from "gsap";
import { createSiteAction } from "@/actions/sites";
import { Button, Field, Input } from "@/components/ui";
import { useI18n } from "@/i18n/client";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/i18n/messages";
import { DEFAULT_THEMES } from "@/lib/themes";
import ThemePicker from "./ThemePicker";
import { cn, slugify } from "@/lib/utils";

const STEPS = 3;

export default function OnboardingWizard() {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [themeId, setThemeId] = useState("minimal");
  const [language, setLanguage] = useState<Locale>(locale);
  const [pending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);
  const stepContentRef = useRef<HTMLDivElement>(null);

  const subdomain = slugify(name) || "votre-site";

  // Entrance animation
  useEffect(() => {
    if (!containerRef.current) return;
    const tl = gsap.timeline({ delay: 0.1 });
    gsap.set(containerRef.current, { opacity: 0, y: 30 });
    tl.to(containerRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" });
    return () => { tl.kill(); };
  }, []);

  // Step transition animation
  useEffect(() => {
    if (!stepContentRef.current) return;
    gsap.fromTo(
      stepContentRef.current,
      { opacity: 0, x: 20 },
      { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" }
    );
  }, [step]);

  const submit = () => {
    startTransition(async () => {
      const result = await createSiteAction({
        name: name.trim(),
        themeId: themeId as "minimal" | "warm" | "corporate" | "bold",
        defaultLanguage: language,
      });

      if (!result.ok) {
        toast.error(
          result.error === "subdomain_taken" ? t.onboarding.subdomainTaken : t.common.genericError
        );
        return;
      }

      toast.success(t.onboarding.siteCreated);
      router.push(`/${locale}/dashboard/${result.data.siteId}`);
      router.refresh();
    });
  };

  return (
    <div className="mx-auto w-full max-w-2xl py-4 sm:py-8">
      <div ref={containerRef}>
        <p className="text-[13px] font-medium text-zinc-400">
          {step} / {STEPS}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
          {t.onboarding.title}
        </h1>
        <p className="mt-1.5 text-sm text-zinc-500">{t.onboarding.subtitle}</p>

        <div className="mt-6 flex gap-1.5">
          {Array.from({ length: STEPS }).map((_, index) => (
            <span
              key={index}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                index < step ? "bg-zinc-900" : "bg-zinc-200"
              )}
            />
          ))}
        </div>

        <div ref={stepContentRef} className="mt-8 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-[0_12px_40px_-28px_rgba(24,24,27,0.45)] sm:p-7">
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-base font-semibold tracking-tight">{t.onboarding.stepName}</h2>
              <Field hint={t.onboarding.stepNameHelp}>
                <Input
                  autoFocus
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder={t.onboarding.namePlaceholder}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && name.trim().length >= 2) setStep(2);
                  }}
                />
              </Field>
              <div className="rounded-xl bg-zinc-50 px-4 py-3 text-[13px] text-zinc-500">
                <span className="font-mono text-zinc-900">{subdomain}</span>.batiste.app
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-base font-semibold tracking-tight">{t.onboarding.stepTheme}</h2>
              <ThemePicker selected={themeId} onSelect={setThemeId} />
              <p className="text-xs text-zinc-500">{t.onboarding.stepThemeHelp}</p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-base font-semibold tracking-tight">
                {t.onboarding.stepLanguage}
              </h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {LOCALES.map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setLanguage(code)}
                    className={cn(
                      "flex items-center justify-between rounded-xl border-2 px-4 py-3 text-sm transition",
                      language === code
                        ? "border-zinc-900 bg-zinc-50"
                        : "border-zinc-200 hover:border-zinc-300"
                    )}
                  >
                    <span className="font-medium">{LOCALE_LABELS[code]}</span>
                    <span className="text-xs uppercase text-zinc-400">{code}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-zinc-500">{t.onboarding.stepLanguageHelp}</p>

              <dl className="space-y-1.5 rounded-xl bg-zinc-50 px-4 py-3 text-[13px]">
                <div className="flex justify-between">
                  <dt className="text-zinc-500">{t.onboarding.stepName}</dt>
                  <dd className="font-medium">{name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-500">{t.settings.theme}</dt>
                  <dd className="font-medium">
                    {DEFAULT_THEMES.find((theme) => theme.id === themeId)?.name}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-500">{t.settings.defaultLanguage}</dt>
                  <dd className="font-medium">{LOCALE_LABELS[language]}</dd>
                </div>
              </dl>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              onClick={() => setStep((value) => Math.max(1, value - 1))}
              disabled={step === 1 || pending}
            >
              {t.common.back}
            </Button>
            {step < STEPS ? (
              <Button
                onClick={() => setStep((value) => value + 1)}
                disabled={step === 1 && name.trim().length < 2}
              >
                {t.common.next}
              </Button>
            ) : (
              <Button onClick={submit} loading={pending}>
                {pending ? t.onboarding.creating : t.onboarding.createSite}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
