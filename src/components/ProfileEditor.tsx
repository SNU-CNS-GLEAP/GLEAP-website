"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  name: string | null;
  cohort: string | null;
  bio: string | null;
  interests: string[] | null;
  instagram_url: string | null;
  github_url: string | null;
};

type Props = {
  profile: Profile;
  labels: {
    name: string;
    cohort: string;
    bio: string;
    interests: string;
    interestsHint: string;
    instagram: string;
    github: string;
    save: string;
    saving: string;
    password: string;
    passwordHint: string;
    updatePassword: string;
    error: string;
    saved: string;
  };
};

export function ProfileEditor({ profile, labels }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaved(false);
    setPending(true);
    const formData = new FormData(event.currentTarget);
    const interests = String(formData.get("interests") ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        name: String(formData.get("name") ?? "").trim(),
        cohort: String(formData.get("cohort") ?? "").trim() || null,
        bio: String(formData.get("bio") ?? "").trim() || null,
        interests,
        instagram_url: String(formData.get("instagram_url") ?? "").trim() || null,
        github_url: String(formData.get("github_url") ?? "").trim() || null,
      })
      .eq("id", profile.id);

    if (updateError) {
      setError(labels.error);
      setPending(false);
      return;
    }

    setSaved(true);
    setPending(false);
    router.refresh();
  }

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaved(false);
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    if (!password) return;

    setPending(true);
    const supabase = createClient();
    const { error: passwordError } = await supabase.auth.updateUser({ password });
    if (passwordError) {
      setError(labels.error);
      setPending(false);
      return;
    }

    event.currentTarget.reset();
    setSaved(true);
    setPending(false);
  }

  return (
    <div className="flex max-w-2xl flex-col gap-10">
      <form onSubmit={saveProfile} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          {labels.name}
          <input name="name" required maxLength={80} defaultValue={profile.name ?? ""} className="rounded border border-border bg-background px-3 py-2 font-normal" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          {labels.cohort}
          <input name="cohort" maxLength={40} defaultValue={profile.cohort ?? ""} className="rounded border border-border bg-background px-3 py-2 font-normal" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          {labels.bio}
          <textarea name="bio" maxLength={500} rows={4} defaultValue={profile.bio ?? ""} className="resize-y rounded border border-border bg-background px-3 py-2 font-normal" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          {labels.interests}
          <input name="interests" defaultValue={(profile.interests ?? []).join(", ")} className="rounded border border-border bg-background px-3 py-2 font-normal" />
          <span className="font-normal text-muted">{labels.interestsHint}</span>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          {labels.instagram}
          <input name="instagram_url" type="url" defaultValue={profile.instagram_url ?? ""} className="rounded border border-border bg-background px-3 py-2 font-normal" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          {labels.github}
          <input name="github_url" type="url" defaultValue={profile.github_url ?? ""} className="rounded border border-border bg-background px-3 py-2 font-normal" />
        </label>
        <button type="submit" disabled={pending} className="w-fit rounded bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
          {pending ? labels.saving : labels.save}
        </button>
      </form>
      <form onSubmit={updatePassword} className="flex flex-col gap-3 border-t border-border pt-8">
        <div>
          <h2 className="text-lg font-semibold">{labels.password}</h2>
          <p className="mt-1 text-sm text-muted">{labels.passwordHint}</p>
        </div>
        <input name="password" type="password" minLength={8} required autoComplete="new-password" className="rounded border border-border bg-background px-3 py-2" />
        <button type="submit" disabled={pending} className="w-fit rounded border border-border px-4 py-2 text-sm font-medium hover:border-primary hover:text-primary disabled:opacity-60">
          {labels.updatePassword}
        </button>
      </form>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      {saved && <p role="status" className="text-sm text-primary">{labels.saved}</p>}
    </div>
  );
}
