"use client";

import { useState, useEffect } from "react";
import NewsletterModal from "./NewsletterModal";

export default function NewsletterButton({ lang }: { lang: "pt" | "en" }) {
  const [open, setOpen] = useState(false);
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);

  useEffect(() => {
    setAlreadySubscribed(!!localStorage.getItem("newsletter_subscribed"));
  }, []);

  if (alreadySubscribed) return null;

  const label = lang === "pt" ? "Newsletter" : "Newsletter";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="brutal-btn brutal-btn-adaptive px-3 py-1.5 font-body text-xs font-bold uppercase tracking-wide"
      >
        {label}
      </button>
      {open && <NewsletterModal defaultOpen onClose={() => setOpen(false)} />}
    </>
  );
}
