"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  locale: string;
  labels: {
    email: string;
    password: string;
    submit: string;
    pending: string;
    invalid: string;
  };
};

export function MemberLoginForm({ locale, labels }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    });

    if (signInError) {
      setError(labels.invalid);
      setPending(false);
      return;
    }

    router.replace(`/${locale}/community`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        {labels.email}
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="rounded border border-border bg-background px-3 py-2 font-normal"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        {labels.password}
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="rounded border border-border bg-background px-3 py-2 font-normal"
        />
      </label>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-primary px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? labels.pending : labels.submit}
      </button>
    </form>
  );
}
