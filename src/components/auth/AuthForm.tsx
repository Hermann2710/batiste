"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { signInAction, signUpAction, type AuthState } from "@/actions/auth";
import { Field, Input, SubmitButton } from "@/components/ui";
import { useI18n } from "@/i18n/client";
import { Globe2 } from "lucide-react";

export default function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const { locale, t } = useI18n();
  const action = mode === "signin" ? signInAction : signUpAction;
  const [state, formAction] = useActionState<AuthState, FormData>(
    action.bind(null, locale),
    {}
  );

  useEffect(() => {
    if (!state?.error) return;
    const messages: Record<string, string> = {
      invalid_credentials: t.auth.invalidCredentials,
      email_taken: t.auth.emailTaken,
      rate_limited: t.auth.tooManyAttempts,
      validation: t.validation.invalidEmail,
      unknown: t.common.genericError,
    };
    toast.error(messages[state.error] ?? t.common.genericError);
  }, [state, t]);

  return (
    <form action={formAction} className="space-y-4">
      <a
        href={`/api/auth/google?locale=${locale}`}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
      >
        <Globe2 className="size-4" aria-hidden="true" />
        {t.auth.continueWithGoogle}
      </a>
      <div className="flex items-center gap-3 text-xs text-zinc-400"><span className="h-px flex-1 bg-zinc-200" />{t.auth.or}<span className="h-px flex-1 bg-zinc-200" /></div>
      {mode === "signup" && (
        <div className="grid grid-cols-2 gap-3">
          <Field label={t.auth.firstName}>
            <Input name="firstName" autoComplete="given-name" placeholder="Camille" />
          </Field>
          <Field label={t.auth.lastName}>
            <Input name="lastName" autoComplete="family-name" placeholder="Durand" />
          </Field>
        </div>
      )}

      <Field label={t.auth.email} required>
        <Input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="vous@exemple.com"
        />
      </Field>

      <Field label={t.auth.password} hint={mode === "signup" ? t.auth.passwordHint : undefined} required>
        <Input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          placeholder="••••••••"
        />
      </Field>

      <SubmitButton size="lg" className="w-full" pendingLabel={t.common.loading}>
        {mode === "signin" ? t.auth.signIn : t.auth.signUp}
      </SubmitButton>
    </form>
  );
}
