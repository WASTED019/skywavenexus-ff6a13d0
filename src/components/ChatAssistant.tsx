import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { X, Send, Phone, Linkedin, Twitter, Facebook, Instagram, Youtube, Globe, MessageCircle } from "lucide-react";

import { ASSISTANT_GREETING } from "@/lib/assistant-knowledge";
import { whatsappLink } from "@/lib/whatsapp";
import { useSiteSettings } from "@/lib/cms";

const SOCIAL_META: Record<string, { label: string; icon: typeof Linkedin }> = {
  linkedin: { label: "LinkedIn", icon: Linkedin },
  twitter: { label: "Twitter / X", icon: Twitter },
  x: { label: "Twitter / X", icon: Twitter },
  facebook: { label: "Facebook", icon: Facebook },
  instagram: { label: "Instagram", icon: Instagram },
  youtube: { label: "YouTube", icon: Youtube },
};

function textOf(message: { parts?: Array<{ type: string; text?: string }> }) {
  return (message.parts ?? [])
    .map((p) => (p.type === "text" ? (p.text ?? "") : ""))
    .join("")
    .trim();
}

// Friendly robot mascot avatar (inline SVG so it stays crisp at any size).
export function RobotAvatar({ className = "size-8" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center justify-center overflow-hidden rounded-full bg-brand-bright ${className}`} aria-hidden="true">
      <svg viewBox="0 0 64 64" className="size-full" fill="none">
        {/* antenna */}
        <line x1="32" y1="8" x2="32" y2="14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <circle cx="32" cy="7" r="3.5" fill="currentColor" />
        {/* head */}
        <rect x="12" y="14" width="40" height="32" rx="10" fill="white" />
        {/* eyes */}
        <circle cx="25" cy="29" r="4.5" fill="currentColor" />
        <circle cx="39" cy="29" r="4.5" fill="currentColor" />
        <circle cx="26.3" cy="27.8" r="1.4" fill="white" />
        <circle cx="40.3" cy="27.8" r="1.4" fill="white" />
        {/* smile */}
        <path d="M25 37c2.5 2.8 11.5 2.8 14 0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        {/* ears */}
        <rect x="7" y="26" width="4" height="9" rx="2" fill="currentColor" />
        <rect x="53" y="26" width="4" height="9" rx="2" fill="currentColor" />
      </svg>
    </span>
  );
}

export function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settings = useSiteSettings();
  const socialEntries = Object.entries(settings.social_links ?? {})
    .filter(([, url]) => typeof url === "string" && url.trim().length > 0)
    .slice(0, 5);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const busy = status === "submitted" || status === "streaming";

  // Auto teaser: open briefly on load to show the welcome message, then close.
  useEffect(() => {
    const openTimer = setTimeout(() => {
      setOpen(true);
      autoCloseTimer.current = setTimeout(() => setOpen(false), 5000);
    }, 1500);
    return () => {
      clearTimeout(openTimer);
      if (autoCloseTimer.current) clearTimeout(autoCloseTimer.current);
    };
  }, []);

  const handleOpen = () => {
    if (autoCloseTimer.current) clearTimeout(autoCloseTimer.current);
    setOpen(true);
  };

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!busy) inputRef.current?.focus();
  }, [busy]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const submit = () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    void sendMessage({ text });
  };

  return (
    <>
      {!open && (
        <button
          onClick={handleOpen}
          aria-label="Open SKYWAVE NEXUS Assistant"
          className="fixed bottom-5 left-5 z-50 inline-flex items-center gap-2.5 rounded-full border border-brand-blue/20 bg-background py-2 pl-2 pr-4 shadow-elegant transition hover:brightness-105"
        >
          <RobotAvatar className="size-10" />
          <span className="hidden text-sm font-semibold text-foreground sm:inline">Chat with us</span>
        </button>
      )}

      {open && (
        <div className="fixed inset-x-3 bottom-3 z-50 flex max-h-[85dvh] flex-col overflow-hidden rounded-2xl border bg-background shadow-elegant sm:inset-x-auto sm:left-5 sm:bottom-20 sm:h-[600px] sm:max-h-[80dvh] sm:w-[380px]">
          <div className="flex items-center gap-3 bg-brand-navy px-4 py-3 text-white">
            <RobotAvatar className="size-10 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">SKYWAVE NEXUS Assistant</p>
              <p className="truncate text-xs text-white/75">Your Gateway to Digital Services</p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="rounded p-1 hover:bg-white/10">
              <X className="size-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            <div className="flex items-start gap-2">
              <RobotAvatar className="size-7 shrink-0" />
              <p className="max-w-[85%] rounded-2xl rounded-tl-sm border bg-muted/40 px-3 py-2 text-sm text-foreground">{ASSISTANT_GREETING}</p>
            </div>

            {messages.map((m) => {
              const text = textOf(m as never);
              if (!text) return null;
              return m.role === "user" ? (
                <div key={m.id} className="flex justify-end">
                  <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl bg-brand-blue px-3 py-2 text-sm text-white">
                    {text}
                  </p>
                </div>
              ) : (
                <div key={m.id} className="flex items-start gap-2">
                  <RobotAvatar className="size-7 shrink-0" />
                  <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tl-sm border bg-muted/40 px-3 py-2 text-sm text-foreground">
                    {text}
                  </p>
                </div>
              );
            })}

            {busy && <p className="animate-pulse text-sm text-muted-foreground">Typing…</p>}
            {error && (
              <p className="text-sm text-destructive">
                Sorry, the assistant is unavailable right now. Please call or WhatsApp 0753366995.
              </p>
            )}
          </div>

          <div className="border-t px-3 py-2">
            <div className="mb-2 flex items-center gap-3">
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noreferrer"
                aria-label="Chat with us on WhatsApp"
                title="WhatsApp"
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-blue hover:underline"
              >
                <MessageCircle className="size-3.5" /> WhatsApp
              </a>
              {socialEntries.map(([key, url]) => {
                const meta = SOCIAL_META[key.toLowerCase()] ?? { label: key, icon: Globe };
                const Icon = meta.icon;
                return (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={meta.label}
                    title={meta.label}
                    className="text-muted-foreground transition hover:text-brand-blue"
                  >
                    <Icon className="size-4" />
                  </a>
                );
              })}
            </div>
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                  }
                }}
                placeholder="Type your message…"
                className="max-h-28 flex-1 resize-none rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-blue/40"
              />
              <button
                onClick={submit}
                disabled={busy || !input.trim()}
                aria-label="Send message"
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-blue text-white disabled:opacity-50"
              >
                <Send className="size-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
