"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { signInAction, signUpAction, type AuthState } from "@/actions/auth";
import { Field, Input, SubmitButton } from "@/components/ui";
import { useI18n } from "@/i18n/client";

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
