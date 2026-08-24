"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import gsap from "gsap";
import { createSiteAction } from "@/actions/sites";
import { Button } from "@/components/ui";
import { useI18n } from "@/i18n/client";
import { type Locale } from "@/i18n/messages";
import { DEFAULT_THEMES } from "@/lib/themes";
import {
  LanguageStep,
  NameStep,
  ThemeStep,
  WizardActions,
} from "./OnboardingSteps";
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
    tl.to(containerRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "power3.out",
    });
    return () => {
      tl.kill();
    };
  }, []);

  // Step transition animation
  useEffect(() => {
    if (!stepContentRef.current) return;
    gsap.fromTo(
      stepContentRef.current,
      { opacity: 0, x: 20 },
      { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" },
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
          result.error === "subdomain_taken"
            ? t.onboarding.subdomainTaken
            : t.common.genericError,
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
                index < step ? "bg-zinc-900" : "bg-zinc-200",
              )}
            />
          ))}
        </div>

        <div
          ref={stepContentRef}
          className="mt-8 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-[0_12px_40px_-28px_rgba(24,24,27,0.45)] sm:p-7"
        >
          {step === 1 && (
            <NameStep
              name={name}
              setName={setName}
              onContinue={() => setStep(2)}
              help={t.onboarding.stepNameHelp}
              placeholder={t.onboarding.namePlaceholder}
            />
          )}

          {step === 2 && (
            <ThemeStep
              themeId={themeId}
              setThemeId={setThemeId}
              title={t.onboarding.stepTheme}
              help={t.onboarding.stepThemeHelp}
            />
          )}

          {step === 3 && (
            <LanguageStep
              language={language}
              setLanguage={setLanguage}
              title={t.onboarding.stepLanguage}
              help={t.onboarding.stepLanguageHelp}
              name={name}
              themeId={themeId}
              themeLabel={t.settings.theme}
              languageLabel={t.settings.defaultLanguage}
            />
          )}

          <WizardActions
            step={step}
            pending={pending}
            onBack={() => setStep((value) => Math.max(1, value - 1))}
            onNext={() => setStep((value) => value + 1)}
            onSubmit={submit}
            back={t.common.back}
            next={t.common.next}
            create={t.onboarding.createSite}
            creating={t.onboarding.creating}
            canContinue={name.trim().length >= 2}
          />
        </div>
      </div>
    </div>
  );
}
