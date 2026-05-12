import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

export const Route = createFileRoute("/admin-login")({
  head: () => ({ meta: [{ title: "Admin Login — SKYWAVE NEXUS" }] }),
  component: AdminLogin,
});

const credSchema = z.object({
  email: z.string().trim().email("Valid email required").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

function AdminLogin() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(""); setInfo("");
    const fd = new FormData(e.currentTarget);
    const parsed = credSchema.safeParse({
      email: String(fd.get("email") || ""),
      password: String(fd.get("password") || ""),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Invalid input");
      return;
    }

    setBusy(true);
    try {
      if (mode === "signup") {
        const { error: e1 } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (e1) { setError(e1.message); return; }
        // Try to claim admin if no admin exists yet (bootstrap first user)
        const { data: claim } = await supabase.rpc("claim_admin_if_none");
        if (claim === true) {
          setInfo("Account created and admin access granted. Redirecting…");
        } else {
          setInfo("Account created. An existing admin must grant you access.");
        }
        setTimeout(() => navigate({ to: "/admin" }), 800);
      } else {
        const { error: e1 } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        if (e1) { setError(e1.message); return; }
        navigate({ to: "/admin" });
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <section className="mx-auto w-full max-w-md px-4 py-16">
        <h1 className="text-2xl font-bold">Admin {mode === "signin" ? "Sign In" : "Sign Up"}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Authorized personnel only. Access is gated server-side by role.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-2xl border bg-card p-6 shadow-soft">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold">Email</span>
            <input name="email" type="email" autoComplete="email" maxLength={255} required className="w-full rounded-md border px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold">Password</span>
            <input name="password" type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} minLength={8} maxLength={128} required className="w-full rounded-md border px-3 py-2 text-sm" />
          </label>

          {error && <p className="text-xs text-destructive">{error}</p>}
          {info && <p className="text-xs text-brand-green">{info}</p>}

          <button disabled={busy} className="w-full rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>

          <button
            type="button"
            onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); setInfo(""); }}
            className="block w-full text-center text-xs text-muted-foreground hover:text-foreground"
          >
            {mode === "signin" ? "No account yet? Create one" : "Already have an account? Sign in"}
          </button>

          <p className="text-xs text-muted-foreground">
            The first registered account automatically becomes admin. Additional admins must be granted by an existing admin.
          </p>
        </form>

        <Link to="/" className="mt-4 inline-block text-sm text-muted-foreground hover:text-foreground">← Back to home</Link>
      </section>
      <Footer />
    </div>
  );
}
