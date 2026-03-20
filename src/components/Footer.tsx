import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-3 border-border brutal-shadow bg-background text-foreground text-center py-6 px-4 font-body text-sm font-bold uppercase tracking-widest">
      rodrigo matos - A.I Builder{" "}
      //{" "}
      <Link href="/versoes" className="underline underline-offset-4 hover:text-acid transition-colors">
        v2.2
      </Link>
      {" "}
      //{" "}
      <Link href="/privacidade" className="underline underline-offset-4 hover:text-acid transition-colors">
        privacidade
      </Link>
      {" - "}
      <Link href="/termos" className="underline underline-offset-4 hover:text-acid transition-colors">
        termos
      </Link>
    </footer>
  );
}
