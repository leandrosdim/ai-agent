"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

export default function APIToolPage() {
  const [input, setInput] = useState("");
  const listRef = useRef(null);

  const { messages, sendMessage, status, error, stop } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/web-search-tool",
    }),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput("");
  };

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, status]);

  const statusLabel = useMemo(() => {
    if (status === "ready") return "Ready";
    if (status === "submitted") return "Processing";
    if (status === "streaming") return "Streaming";
    return "Idle";
  }, [status]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-zinc-900/70 border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto w-full max-w-xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-sky-500/10 border border-blue-500/30">
              🔎
            </span>
            <div>
              <h1 className="text-base font-semibold leading-none">Web Search Agent</h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Ask anything - gets sources, summarizes clearly.
              </p>
            </div>
          </div>

          <span
            className={[
              "text-[11px] px-2 py-1 rounded-md border",
              status === "ready"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                : status === "streaming" || status === "submitted"
                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
                : "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/30",
            ].join(" ")}
            aria-live="polite"
          >
            {statusLabel}
          </span>
        </div>
      </header>

      {/* Messages */}
      <main className="mx-auto w-full max-w-xl flex-1 px-4">
        <div ref={listRef} className="pt-4 pb-[116px] overflow-y-auto">
          {error && (
            <div className="mb-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
              {error.message}
            </div>
          )}

          {messages.map((message) => {
            const isUser = message.role === "user";
            return (
              <div key={message.id} className={`mb-4 flex ${isUser ? "justify-end" : "justify-start"}`}>
                <div
                  className={[
                    "max-w-[85%] rounded-2xl border px-3 py-2 text-sm shadow-sm",
                    isUser
                      ? "bg-blue-500 text-white border-blue-600"
                      : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "mb-1 text-[11px] font-medium",
                      isUser ? "text-white/80" : "text-zinc-500 dark:text-zinc-400",
                    ].join(" ")}
                  >
                    {isUser ? "You" : "AI"}
                  </div>

                  <div className="space-y-2">
                    {(message.parts || []).map((part, index) => {
                      if (part.type === "text") {
                        return (
                          <div
                            key={`${message.id}-${index}`}
                            className={isUser ? "whitespace-pre-wrap" : "whitespace-pre-wrap"}
                          >
                            {part.text}
                          </div>
                        );
                      }

                      if (part.type === "web_search_preview") {
                        const baseCard =
                          "rounded-xl border text-xs px-3 py-2 bg-zinc-900/40 text-zinc-200 border-zinc-700";
                        if (part.state === "input-streaming") {
                          return (
                            <div key={`${message.id}-web-${index}`} className={baseCard}>
                              <div className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-zinc-300 animate-pulse" />
                                <span>Preparing to search...</span>
                              </div>
                            </div>
                          );
                        }
                        if (part.state === "input-available") {
                          return (
                            <div key={`${message.id}-web-${index}`} className={baseCard}>
                              <div className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-300 animate-ping" />
                                <span>Searching the web...</span>
                              </div>
                              {/* Simple progress bar without custom keyframes */}
                              <div className="mt-2 h-1 w-full rounded-full bg-zinc-700 overflow-hidden">
                                <div className="h-1 w-1/2 animate-pulse" />
                              </div>
                            </div>
                          );
                        }
                        if (part.state === "output-available") {
                          return (
                            <div key={`${message.id}-web-${index}`} className={baseCard}>
                              <div className="flex items-center gap-2">
                                <span>✅</span>
                                <span>Web search complete</span>
                              </div>
                            </div>
                          );
                        }
                        if (part.state === "output-error") {
                          return (
                            <div
                              key={`${message.id}-web-${index}`}
                              className="rounded-xl border text-xs px-3 py-2 bg-red-900/30 text-red-200 border-red-700"
                            >
                              <div className="flex items-center gap-2">
                                <span>❌</span>
                                <span>Web search failed: {part.errorText}</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }

                      return null;
                    })}
                  </div>
                </div>
              </div>
            );
          })}

          {(status === "submitted" || status === "streaming") && (
            <div className="mb-4 flex justify-start">
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1 text-xs">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
                <span className="text-zinc-500 dark:text-zinc-400">Thinking...</span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="sticky bottom-0 z-30 border-t border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-zinc-950/70"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto w-full max-w-xl px-4 py-3">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label htmlFor="prompt" className="sr-only">
                Your question
              </label>
              <div className="flex items-center gap-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500/30">
                <input
                  id="prompt"
                  className="min-h-[40px] w-full bg-transparent placeholder:text-zinc-400 focus:outline-none text-sm"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Let me search the web for you..."
                  autoComplete="off"
                />
                {status === "submitted" || status === "streaming" ? (
                  <button
                    type="button"
                    onClick={stop}
                    className="inline-flex items-center gap-1 rounded-xl bg-red-500 px-3 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-red-600 active:translate-y-[1px] focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 disabled:opacity-50"
                  >
                    Stop
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-blue-700 active:translate-y-[1px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Search
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
            <span>Tip: Ask for "sources" or "bullet summary".</span>
            <span className="hidden sm:inline">Mobile-friendly · Dark-mode ready</span>
          </div>
        </div>
      </form>
    </div>
  );
}
