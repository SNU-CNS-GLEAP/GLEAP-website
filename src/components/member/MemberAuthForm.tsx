"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
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
    // 이 페이지(/member/login, /member/signup)는 정적 렌더링(SSG)이라 서버에서 쿠키를
    // 읽어 폼에 심을 수 없다 — 이미 CSR로 호출 중인 session-status 엔드포인트에 얹힌
    // 토큰을 재사용한다 (src/lib/csrf.ts, src/app/api/session-status/route.ts 참고).
    fetch("/api/session-status")
      .then((res) => res.json())
      .then((data) => setCsrfToken(typeof data.csrfToken === "string" ? data.csrfToken : ""))
      .catch(() => {});
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (isSignup && password !== confirmPassword) {
      setMessage({
        tone: "error",
        text: "비밀번호 확인이 일치하지 않습니다.",
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
        text: result.error.message ?? "입력 내용을 다시 확인해 주세요.",
      });
      return;
    }

    // Better Auth의 회원가입 응답도 세션을 설정하므로 단회용 토큰으로
    // 별도의 로그인 요청을 반복하지 않고 곧바로 회원 영역으로 이동한다.
    router.replace(callbackURL);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-border bg-background p-6 shadow-sm">
      <input type="hidden" name={CSRF_FIELD_NAME} value={csrfToken} readOnly />
      {isSignup && (
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          이름 (실명)
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="홍길동"
            required
            className="rounded-lg border border-border px-3 py-2 font-normal focus:border-primary focus:outline-none"
          />
          {initialName && (
            <span className="text-xs text-muted">운영진이 지정한 구성원 이름입니다.</span>
          )}
        </label>
      )}

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        이메일 주소
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="member@snu.ac.kr"
          required
          className="rounded-lg border border-border px-3 py-2 font-normal focus:border-primary focus:outline-none"
        />
        {isSignup && initialEmail && (
          <span className="text-xs text-muted">초대받은 이메일 주소입니다.</span>
        )}
      </label>

      {isSignup && initialCohort && (
        <div className="rounded-lg bg-surface p-2.5 text-xs text-muted flex items-center justify-between">
          <span>소속 기수:</span>
          <span className="font-semibold text-primary">{initialCohort}</span>
        </div>
      )}

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        {isSignup ? "사용할 비밀번호 (8자 이상)" : "비밀번호"}
        <input
          type="password"
          autoComplete="off"
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          required
          className="rounded-lg border border-border px-3 py-2 font-normal focus:border-primary focus:outline-none"
        />
      </label>

      {isSignup && (
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          비밀번호 확인
          <input
            type="password"
            autoComplete="off"
            minLength={8}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="••••••••"
            required
            className="rounded-lg border border-border px-3 py-2 font-normal focus:border-primary focus:outline-none"
          />
        </label>
      )}

      {message && (
        <p
          className={`text-sm rounded-lg p-2.5 ${
            message.tone === "error" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
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
        className="mt-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 transition"
      >
        {isSubmitting ? "처리 중…" : isSignup ? "비밀번호 설정 및 가입 완료" : "로그인"}
      </button>
    </form>
  );
}
