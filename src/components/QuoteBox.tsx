import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type QuoteInfo = {
  ref: string;
  quote_amount: number | null;
  quote_currency: string | null;
  quote_accepted_at: string | null;
};

/** Shows a quote and lets the client accept it. `contact` is required when not signed in. */
export function QuoteBox({ q, contact, onAccepted }: { q: QuoteInfo; contact?: string; onAccepted?: (at: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [acceptedAt, setAcceptedAt] = useState(q.quote_accepted_at);
  if (q.quote_amount == null) return null;
  const amount = `${q.quote_currency || "KES"} ${Number(q.quote_amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

  const accept = async () => {
    if (!confirm(`Accept the quote of ${amount} for request ${q.ref}?`)) return;
    setBusy(true); setErr("");
    const { error } = await supabase.rpc("accept_quote", { _ref: q.ref, _contact: contact ?? undefined });
    setBusy(false);
    if (error) { setErr("Could not accept the quote. Please try again or contact us."); return; }
    const at = new Date().toISOString();
    setAcceptedAt(at); onAccepted?.(at);
  };

  return (
    <div className="rounded-xl border border-brand-blue/30 bg-brand-blue/5 p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">Your quotation</div>
      <div className="mt-1 text-xl font-bold text-brand-navy">{amount}</div>
      {acceptedAt ? (
        <p className="mt-2 text-sm font-semibold text-brand-green">Accepted on {new Date(acceptedAt).toLocaleDateString()} — our team will be in touch to schedule the work.</p>
      ) : (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button onClick={accept} disabled={busy} className="rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {busy ? "Accepting…" : "Accept Quote"}
          </button>
          <span className="text-xs text-muted-foreground">Questions first? Reply via WhatsApp or call us.</span>
        </div>
      )}
      {err && <p className="mt-2 text-xs text-destructive">{err}</p>}
    </div>
  );
}
