import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mapa do Sossego — rodrigo.wtf",
  description:
    "Mapeamento colaborativo de ruído urbano. Descubra quais ruas são silenciosas antes de caminhar ou alugar.",
};

export default function MapaDoSossegoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Botão de voltar flutuante — não interfere no mapa */}
      <Link
        href="/ferramentas"
        className="fixed top-6 left-6 z-[200] brutal-btn brutal-btn-adaptive px-4 py-2 font-body text-xs font-bold uppercase tracking-wide flex items-center gap-2"
      >
        <span aria-hidden="true">←</span> Ferramentas
      </Link>

      {/* Fullscreen — escapa o padding do body */}
      <div className="fixed inset-0 z-[150]">{children}</div>
    </>
  );
}
