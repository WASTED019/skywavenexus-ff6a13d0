import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

export const Route = createFileRoute("/sign-in")({
  head: () => ({ meta: [{ title: "Sign In — SKYWAVE NEXUS" }] }),
  component: SignIn,
});

const schema = z.object({
  identifier: z.string().trim().min(2, "Username or email required").max(255),
  password: z.string().min(6, "Password required").max(128),
});

function SignIn() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      identifier: String(fd.get("identifier") || ""),
      password: String(fd.get("password") || ""),
    });
    if (!parsed.success) { setError(parsed.error.issues[0].message); return; }

    setBusy(true);
    try {
      // Resolve username -> email
      const { data: emailResolved, error: rpcErr } = await supabase.rpc("resolve_login_email", { identifier: parsed.data.identifier });
      if (rpcErr || !emailResolved) { setError("No account found for that username or email."); return; }

      const { data, error: signErr } = await supabase.auth.signInWithPassword({
        email: emailResolved,
        password: parsed.data.password,
      });
      if (signErr || !data.session) { setError(signErr?.message || "Sign in failed"); return; }

      // Check role
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.session.user.id);
      const isAdmin = (roles ?? []).some((r) => r.role === "admin");
      navigate({ to: isAdmin ? "/admin" : "/dashboard" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <section className="mx-auto w-full max-w-md px-4 py-16">
        <h1 className="text-2xl font-bold">Sign In</h1>
        <p className="mt-2 text-sm text-muted-foreground">Welcome back. Sign in to access your dashboard.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-2xl border bg-card p-6 shadow-soft">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold">Username or Email</span>
            <input name="identifier" type="text" autoComplete="username" required maxLength={255} className="w-full rounded-md border px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold">Password</span>
            <input name="password" type="password" autoComplete="current-password" required maxLength={128} className="w-full rounded-md border px-3 py-2 text-sm" />
          </label>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <button disabled={busy} className="w-full rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {busy ? "Signing in…" : "Sign In"}
          </button>

          <p className="text-xs text-muted-foreground">
            Forgot your password? Call the office on <strong>0753366995</strong> or WhatsApp <strong>0753366995</strong>. The office must approve a reset before you can change your password.
          </p>

          <p className="text-center text-sm">
            No account? <Link to="/sign-up" className="font-semibold text-brand-blue hover:underline">Sign Up</Link>
          </p>
        </form>

        <Link to="/" className="mt-4 inline-block text-sm text-muted-foreground hover:text-foreground">← Back to home</Link>
      </section>
      <Footer />
    </div>
  );
}
