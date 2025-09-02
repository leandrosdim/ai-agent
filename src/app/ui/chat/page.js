"use client"

import { useState,useRef,useEffect } from "react";
import { useChat } from "@ai-sdk/react";


export default function ChatBot() {

    const [input, setInput] = useState("");
    const { messages, sendMessage, stop, status,error } = useChat();

    const scrollerRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        sendMessage({ text: input });
        setInput("");
    };

    // Auto-scroll to the latest message
    useEffect(() => {
        const el = scrollerRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [messages, status]);



    return (
        <div className="flex min-h-dvh flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-zinc-200/70 bg-zinc-50/70 backdrop-blur-md dark:border-zinc-800/60 dark:bg-zinc-950/70">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <h1 className="text-base font-semibold tracking-tight">Chat</h1>
          <span
            className={`text-xs font-medium rounded-full px-2 py-1 ${
              status === "ready"
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
            }`}
          >
            {status === "ready" ? "Ready" : status}
          </span>
        </div>
      </header>

      {/* Messages */}
      <main
        ref={scrollerRef}
        className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-3 overflow-y-auto px-4 py-4 pb-28" // pb-28 keeps space for input bar
      >
        {error && (
          <div className="mx-auto w-full max-w-sm rounded-xl border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-800/50 dark:bg-red-900/20 dark:text-red-300">
            {error.message}
          </div>
        )}

        {messages.map((message) => {
          const isUser = message.role === "user";
          return (
            <div
              key={message.id}
              className={`flex w-full items-end gap-2 ${
                isUser ? "justify-end" : "justify-start"
              }`}
            >
              {/* Avatar (hide on very small screens for space) */}
              {!isUser && (
                <div className="hidden size-7 shrink-0 select-none items-center justify-center rounded-full bg-zinc-200 text-xs font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 sm:flex">
                  A
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm ${
                  isUser
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : "bg-white text-zinc-900 rounded-bl-sm dark:bg-zinc-900 dark:text-zinc-100 border border-zinc-200/70 dark:border-zinc-800/60"
                }`}
              >
                {message.parts.map((part, i) => {
                  if (part.type !== "text") return null;
                  return (
                    <p key={`${message.id}-${i}`} className="whitespace-pre-wrap">
                      {part.text}
                    </p>
                  );
                })}
              </div>

              {isUser && (
                <div className="hidden size-7 shrink-0 select-none items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white sm:flex">
                  U
                </div>
              )}
            </div>
          );
        })}

        {(status === "submitted" || status === "streaming") && (
          <div className="flex items-center gap-2">
            <div className="size-7 shrink-0 rounded-full bg-zinc-200 dark:bg-zinc-800 sm:flex hidden items-center justify-center text-xs font-bold text-zinc-700 dark:text-zinc-200">
              A
            </div>
            <div className="max-w-[70%] rounded-2xl rounded-bl-sm border border-zinc-200/70 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm dark:border-zinc-800/60 dark:bg-zinc-900 dark:text-zinc-200">
              <span className="inline-flex items-center gap-1.5">
                <span className="sr-only">Assistant is typing</span>
                <span className="h-1 w-1 animate-bounce rounded-full bg-current [animation-delay:-0.2s]" />
                <span className="h-1 w-1 animate-bounce rounded-full bg-current" />
                <span className="h-1 w-1 animate-bounce rounded-full bg-current [animation-delay:0.2s]" />
              </span>
            </div>
          </div>
        )}
      </main>

      {/* Input Bar */}
      <form
        onSubmit={handleSubmit}
        className="fixed bottom-0 left-0 right-0 z-20 border-t border-zinc-200/70 bg-zinc-50/95 backdrop-blur-md dark:border-zinc-800/60 dark:bg-zinc-950/90"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto flex w-full max-w-2xl items-center gap-2 px-4 py-3">
          <div className="relative flex-1">
            <input
              className="h-12 w-full rounded-full border border-zinc-300 bg-white pl-4 pr-24 text-sm text-zinc-900 outline-none ring-0 placeholder:text-zinc-400 focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-blue-500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the assistant"
              aria-label="Message"
              autoComplete="off"
            />

            {/* Action button (Send / Stop) */}
            {status === "submitted" || status === "streaming" ? (
              <button
                type="button"
                onClick={stop}
                className="absolute right-1 top-1 inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-medium text-white transition focus:outline-none focus:ring-2 focus:ring-red-500/40 disabled:opacity-50 disabled:cursor-not-allowed bg-red-600 hover:bg-red-700"
              >
                Stop
              </button>
            ) : (
              <button
                type="submit"
                className="absolute right-1 top-1 inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-medium text-white transition focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700"
                disabled={status !== "ready"}
              >
                Send
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
    )

}