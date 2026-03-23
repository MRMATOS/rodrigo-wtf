import { createHmac, timingSafeEqual } from "crypto";

const SECRET =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "fallback-unsubscribe-secret";

export function signUnsubscribe(email: string): string {
  return createHmac("sha256", SECRET)
    .update(email.toLowerCase().trim())
    .digest("hex");
}

export function verifyUnsubscribe(email: string, token: string): boolean {
  const expected = signUnsubscribe(email);
  if (expected.length !== token.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(token));
}
