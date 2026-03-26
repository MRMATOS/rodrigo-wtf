"use client";

import Link from "next/link";
import { useT } from "@/contexts/LanguageContext";

export default function Footer({ showAdmin = false }: { showAdmin?: boolean }) {
  const { t } = useT();
  return (
    <footer className="border-3 border-border brutal-shadow bg-background text-foreground text-center py-6 px-4 font-body text-sm font-bold uppercase tracking-widest">
      {t.footer.credit}{" "}
      //{" "}
      <Link href="/versoes" className="underline underline-offset-4 hover:text-acid transition-colors">
        v3.0
      </Link>
      {" "}
      //{" "}
      <Link href="/privacidade" className="underline underline-offset-4 hover:text-acid transition-colors">
        {t.footer.privacy}
      </Link>
      {" - "}
      <Link href="/termos" className="underline underline-offset-4 hover:text-acid transition-colors">
        {t.footer.terms}
      </Link>
      {showAdmin && (
        <>
          {" - "}
          <Link href="/admin" className="underline underline-offset-4 hover:text-acid transition-colors">
            {t.footer.admin}
          </Link>
        </>
      )}
    </footer>
  );
}
