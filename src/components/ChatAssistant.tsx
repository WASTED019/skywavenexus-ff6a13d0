import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { MessageCircle, X, Send, Phone } from "lucide-react";

import { ASSISTANT_GREETING } from "@/lib/assistant-knowledge";
import { whatsappLink } from "@/lib/whatsapp";

function textOf(message: { parts?: Array<{ type: string; text?: string }> }) {
  return (message.parts ?? [])
    .map((p) => (p.type === "text" ? (p.text ?? "") : ""))
    .join("")
    .trim();
}

export function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const busy = status === "submitted" || status === "streaming";

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
          onClick={() => setOpen(true)}
          aria-label="Open SKYWAVE NEXUS Assistant"
          className="fixed top-20 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-brand-blue px-4 py-3 text-sm font-semibold text-white shadow-elegant transition hover:brightness-110"
        >
          <MessageCircle className="size-5" />
          <span className="hidden sm:inline">Chat with us</span>
        </button>
      )}

      {open && (
        <div className="fixed inset-x-3 bottom-3 z-50 flex max-h-[85dvh] flex-col overflow-hidden rounded-2xl border bg-background shadow-elegant sm:inset-x-auto sm:right-5 sm:bottom-5 sm:h-[600px] sm:max-h-[85dvh] sm:w-[380px]">
          <div className="flex items-start justify-between gap-2 bg-brand-navy px-4 py-3 text-white">
            <div>
              <p className="text-sm font-bold">SKYWAVE NEXUS Assistant</p>
              <p className="text-xs text-white/75">Your Gateway to Digital Services</p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="rounded p-1 hover:bg-white/10">
              <X className="size-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            <p className="text-sm text-foreground">{ASSISTANT_GREETING}</p>

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
                <p key={m.id} className="whitespace-pre-wrap text-sm text-foreground">
                  {text}
                </p>
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
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noreferrer"
              className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-blue hover:underline"
            >
              <Phone className="size-3.5" /> Continue on WhatsApp
            </a>
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
