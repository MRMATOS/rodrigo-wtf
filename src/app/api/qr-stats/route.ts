import { createSupabaseAdmin } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rodrigo.wtf";

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

function isOriginAllowed(req: NextRequest): boolean {
  const origin  = req.headers.get("origin");
  const referer = req.headers.get("referer");
  if (origin)  return origin === ALLOWED_ORIGIN;
  if (referer) return referer.startsWith(ALLOWED_ORIGIN);
  return false;
}

export async function GET() {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("tool_stats")
    .select("count")
    .eq("tool", "qr-generator")
    .single();

  if (error) return NextResponse.json({ count: 0 });
  return NextResponse.json({ count: data.count });
}

export async function POST(req: NextRequest) {
  // V-011: verificar origin
  if (!isOriginAllowed(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ip = getClientIp(req);
  const supabase = createSupabaseAdmin();

  // V-005: rate limit — máx 5 req/min por IP
  const { data: blocked, error: rlError } = await supabase.rpc(
    "check_qr_rate_limit",
    { client_ip: ip, max_requests: 5, window_seconds: 60 }
  );

  if (rlError) {
    console.error("[qr-stats] rate limit check failed:", rlError.message);
  }

  if (blocked) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  // Incrementa contador
  const { data, error } = await supabase.rpc("increment_tool_stat", {
    tool_name: "qr-generator",
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ count: data });
}
