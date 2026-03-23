"use client";

import { useState } from "react";

export default function SendNewsletterButton({ postId }: { postId: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [sent, setSent] = useState(0);

  async function handleSend() {
    if (!confirm("Enviar newsletter para os assinantes dessa categoria?")) return;
    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSent(data.sent);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <span className="font-body text-xs font-bold text-acid uppercase tracking-wide">
        ✓ {sent} enviados
      </span>
    );
  }

  if (status === "error") {
    return (
      <span className="font-body text-xs font-bold text-red-500 uppercase tracking-wide">
        Erro ao enviar
      </span>
    );
  }

  return (
    <button
      onClick={handleSend}
      disabled={status === "loading"}
      className="brutal-btn bg-background px-3 py-1.5 font-body text-xs font-bold uppercase tracking-wide hover:bg-acid hover:text-[#000000] disabled:opacity-40"
      style={{ transitionTimingFunction: "steps(1)", transitionDuration: "0s", transitionProperty: "background-color, color" }}
    >
      {status === "loading" ? "..." : "Newsletter"}
    </button>
  );
}
