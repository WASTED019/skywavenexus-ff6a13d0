import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

export const Route = createFileRoute("/sign-up")({
  head: () => ({ meta: [{ title: "Sign Up — SKYWAVE NEXUS" }] }),
  component: SignUp,
});

const schema = z.object({
  username: z.string().trim().min(3, "Username must be 3+ chars").max(40).regex(/^[a-zA-Z0-9_.-]+$/, "Letters, numbers, _ . - only"),
  full_name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(7).max(20),
  whatsapp: z.string().trim().min(7).max(20),
  email: z.string().trim().email().max(255),
  county: z.string().trim().min(1).max(80),
  town: z.string().trim().min(1).max(120),
  password: z.string().min(8, "Min 8 characters").max(128),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, { message: "Passwords do not match", path: ["confirm"] });

const counties = ["Nyeri","Nairobi","Kiambu","Murang'a","Kirinyaga","Embu","Meru","Laikipia","Nakuru","Mombasa","Kisumu","Other"];

function SignUp() {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(""); setErrors({});
    const fd = new FormData(e.currentTarget);
    const raw = Object.fromEntries(fd.entries()) as Record<string, string>;
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const i of parsed.error.issues) errs[i.path.join(".")] = i.message;
      setErrors(errs); return;
    }

    setBusy(true);
    try {
      const { data, error: signErr } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            username: parsed.data.username,
            full_name: parsed.data.full_name,
            phone: parsed.data.phone,
            whatsapp: parsed.data.whatsapp,
            county: parsed.data.county,
            town: parsed.data.town,
          },
        },
      });
      if (signErr) { setError(signErr.message); return; }
      if (data.session) {
        navigate({ to: "/dashboard" });
      } else {
        setError("Account created. Please sign in.");
        setTimeout(() => navigate({ to: "/sign-in" }), 1200);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <section className="mx-auto w-full max-w-2xl px-4 py-16">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sign up to track your service requests and receive admin feedback.</p>

        <form onSubmit={onSubmit} className="mt-6 grid gap-4 rounded-2xl border bg-card p-6 shadow-soft sm:grid-cols-2">
          <F label="Username" name="username" err={errors.username} maxLength={40} />
          <F label="Full name" name="full_name" err={errors.full_name} maxLength={100} />
          <F label="Phone" name="phone" type="tel" err={errors.phone} maxLength={20} />
          <F label="WhatsApp" name="whatsapp" type="tel" err={errors.whatsapp} maxLength={20} />
          <F label="Email" name="email" type="email" err={errors.email} maxLength={255} />
          <label className="block">
            <span className="mb-1 block text-xs font-semibold">County</span>
            <select name="county" required className="w-full rounded-md border px-3 py-2 text-sm">
              <option value="">Select county</option>
              {counties.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.county && <span className="mt-1 block text-xs text-destructive">{errors.county}</span>}
          </label>
          <F label="Town / location" name="town" err={errors.town} maxLength={120} />
          <F label="Password" name="password" type="password" err={errors.password} maxLength={128} />
          <F label="Confirm password" name="confirm" type="password" err={errors.confirm} maxLength={128} />

          {error && <p className="sm:col-span-2 text-xs text-destructive">{error}</p>}

          <button disabled={busy} className="sm:col-span-2 w-full rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {busy ? "Creating account…" : "Create Account"}
          </button>

          <p className="sm:col-span-2 text-center text-sm">
            Already have an account? <Link to="/sign-in" className="font-semibold text-brand-blue hover:underline">Sign In</Link>
          </p>
        </form>
      </section>
      <Footer />
    </div>
  );
}

function F({ label, name, err, type = "text", maxLength }: { label: string; name: string; err?: string; type?: string; maxLength?: number }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold">{label}</span>
      <input name={name} type={type} required maxLength={maxLength} className="w-full rounded-md border px-3 py-2 text-sm" />
      {err && <span className="mt-1 block text-xs text-destructive">{err}</span>}
    </label>
  );
}
