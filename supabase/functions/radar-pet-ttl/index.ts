// supabase/functions/radar-pet-ttl/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@6";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);

Deno.serve(async () => {
  const now = new Date();

  // ─── 1. Expirar pets com mais de 30 dias ────────────────────────────────────
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { error: expireError } = await supabase
    .from("pets")
    .update({ status: "expired" })
    .eq("status", "active")
    .lt("last_renewed_at", thirtyDaysAgo);

  if (expireError) console.error("Expire error:", expireError);

  // ─── 2. Enviar e-mail de aviso no 28º dia ────────────────────────────────────
  const twentyEightDaysAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000).toISOString();

  const { data: toRemind, error: remindError } = await supabase
    .from("pets")
    .select("id, name, user_id, last_renewed_at")
    .eq("status", "active")
    .is("reminder_sent_at", null)
    .lt("last_renewed_at", twentyEightDaysAgo);

  if (remindError) {
    console.error("Remind query error:", remindError);
  } else if (toRemind && toRemind.length > 0) {
    for (const pet of toRemind) {
      const { data: userData } = await supabase.auth.admin.getUserById(pet.user_id);
      const email = userData?.user?.email;

      if (email) {
        const renewUrl = `${Deno.env.get("NEXT_PUBLIC_SITE_URL")}/ferramentas/radar-pet/meus-pets`;

        await resend.emails.send({
          from: "Radar Pet <noreply@rodrigo.wtf>",
          to: email,
          subject: `Seu anúncio do ${pet.name ?? "pet"} vai expirar em 2 dias`,
          text: `Olá!\n\nO cadastro do ${pet.name ?? "seu pet"} no Radar Pet vai expirar em 2 dias.\n\nAinda está procurando? Acesse o link abaixo para renovar por mais 30 dias:\n\n${renewUrl}\n\nSe o pet já foi encontrado, você pode marcar como resolvido no mesmo link.\n\nRadar Pet`,
        });

        await supabase
          .from("pets")
          .update({ reminder_sent_at: now.toISOString() })
          .eq("id", pet.id);
      }
    }
  }

  return new Response(
    JSON.stringify({
      ok: true,
      reminded: toRemind?.length ?? 0,
    }),
    { headers: { "Content-Type": "application/json" } }
  );
});
