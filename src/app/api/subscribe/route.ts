import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { rateLimit } from "@/lib/rate-limit";
import { checkOrigin } from "@/lib/check-origin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_CATEGORIES = ["analises", "projetos", "ferramentas"];

export async function POST(req: NextRequest) {
  const forbidden = checkOrigin(req);
  if (forbidden) return forbidden;

  const blocked = rateLimit(req, "subscribe", { limit: 5, windowMs: 60_000 });
  if (blocked) return blocked;

  try {
    const { email, categories } = await req.json();

    if (!email || typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
      return NextResponse.json({ error: "Email inválido." }, { status: 400 });
    }

    if (!Array.isArray(categories) || categories.length === 0) {
      return NextResponse.json(
        { error: "Selecione pelo menos uma categoria." },
        { status: 400 }
      );
    }

    const validCategories = categories.filter(
      (c: unknown): c is string =>
        typeof c === "string" && VALID_CATEGORIES.includes(c)
    );
    if (validCategories.length === 0) {
      return NextResponse.json(
        { error: "Categoria inválida." },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdmin();
    const { error } = await supabase.from("subscribers").upsert(
      { email: email.toLowerCase().trim(), categories: validCategories },
      { onConflict: "email" }
    );

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
