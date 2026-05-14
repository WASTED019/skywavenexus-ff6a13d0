import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset Password — SKYWAVE NEXUS" }] }),
  component: ResetPassword,
});

const schema = z.object({
  password: z.string().min(8, "Min 8 characters").max(128),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, { message: "Passwords do not match", path: ["confirm"] });

function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Supabase handles the recovery token automatically and emits PASSWORD_RECOVERY
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    // Also accept an existing session (user clicked link and was signed in)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(""); setInfo("");
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      password: String(fd.get("password") || ""),
      confirm: String(fd.get("confirm") || ""),
    });
    if (!parsed.success) { setError(parsed.error.issues[0].message); return; }

    setBusy(true);
    try {
      const { error: updErr } = await supabase.auth.updateUser({ password: parsed.data.password });
      if (updErr) { setError(updErr.message); return; }
      // Clear the admin reset approval flag so it can't be reused
      await supabase.rpc("clear_reset_flag");
      setInfo("Password updated. Redirecting…");
      setTimeout(() => navigate({ to: "/dashboard" }), 1000);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <section className="mx-auto w-full max-w-md px-4 py-16">
        <h1 className="text-2xl font-bold">Set a new password</h1>

        {!ready ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Open this page from the password reset link in your email. If you got here by mistake, go back to{" "}
            <Link to="/sign-in" className="font-semibold text-brand-blue hover:underline">Sign In</Link>.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-2xl border bg-card p-6 shadow-soft">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">New password</span>
              <input name="password" type="password" required maxLength={128} className="w-full rounded-md border px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold">Confirm new password</span>
              <input name="confirm" type="password" required maxLength={128} className="w-full rounded-md border px-3 py-2 text-sm" />
            </label>

            {error && <p className="text-xs text-destructive">{error}</p>}
            {info && <p className="text-xs text-green-600">{info}</p>}

            <button disabled={busy} className="w-full rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
              {busy ? "Updating…" : "Update password"}
            </button>
          </form>
        )}
      </section>
      <Footer />
    </div>
  );
}
