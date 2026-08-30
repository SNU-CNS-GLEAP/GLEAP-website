"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { memberAuthClient } from "@/lib/member-auth-client";
import {
  TurnstileWidget,
  type TurnstileWidgetHandle,
} from "@/components/TurnstileWidget";
import { CSRF_FIELD_NAME, CSRF_HEADER_NAME } from "@/lib/csrf-shared";

type Props = {
  locale: string;
  mode: "sign-in" | "sign-up";
  turnstileSiteKey: string;
  initialEmail?: string;
  initialName?: string;
  initialCohort?: string;
};

export function MemberAuthForm({
  locale,
  mode,
  turnstileSiteKey,
  initialEmail = "",
  initialName = "",
  initialCohort = "",
}: Props) {
  const t = useTranslations("MemberArea");
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<{
    text: string;
    tone: "error" | "success";
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState("");
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);

  const isSignup = mode === "sign-up";

  useEffect(() => {
    fetch("/api/session-status")
      .then((response) => response.json())
      .then((data) => setCsrfToken(typeof data.csrfToken === "string" ? data.csrfToken : ""))
      .catch(() => {});
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (isSignup && password !== confirmPassword) {
      setMessage({
        tone: "error",
        text: t("passwordMismatch"),
      });
      return;
    }

    if (!turnstileToken) {
      setMessage({
        tone: "error",
        text: locale === "ko"
          ? "보안 확인을 완료해 주세요."
          : "Please complete the security check.",
      });
      return;
    }

    setIsSubmitting(true);
    const callbackURL = `/${locale}/member`;
    const authHeaders = {
      "x-captcha-response": turnstileToken,
      [CSRF_HEADER_NAME]: csrfToken,
    };

    const result = isSignup
      ? await memberAuthClient.signUp.email({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          callbackURL,
          fetchOptions: { headers: authHeaders },
        })
      : await memberAuthClient.signIn.email({
          email: email.trim().toLowerCase(),
          password,
          callbackURL,
          fetchOptions: { headers: authHeaders },
        });

    if (result.error) {
      setIsSubmitting(false);
      turnstileRef.current?.reset();
      setMessage({
        tone: "error",
        text: result.error.message ?? t("formInvalid"),
      });
      return;
    }

    router.replace(callbackURL);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="form-panel form-panel-accent flex w-full max-w-md flex-col gap-5 p-6 sm:p-8">
      <input type="hidden" name={CSRF_FIELD_NAME} value={csrfToken} readOnly />
      {isSignup && (
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          {t("nameLabel")}
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t("namePlaceholder")}
            required
            className="min-h-12 border border-border px-4 font-normal focus:border-primary focus:outline-none"
          />
          {initialName && (
            <span className="text-xs text-muted">{t("assignedNameHint")}</span>
          )}
        </label>
      )}

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        {t("emailLabel")}
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="member@snu.ac.kr"
          required
          className="min-h-12 border border-border px-4 font-normal focus:border-primary focus:outline-none"
        />
        {isSignup && initialEmail && (
          <span className="text-xs text-muted">{t("invitedEmailHint")}</span>
        )}
      </label>

      {isSignup && initialCohort && (
        <div className="flex items-center justify-between border border-border bg-surface p-3 text-xs text-muted">
          <span>{t("cohortLabel")}</span>
          <span className="font-semibold text-primary">{initialCohort}</span>
        </div>
      )}

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        {isSignup ? t("passwordNewLabel") : t("passwordLabel")}
        <input
          type="password"
          autoComplete="off"
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          required
          className="min-h-12 border border-border px-4 font-normal focus:border-primary focus:outline-none"
        />
      </label>

      {isSignup && (
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          {t("confirmPasswordLabel")}
          <input
            type="password"
            autoComplete="off"
            minLength={8}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="••••••••"
            required
            className="min-h-12 border border-border px-4 font-normal focus:border-primary focus:outline-none"
          />
        </label>
      )}

      {message && (
        <p
          aria-live="polite"
          className={`border p-3 text-sm ${
            message.tone === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {message.text}
        </p>
      )}

      <TurnstileWidget
        ref={turnstileRef}
        siteKey={turnstileSiteKey}
        language={locale}
        onTokenChange={setTurnstileToken}
        onError={() => {
          setMessage({
            tone: "error",
            text: locale === "ko"
              ? "보안 확인을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요."
              : "The security check could not be loaded. Please try again shortly.",
          });
        }}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="form-button-primary mt-1 w-full"
      >
        {isSubmitting ? t("processing") : isSignup ? t("signupSubmit") : t("loginSubmit")}
      </button>
    </form>
  );
}
