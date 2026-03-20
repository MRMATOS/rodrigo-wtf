import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import LogoutButton from "./_components/LogoutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Login page doesn't need the shell
  if (!user) {
    return <>{children}</>;
  }

  // Only allow the authorized admin email
  if (user.email !== process.env.ADMIN_EMAIL) {
    redirect("/admin/login?error=unauthorized");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Admin top bar */}
      <header className="border-b-3 border-border bg-background sticky top-0 z-50 px-4 md:px-8 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="font-heading text-sm font-bold uppercase bg-foreground text-background px-2 py-1 hover:bg-acid hover:text-[#000000]"
            style={{ transitionTimingFunction: "steps(1)", transitionDuration: "0s", transitionProperty: "background-color, color" }}
          >
            rodrigo.wtf
          </Link>
          <span className="font-body text-xs opacity-40">/</span>
          <Link
            href="/admin"
            className="font-body text-sm font-bold uppercase tracking-wide hover:text-acid"
          >
            Admin
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/novo"
            className="brutal-btn brutal-btn-adaptive px-3 py-1.5 font-body text-xs font-bold uppercase tracking-wide"
          >
            [+] Novo post
          </Link>
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-8 py-8">{children}</main>
    </div>
  );
}
