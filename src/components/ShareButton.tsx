"use client";

import { useState } from "react";

interface Props {
  title: string;
  url: string;
  className?: string;
}

export default function ShareButton({ title, url, className = "px-4 py-2 text-xs" }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // user cancelled — ignore
      }
      return;
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  }

  return (
    <button
      onClick={handleShare}
      className={`brutal-btn brutal-btn-adaptive font-body font-bold uppercase tracking-widest self-start ${className}`}
      style={{ transitionTimingFunction: "steps(1)", transitionDuration: "0s", transitionProperty: "background-color, color, border-color" }}
    >
      {copied ? "✓ Link copiado" : "↗ Compartilhar"}
    </button>
  );
}
