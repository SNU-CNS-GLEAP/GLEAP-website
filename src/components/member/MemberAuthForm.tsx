"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { memberAuthClient } from "@/lib/member-auth-client";

type Props = {
  locale: string;
  mode: "sign-in" | "sign-up";
  initialEmail?: string;
};

export function MemberAuthForm({ locale, mode, initialEmail = "" }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<{
    text: string;
    tone: "error" | "success";
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignup = mode === "sign-up";

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

    setIsSubmitting(true);
    const callbackURL = `/${locale}/member`;

    const result = isSignup
      ? await memberAuthClient.signUp.email({
          name,
          email: email.trim().toLowerCase(),
          password,
          callbackURL,
        })
      : await memberAuthClient.signIn.email({
          email: email.trim().toLowerCase(),
          password,
          callbackURL,
        });

    if (result.error) {
      setIsSubmitting(false);
      setMessage({
        tone: "error",
        text: result.error.message ?? "입력 내용을 다시 확인해 주세요.",
      });
      return;
    }

    if (isSignup) {
      // 가입 성공 후 방금 설정한 비밀번호로 즉시 로그인 처리
      const loginResult = await memberAuthClient.signIn.email({
        email: email.trim().toLowerCase(),
        password,
        callbackURL,
      });

      if (loginResult.error) {
        setIsSubmitting(false);
        setMessage({
          tone: "success",
          text: "회원가입이 완료되었습니다. 로그인 화면으로 이동합니다.",
        });
        setTimeout(() => {
          router.push(`/${locale}/member/login`);
        }, 1200);
        return;
      }
    }

    router.push(callbackURL);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-border bg-background p-6 shadow-sm">
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
          <span className="text-xs text-muted">초대받은 이메일 주소가 입력되었습니다.</span>
        )}
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        {isSignup ? "사용할 비밀번호 (8자 이상)" : "비밀번호"}
        <input
          type="password"
          autoComplete={isSignup ? "new-password" : "current-password"}
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
            autoComplete="new-password"
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
