import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot Password — SKYWAVE NEXUS" }] }),
  component: ForgotPassword,
});

const schema = z.object({ identifier: z.string().trim().min(2).max(255) });

function ForgotPassword() {
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(""); setInfo("");
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({ identifier: String(fd.get("identifier") || "") });
    if (!parsed.success) { setError("Enter your username or email."); return; }

    setBusy(true);
    try {
      // Step 1: check if reset already approved by an admin
      const { data: approved } = await supabase.rpc("customer_can_reset", { _identifier: parsed.data.identifier });
      if (approved) {
        const { data: email } = await supabase.rpc("resolve_login_email", { identifier: parsed.data.identifier });
        if (!email) { setError("No account found."); return; }
        const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (resetErr) { setError(resetErr.message); return; }
        setInfo("Reset link sent. Check your email.");
        return;
      }
      // Step 2: queue a reset request awaiting Super Admin approval
      const { error: reqErr } = await supabase.rpc("request_password_reset", { _identifier: parsed.data.identifier });
      if (reqErr) { setError(reqErr.message); return; }
      setInfo("Your password reset request has been submitted. The office will review and approve it shortly. After approval, return to this page and submit again to receive your reset link.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <section className="mx-auto w-full max-w-md px-4 py-16">
        <h1 className="text-2xl font-bold">Forgot password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Submit your username or email — the office will review your request and approve it.
          Once approved, return here and submit again to receive your reset link.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-2xl border bg-card p-6 shadow-soft">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold">Username or Email</span>
            <input name="identifier" type="text" required maxLength={255} className="w-full rounded-md border px-3 py-2 text-sm" />
          </label>

          {error && <p className="text-xs text-destructive">{error}</p>}
          {info && <p className="text-xs text-green-600">{info}</p>}

          <button disabled={busy} className="w-full rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {busy ? "Submitting…" : "Submit reset request"}
          </button>

          <p className="text-center text-sm">
            Remembered it? <Link to="/sign-in" className="font-semibold text-brand-blue hover:underline">Sign In</Link>
          </p>
        </form>
      </section>
      <Footer />
    </div>
  );
}
