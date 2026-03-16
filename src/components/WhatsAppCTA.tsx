import Link from "next/link";

const WHATSAPP_URL =
  "https://wa.me/5500000000000?text=Oi%20Rodrigo%2C%20vim%20pelo%20site";

export default function WhatsAppCTA() {
  return (
    <section className="border-t-3 border-border bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20 flex flex-col items-center text-center gap-6">
        <p className="font-body text-sm uppercase tracking-widest text-muted opacity-60">
          /// READY TO CONNECT
        </p>
        <h2 className="font-heading text-[clamp(2rem,6vw,5rem)] font-bold uppercase leading-none">
          Bora conversar?
        </h2>
        <p className="font-body text-base md:text-lg max-w-xl text-background/80">
          Sem &quot;valor inbox&quot;. Vamos marcar uma conversa e analisar o
          seu cenário. Direto e sem enrolação.
        </p>
        <Link
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="brutal-btn bg-acid text-foreground px-8 md:px-12 py-4 md:py-5 font-heading text-lg md:text-xl font-bold uppercase tracking-wide border-background mt-4"
        >
          Chamar no WhatsApp →
        </Link>
        <p className="font-body text-xs text-background/50 mt-1">
          isso vai abrir o WhatsApp, mas só coloquei um texto tipo profissional
        </p>
      </div>
    </section>
  );
}
