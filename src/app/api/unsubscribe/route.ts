import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { verifyUnsubscribe } from "@/lib/unsubscribe-token";
import { rateLimit } from "@/lib/rate-limit";

function html(body: string, status = 200) {
  return new NextResponse(
    `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>` +
      `<body style="font-family:monospace;padding:40px;max-width:480px;margin:0 auto">${body}</body></html>`,
    { status, headers: { "Content-Type": "text/html" } }
  );
}

function getParams(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email") ?? "";
  const token = req.nextUrl.searchParams.get("token") ?? "";
  return { email, token };
}

/** GET — show confirmation page (no destructive action) */
export async function GET(req: NextRequest) {
  const rlBlocked = rateLimit(req, "unsubscribe", { limit: 10, windowMs: 60_000 });
  if (rlBlocked) return rlBlocked;
  const { email, token } = getParams(req);

  if (!email || !token || !verifyUnsubscribe(email, token)) {
    return html("<h2>Link inválido ou expirado.</h2>", 400);
  }

  const action = `/api/unsubscribe?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;

  return html(
    `<h2>Cancelar inscrição?</h2>` +
      `<p>Você não receberá mais emails do rodrigo.wtf no endereço <strong>${email.replace(/</g, "&lt;")}</strong>.</p>` +
      `<form method="POST" action="${action}">` +
      `<button type="submit" style="font-family:monospace;padding:8px 16px;cursor:pointer">Confirmar cancelamento</button>` +
      `</form>` +
      `<br><a href="https://rodrigo.wtf">← Voltar ao site</a>`
  );
}

/** POST — actually delete the subscription */
export async function POST(req: NextRequest) {
  const rlBlocked = rateLimit(req, "unsubscribe", { limit: 10, windowMs: 60_000 });
  if (rlBlocked) return rlBlocked;
  const { email, token } = getParams(req);

  if (!email || !token || !verifyUnsubscribe(email, token)) {
    return html("<h2>Link inválido ou expirado.</h2>", 400);
  }

  const supabase = createSupabaseAdmin();
  await supabase.from("subscribers").delete().eq("email", email.toLowerCase());

  return html(
    `<h2>Inscrição cancelada.</h2>` +
      `<p>Você não receberá mais emails do rodrigo.wtf.</p>` +
      `<a href="https://rodrigo.wtf">← Voltar ao site</a>`
  );
}
