"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function FooterWrapper() {
  const pathname = usePathname();
  const isConteudo = pathname.startsWith("/conteudo");
  return <Footer showAdmin={isConteudo} />;
}
