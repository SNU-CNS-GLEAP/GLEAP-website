"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { memberAuthClient } from "@/lib/member-auth-client";

type Props = {
  locale: string;
  mode: "sign-in" | "sign-up";
};

export function MemberAuthForm({ locale, mode }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{
    text: string;
    tone: "error" | "success";
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignup = mode === "sign-up";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    const callbackURL = `/${locale}/member`;
    const result = isSignup
      ? await memberAuthClient.signUp.email({
          name,
          email,
          password,
          callbackURL,
        })
      : await memberAuthClient.signIn.email({
          email,
          password,
          callbackURL,
        });

    setIsSubmitting(false);

    if (result.error) {
      setMessage({
        tone: "error",
        text: result.error.message ?? "다시 확인해 주세요.",
      });
      return;
    }

    if (isSignup) {
      setMessage({
        tone: "success",
        text: "인증 이메일을 보냈습니다. 메일함의 링크를 눌러야 회원 기능을 사용할 수 있습니다.",
      });
      return;
    }

    router.push(callbackURL);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-4 rounded-lg border border-border bg-background p-6 shadow-sm">
      {isSignup && (
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          이름
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            className="rounded border border-border px-3 py-2 font-normal"
          />
        </label>
      )}
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        이메일
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="rounded border border-border px-3 py-2 font-normal"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        비밀번호
        <input
          type="password"
          autoComplete={isSignup ? "new-password" : "current-password"}
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          className="rounded border border-border px-3 py-2 font-normal"
        />
      </label>
      {message && (
        <p
          className={`text-sm ${
            message.tone === "error" ? "text-red-700" : "text-green-700"
          }`}
        >
          {message.text}
        </p>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded bg-primary px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "처리 중…" : isSignup ? "회원가입" : "로그인"}
      </button>
    </form>
  );
}
