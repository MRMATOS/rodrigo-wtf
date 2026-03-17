"use client";

import { createBrowserClient } from "@supabase/ssr";

export default function AdminLogin() {
  const handleGoogleLogin = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="border-3 border-border brutal-shadow bg-background p-10 md:p-16 flex flex-col items-center gap-8 w-full max-w-sm">
        <div className="text-center">
          <p className="font-heading text-xs font-bold uppercase tracking-widest opacity-50 mb-3">
            rodrigo.wtf
          </p>
          <h1 className="font-heading text-3xl md:text-4xl font-bold uppercase leading-none">
            Admin
          </h1>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="brutal-btn brutal-btn-adaptive w-full px-6 py-4 font-body text-sm font-bold uppercase tracking-wide text-center"
        >
          Entrar com Google
        </button>

        <p className="font-body text-xs opacity-40 text-center">
          Acesso restrito ao dono do site.
        </p>
      </div>
    </div>
  );
}
