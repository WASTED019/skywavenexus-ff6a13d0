import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "Track a Request — SKYWAVE NEXUS" },
      { name: "description", content: "Look up the status of a SKYWAVE NEXUS service request using your reference number and contact." },
      { property: "og:title", content: "Track a Request — SKYWAVE NEXUS" },
      { property: "og:description", content: "Look up the status of a SKYWAVE NEXUS service request using your reference number and contact." },
      { property: "og:url", content: "https://skywavenexus.lovable.app/track" },
    ],
    links: [
      { rel: "canonical", href: "https://skywavenexus.lovable.app/track" },
    ],
  }),
  component: TrackPage,
});

type Result = {
  ref: string;
  status: string;
  division_name: string;
  service_name: string;
  created_at: string;
  admin_feedback: string | null;
};

function TrackPage() {
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(""); setResult(null);
    const fd = new FormData(e.currentTarget);
    const ref = String(fd.get("ref") || "").trim();
    const contact = String(fd.get("contact") || "").trim();
    if (!ref || !contact) { setError("Reference and email/phone are required."); return; }
    setBusy(true);
    const { data, error: err } = await supabase.rpc("track_request", { _ref: ref, _contact: contact });
    setBusy(false);
    if (err) { setError(err.message); return; }
    const row = Array.isArray(data) ? data[0] : null;
    if (!row) { setError("No request matches that reference and contact."); return; }
    setResult(row as Result);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <section className="mx-auto w-full max-w-2xl px-4 py-16">
        <h1 className="text-2xl font-bold">Track your request</h1>
        <p className="mt-2 text-sm text-muted-foreground">Enter your request reference and the email or phone number you used.</p>

        <form onSubmit={onSubmit} className="mt-6 grid gap-4 rounded-2xl border bg-card p-6 shadow-soft">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold">Reference number</span>
            <input name="ref" required maxLength={40} placeholder="SWN-XXXX" className="w-full rounded-md border px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold">Email or phone used</span>
            <input name="contact" required maxLength={255} className="w-full rounded-md border px-3 py-2 text-sm" />
          </label>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <button disabled={busy} className="rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {busy ? "Looking up…" : "Track"}
          </button>
        </form>

        {result && (
          <div className="mt-8 rounded-2xl border bg-card p-6 shadow-soft">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Reference</div>
            <div className="font-mono text-lg font-bold text-brand-navy">{result.ref}</div>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-xs uppercase text-muted-foreground">Status</dt><dd className="font-semibold">{result.status}</dd></div>
              <div><dt className="text-xs uppercase text-muted-foreground">Date submitted</dt><dd>{new Date(result.created_at).toLocaleString()}</dd></div>
              <div><dt className="text-xs uppercase text-muted-foreground">Division</dt><dd>{result.division_name}</dd></div>
              <div><dt className="text-xs uppercase text-muted-foreground">Service</dt><dd>{result.service_name}</dd></div>
            </dl>
            <div className="mt-4">
              <div className="text-xs uppercase text-muted-foreground">Admin feedback</div>
              <p className="mt-1 whitespace-pre-wrap text-sm">{result.admin_feedback || "No feedback yet."}</p>
            </div>
          </div>
        )}

        <Link to="/" className="mt-6 inline-block text-sm text-muted-foreground hover:text-foreground">← Back to home</Link>
      </section>
      <Footer />
    </div>
  );
}
