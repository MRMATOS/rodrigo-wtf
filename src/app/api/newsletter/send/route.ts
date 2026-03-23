import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin, createSupabaseServer } from "@/lib/supabase-server";
import { signUnsubscribe } from "@/lib/unsubscribe-token";
import { rateLimit } from "@/lib/rate-limit";
import { checkOrigin } from "@/lib/check-origin";
import { Resend } from "resend";
import { render } from "@react-email/components";
import NewPostEmail from "@/emails/NewPostEmail";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL ?? "newsletter@rodrigo.wtf";
const SITE_URL = "https://rodrigo.wtf";

export async function POST(req: NextRequest) {
  const forbidden = checkOrigin(req);
  if (forbidden) return forbidden;

  const blocked = rateLimit(req, "newsletter-send", { limit: 3, windowMs: 60_000 });
  if (blocked) return blocked;

  // Verify admin session
  const supabaseServer = await createSupabaseServer();
  const { data: { user } } = await supabaseServer.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const { postId } = await req.json();
    if (!postId) {
      return NextResponse.json({ error: "postId obrigatório." }, { status: 400 });
    }

    const supabase = createSupabaseAdmin();

    // Fetch the post
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("id, title, slug, category, content, cover_image, published_at, newsletter_sent_at")
      .eq("id", postId)
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: "Post não encontrado." }, { status: 404 });
    }

    if (!post.published_at) {
      return NextResponse.json({ error: "Post não está publicado." }, { status: 400 });
    }

    if (post.newsletter_sent_at) {
      return NextResponse.json(
        { error: "Newsletter já enviada para este post.", sent_at: post.newsletter_sent_at },
        { status: 409 }
      );
    }

    // Mark as sent BEFORE dispatching emails (prevents race condition)
    const { error: flagError } = await supabase
      .from("posts")
      .update({ newsletter_sent_at: new Date().toISOString() })
      .eq("id", postId)
      .is("newsletter_sent_at", null); // atomic: only if still null

    if (flagError) {
      return NextResponse.json({ error: "Erro ao marcar envio." }, { status: 500 });
    }

    // Fetch subscribers for this category
    const { data: subscribers, error: subError } = await supabase
      .from("subscribers")
      .select("email")
      .contains("categories", [post.category]);

    if (subError) throw subError;
    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ sent: 0, message: "Nenhum assinante para essa categoria." });
    }

    // Extract first real paragraph (skip headings, empty lines, images)
    const firstParagraph = post.content
      .split("\n")
      .map((line: string) => line.trim())
      .filter((line: string) =>
        line.length > 0 &&
        !line.startsWith("#") &&
        !line.startsWith("!") &&
        !line.startsWith(">") &&
        !line.startsWith("-") &&
        !line.startsWith("*") &&
        !line.startsWith("|")
      )
      .map((line: string) =>
        line
          .replace(/\*\*/g, "")
          .replace(/\*/g, "")
          .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
          .replace(/`([^`]+)`/g, "$1")
      )
      .find((line: string) => line.length > 40) ?? "";

    const postUrl = `${SITE_URL}/conteudo/${post.category}/${post.slug}`;

    // Cover image URL (if exists)
    const coverImage = post.cover_image
      ? post.cover_image.startsWith("http")
        ? post.cover_image
        : `${SITE_URL}${post.cover_image}`
      : undefined;

    // Send emails
    let sent = 0;
    for (const sub of subscribers) {
      const unsubToken = signUnsubscribe(sub.email);
      const unsubscribeUrl = `${SITE_URL}/api/unsubscribe?email=${encodeURIComponent(sub.email)}&token=${unsubToken}`;
      const html = await render(
        NewPostEmail({
          postTitle: post.title,
          postFirstParagraph: firstParagraph,
          postUrl,
          category: post.category,
          coverImage,
          unsubscribeUrl,
        })
      );

      const { error } = await resend.emails.send({
        from: FROM,
        to: sub.email,
        subject: `Novo post: ${post.title}`,
        html,
      });

      if (!error) sent++;
    }

    return NextResponse.json({ sent });
  } catch {
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
