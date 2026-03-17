import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rodrigo.wtf"),
  title: {
    default: "rodrigo.wtf — Eu faço sites funcionais",
    template: "%s — rodrigo.wtf",
  },
  description:
    "Rodrigo Matos. Sites funcionais, ferramentas e consultoria. Sem enrolação.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://rodrigo.wtf",
    siteName: "rodrigo.wtf",
    title: "rodrigo.wtf — Eu faço sites funcionais",
    description:
      "Rodrigo Matos. Sites funcionais, ferramentas e consultoria. Sem enrolação.",
    images: [{ url: "/opengraph-image.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "rodrigo.wtf — Eu faço sites funcionais",
    description:
      "Rodrigo Matos. Sites funcionais, ferramentas e consultoria. Sem enrolação.",
    images: ["/opengraph-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var local = localStorage.getItem('theme');
                  var dark = local === 'dark' || (!local && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (dark) document.documentElement.classList.add('dark');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} font-body antialiased bg-background text-foreground`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[1000] brutal-btn brutal-btn-adaptive px-4 py-2 font-body text-sm font-bold uppercase"
        >
          Ir para o conteúdo
        </a>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
