"use client";

import React, { useEffect, useRef, useState } from "react";
import { Send, Sparkles, AlertTriangle } from "lucide-react";

type Msg = { role: "user" | "model"; text: string };

const SUGGESTED = [
  "What grows well in my district this season?",
  "Tomato price in my mandi today",
  "Am I eligible for PM-KISAN?",
  "NPK schedule for wheat",
];

export default function ChatPanel({
  initialOpen = false,
  variant = "page",
}: {
  initialOpen?: boolean;
  variant?: "widget" | "page";
}) {
  void initialOpen;
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setError(null);
    setInput("");
    const next: Msg[] = [...messages, { role: "user", text: trimmed }];
    setMessages(next);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: messages.slice(-10),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `chat ${res.status}`);
      setMessages((m) => [...m, { role: "model", text: data.reply ?? "" }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chat failed");
      setMessages((m) => m.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-white ${variant === "page" ? "rounded-2xl border border-stone-200 shadow-sm" : ""}`}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-stone-200">
        <span className="bg-green-100 text-green-700 p-1.5 rounded-full">
          <Sparkles className="w-4 h-4" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-stone-900">AgriBloom Assistant</p>
          <p className="text-xs text-stone-500">Ask about crops, prices, weather, pests</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-stone-600 mb-1">Try asking:</p>
            {SUGGESTED.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-left text-sm bg-stone-50 hover:bg-green-50 hover:text-green-800 text-stone-700 px-3 py-2 rounded-lg border border-stone-200 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                m.role === "user"
                  ? "bg-stone-900 text-white rounded-br-sm"
                  : "bg-stone-100 text-stone-900 rounded-bl-sm"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-stone-100 text-stone-500 px-3.5 py-2.5 rounded-2xl text-sm rounded-bl-sm">
              <span className="inline-flex gap-1">
                <Dot />
                <Dot delay={0.15} />
                <Dot delay={0.3} />
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg p-2.5 flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="border-t border-stone-200 p-3 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything farming…"
          disabled={loading}
          className="flex-1 bg-stone-50 border border-stone-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          aria-label="Send"
          className="bg-green-600 hover:bg-green-700 disabled:bg-stone-300 text-white p-2.5 rounded-full transition-colors flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

function Dot({ delay = 0 }: { delay?: number }) {
  return (
    <span
      className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce"
      style={{ animationDelay: `${delay}s` }}
    />
  );
}
