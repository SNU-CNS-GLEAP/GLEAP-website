import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireMember(locale: string) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data && typeof data.claims.sub === "string" ? data.claims.sub : null;

  if (!userId) {
    redirect(`/${locale}/login`);
  }

  return { supabase, userId };
}
