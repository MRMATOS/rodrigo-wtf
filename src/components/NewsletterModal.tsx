"use client";

import { useState, useEffect } from "react";
import { useT } from "@/contexts/LanguageContext";

const CATEGORIES = [
  { key: "analises", pt: "Análises", en: "Analyses" },
  { key: "projetos", pt: "Projetos", en: "Projects" },
  { key: "ferramentas", pt: "Ferramentas", en: "Tools" },
];

interface Props {
  defaultOpen?: boolean;
  onClose?: () => void;
}

export default function NewsletterModal({ defaultOpen = false, onClose }: Props) {
  const { lang } = useT();
  const [open, setOpen] = useState(defaultOpen);
  const [email, setEmail] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    setOpen(defaultOpen);
  }, [defaultOpen]);

  const t = {
    title: lang === "pt" ? "Receba novos posts" : "Get new posts",
    subtitle: lang === "pt" ? "Escolha o que quer receber:" : "Choose what to receive:",
    placeholder: lang === "pt" ? "seu@email.com" : "your@email.com",
    subscribe: lang === "pt" ? "ASSINAR →" : "SUBSCRIBE →",
    success: lang === "pt" ? "Inscrito! Você receberá os próximos posts." : "Subscribed! You'll receive the next posts.",
    error: lang === "pt" ? "Algo deu errado. Tente novamente." : "Something went wrong. Try again.",
    close: lang === "pt" ? "Fechar" : "Close",
  };

  function close() {
    setOpen(false);
    onClose?.();
  }

  function toggleCategory(key: string) {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selected.length === 0) return;
    setStatus("loading");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, categories: selected }),
      });

      if (!res.ok) throw new Error();

      setStatus("success");
      localStorage.setItem("newsletter_subscribed", "1");
      setTimeout(() => close(), 2500);
    } catch {
      setStatus("error");
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div className="w-full max-w-sm border-3 border-border brutal-shadow bg-background p-6 md:p-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="font-body text-xs font-bold uppercase tracking-widest opacity-50 mb-1">
              // rodrigo.wtf
            </p>
            <h2 className="font-heading text-xl font-bold uppercase">
              {t.title}
            </h2>
          </div>
          <button
            onClick={close}
            className="font-body text-xs font-bold opacity-50 hover:opacity-100 mt-1 shrink-0"
            aria-label={t.close}
          >
            [×]
          </button>
        </div>

        {status === "success" ? (
          <p className="font-body text-sm font-bold text-acid py-4">
            ✓ {t.success}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <p className="font-body text-xs uppercase tracking-widest opacity-60 mb-3">
                {t.subtitle}
              </p>
              <div className="flex flex-col gap-2">
                {CATEGORIES.map((cat) => (
                  <label
                    key={cat.key}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <span
                      className={`w-4 h-4 border-2 border-border flex items-center justify-center shrink-0 font-body text-xs font-bold ${
                        selected.includes(cat.key)
                          ? "bg-foreground text-background"
                          : "bg-background"
                      }`}
                    >
                      {selected.includes(cat.key) ? "✓" : ""}
                    </span>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={selected.includes(cat.key)}
                      onChange={() => toggleCategory(cat.key)}
                    />
                    <span className="font-body text-sm font-bold uppercase tracking-wide">
                      {lang === "pt" ? cat.pt : cat.en}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.placeholder}
              className="border-3 border-border bg-background px-4 py-3 font-body text-sm w-full focus:outline-none focus:border-foreground placeholder:opacity-40"
            />

            {status === "error" && (
              <p className="font-body text-xs text-red-500">{t.error}</p>
            )}

            <button
              type="submit"
              disabled={status === "loading" || selected.length === 0}
              className="brutal-btn brutal-btn-adaptive px-6 py-3 font-body text-sm font-bold uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed w-full"
              style={{ transitionTimingFunction: "steps(1)", transitionDuration: "0s", transitionProperty: "background-color, color" }}
            >
              {status === "loading" ? "..." : t.subscribe}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
