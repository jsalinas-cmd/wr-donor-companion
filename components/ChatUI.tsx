"use client";

import { useEffect, useRef, useState } from "react";
import { SUGGESTED_QUESTIONS } from "@/lib/wr-knowledge";

type Message = { role: "user" | "assistant"; content: string };

const OPENING: Message = {
  role: "assistant",
  content:
    "Welcome. I'm the AI Decision Companion for World Relief. For 80 years, across 100 countries, we've partnered with local churches and communities to build a world where families thrive and communities flourish. I'm here to help you understand where we serve, what's happening in those places right now, and how your giving is being used. What would you like to know?",
};

export default function ChatUI({ onLock }: { onLock: () => void }) {
  const [messages, setMessages] = useState<Message[]>([OPENING]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || sending) return;

    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setInput("");
    setSending(true);

    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });

      if (!res.ok || !res.body) {
        const err = await res.text().catch(() => "");
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = {
            role: "assistant",
            content: `Sorry, I hit an error reaching the companion service. ${err ? `(${err})` : ""}`.trim(),
          };
          return copy;
        });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          role: "assistant",
          content: `Sorry, something interrupted that response. (${msg})`,
        };
        return copy;
      });
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header — wordmark lockup per brand */}
      <header className="border-b border-[var(--color-wr-gray-10)] bg-white">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className="text-[var(--color-wr-gray-70)] text-xl font-light tracking-tight lowercase"
              style={{ letterSpacing: "-0.01em" }}
            >
              world relief
            </span>
            <WRMark className="w-5 h-5" />
            <div className="ml-4 pl-4 border-l border-[var(--color-wr-gray-10)]">
              <div className="text-[10px] uppercase tracking-[0.15em] text-[var(--color-wr-blue)] font-semibold">
                AI Decision Companion
              </div>
            </div>
          </div>
          <button
            onClick={onLock}
            className="text-xs text-[var(--color-wr-gray-50)] hover:text-[var(--color-wr-blue)] transition uppercase tracking-wider font-semibold"
          >
            Lock
          </button>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} fade-up`}>
              <div
                className={
                  m.role === "user"
                    ? "max-w-[80%] px-5 py-3 rounded-sm bg-[var(--color-wr-blue)] text-white"
                    : "max-w-[85%] px-5 py-4 rounded-sm bg-white border border-[var(--color-wr-gray-10)] text-[var(--color-wr-gray-80)] leading-relaxed"
                }
              >
                {m.content ? (
                  <div className="whitespace-pre-wrap text-[15px]">
                    {renderRichText(m.content, m.role === "user")}
                  </div>
                ) : (
                  <div className="flex gap-1.5 py-1">
                    <span className="typing-dot w-2 h-2 rounded-full bg-[var(--color-wr-blue)]"></span>
                    <span className="typing-dot w-2 h-2 rounded-full bg-[var(--color-wr-blue)]"></span>
                    <span className="typing-dot w-2 h-2 rounded-full bg-[var(--color-wr-blue)]"></span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {messages.length === 1 && (
            <div className="pt-2 fade-up">
              <div className="text-[11px] uppercase tracking-[0.15em] text-[var(--color-wr-gray-50)] font-semibold mb-4">
                A few places to start
              </div>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="text-sm px-4 py-2 rounded-sm bg-white border border-[var(--color-wr-gray-10)] text-[var(--color-wr-gray-80)] hover:border-[var(--color-wr-blue)] hover:text-[var(--color-wr-blue)] transition"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Composer */}
      <div className="border-t border-[var(--color-wr-gray-10)] bg-white">
        <div className="max-w-3xl mx-auto px-6 py-5">
          <div className="flex items-end gap-3 bg-white rounded-sm border border-[var(--color-wr-gray-10)] focus-within:border-[var(--color-wr-blue)] focus-within:ring-2 focus-within:ring-[var(--color-wr-blue)]/20 transition p-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
              placeholder="Ask about our work, the places we serve, or current needs..."
              className="flex-1 resize-none bg-transparent px-3 py-2 focus:outline-none text-[15px] text-[var(--color-wr-gray-80)] max-h-40 placeholder:text-[var(--color-wr-gray-50)]"
              disabled={sending}
            />
            <button
              onClick={() => send(input)}
              disabled={sending || !input.trim()}
              className="px-5 py-2 rounded-sm bg-[var(--color-wr-blue)] text-white text-sm font-semibold uppercase tracking-wide hover:brightness-95 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
          <div className="text-[11px] text-[var(--color-wr-gray-50)] mt-3 text-center tracking-wide">
            Private preview. Donor-initiated guidance. Not for external distribution.
          </div>
        </div>
      </div>
    </div>
  );
}

function renderRichText(text: string, onDark: boolean): React.ReactNode {
  // Handles (in priority order):
  //   **[label](url)**  -> button-pill link (bold link)
  //   [label](url)      -> inline styled link
  //   **bold**          -> <strong>
  //   https://...       -> auto-linked URL (stripped to hostname for display)
  const boldLink = /\*\*\[([^\]]+)\]\(([^)]+)\)\*\*/;
  const mdLink = /\[([^\]]+)\]\(([^)]+)\)/;
  const bold = /\*\*([^*]+?)\*\*/;
  const rawUrl = /(https?:\/\/[^\s)\]]+)/;

  type Match = { index: number; length: number; node: React.ReactNode };
  const inlineLinkClass = onDark
    ? "underline decoration-white/70 underline-offset-2 hover:decoration-white font-medium"
    : "text-[var(--color-wr-blue)] underline decoration-[var(--color-wr-blue)]/40 underline-offset-2 hover:decoration-[var(--color-wr-blue)] font-medium";

  const pillClass =
    "inline-flex items-center gap-1.5 my-0.5 px-3.5 py-1.5 rounded-full bg-[var(--color-wr-blue)] text-white text-[13px] font-semibold no-underline hover:brightness-95 transition align-baseline";
  const pillClassOnDark =
    "inline-flex items-center gap-1.5 my-0.5 px-3.5 py-1.5 rounded-full bg-white text-[var(--color-wr-blue)] text-[13px] font-semibold no-underline hover:brightness-95 transition align-baseline";

  const nodes: React.ReactNode[] = [];
  let key = 0;
  let cursor = 0;

  while (cursor < text.length) {
    const slice = text.slice(cursor);

    const candidates: Match[] = [];

    const bl = slice.match(boldLink);
    if (bl && bl.index !== undefined) {
      candidates.push({
        index: bl.index,
        length: bl[0].length,
        node: (
          <a
            key={key++}
            href={bl[2]}
            target="_blank"
            rel="noopener noreferrer"
            className={onDark ? pillClassOnDark : pillClass}
          >
            {bl[1]}
            <svg viewBox="0 0 16 16" className="w-3 h-3" fill="currentColor" aria-hidden="true">
              <path d="M6 2v2h4.586l-7.293 7.293 1.414 1.414L12 5.414V10h2V2H6z" />
            </svg>
          </a>
        ),
      });
    }

    const ml = slice.match(mdLink);
    if (ml && ml.index !== undefined) {
      candidates.push({
        index: ml.index,
        length: ml[0].length,
        node: (
          <a
            key={key++}
            href={ml[2]}
            target="_blank"
            rel="noopener noreferrer"
            className={inlineLinkClass}
          >
            {ml[1]}
          </a>
        ),
      });
    }

    const b = slice.match(bold);
    if (b && b.index !== undefined) {
      candidates.push({
        index: b.index,
        length: b[0].length,
        node: <strong key={key++}>{b[1]}</strong>,
      });
    }

    const r = slice.match(rawUrl);
    if (r && r.index !== undefined) {
      const display = r[1].replace(/^https?:\/\//, "").replace(/\/$/, "");
      candidates.push({
        index: r.index,
        length: r[1].length,
        node: (
          <a
            key={key++}
            href={r[1]}
            target="_blank"
            rel="noopener noreferrer"
            className={inlineLinkClass}
          >
            {display}
          </a>
        ),
      });
    }

    if (candidates.length === 0) {
      nodes.push(slice);
      break;
    }

    // Pick the earliest-starting match; on tie, longest (so bold-link beats md-link beats bold).
    candidates.sort((a, b) => (a.index - b.index) || (b.length - a.length));
    const winner = candidates[0];

    if (winner.index > 0) nodes.push(slice.slice(0, winner.index));
    nodes.push(winner.node);
    cursor += winner.index + winner.length;
  }

  return nodes;
}

function WRMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <g fill="#009DDC">
        <rect x="17" y="2"  width="2" height="5" />
        <rect x="20" y="2"  width="2" height="5" />
        <rect x="18" y="8"  width="4" height="1.5" />
        <rect x="33" y="17" width="5" height="2" />
        <rect x="33" y="20" width="5" height="2" />
        <rect x="30" y="18" width="1.5" height="4" />
        <rect x="17" y="33" width="2" height="5" />
        <rect x="20" y="33" width="2" height="5" />
        <rect x="18" y="30" width="4" height="1.5" />
        <rect x="2" y="17"  width="5" height="2" />
        <rect x="2" y="20"  width="5" height="2" />
        <rect x="8" y="18"  width="1.5" height="4" />
        <rect x="15" y="15" width="10" height="2" />
        <rect x="15" y="18" width="10" height="2" />
        <rect x="15" y="21" width="10" height="2" />
        <rect x="17" y="13" width="2" height="14" />
        <rect x="20" y="13" width="2" height="14" />
      </g>
    </svg>
  );
}
