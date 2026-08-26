import "server-only";

import { env } from "@/lib/env";

const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const MAX_TOKEN_LENGTH = 2048;
const VERIFY_TIMEOUT_MS = 10_000;

type SiteverifyResponse = {
  success?: boolean;
};

export async function verifyTurnstileToken(
  token: FormDataEntryValue | null,
): Promise<boolean> {
  if (
    typeof token !== "string" ||
    token.length === 0 ||
    token.length > MAX_TOKEN_LENGTH
  ) {
    return false;
  }

  try {
    const response = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: env.turnstileSecretKey,
        response: token,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(VERIFY_TIMEOUT_MS),
    });

    if (!response.ok) return false;

    const result = (await response.json()) as SiteverifyResponse;
    return result.success === true;
  } catch {
    return false;
  }
}
