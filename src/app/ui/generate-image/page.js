"use client";

import { useState, useMemo, useRef } from "react";
import Image from "next/image";

export default function ImageStudio() {
  const [prompt, setPrompt] = useState("");
  const [imageSrc, setImageSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]); // { src, prompt, ts }
  const [size, setSize] = useState("1024x1024");
  const [style, setStyle] = useState("vivid");

  const mainRef = useRef(null);

  const charCount = prompt.length;
  const canSubmit = prompt.trim().length >= 4 && !isLoading;

  const suggestionChips = useMemo(
    () => [
      "soft natural light",
      "cozy room, pastel palette",
      "ultra wide golden hour",
      "vintage film look, grain, 35mm",
    ],
    []
  );

  const chooseChip = (t) => {
    setPrompt((p) => (p ? `${p} ${t}` : t));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, size, style }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Generation failed");
      const src = `data:image/png;base64,${data.image}`;
      setImageSrc(src);
      setHistory((h) => [{ src, prompt, ts: Date.now() }, ...h].slice(0, 12));
      // optional: scroll result into view on mobile
      setTimeout(() => {
        mainRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    } catch (err) {
      setError(err.message || "Error generating image");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!imageSrc) return;
    const link = document.createElement("a");
    link.href = imageSrc;
    link.download = `image-${Date.now()}.png`;
    link.click();
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
    } catch {}
  };

  const handleRegenerate = async () => {
    if (!prompt) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, size, style }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Generation failed");
      const src = `data:image/png;base64,${data.image}`;
      setImageSrc(src);
      setHistory((h) => [{ src, prompt, ts: Date.now() }, ...h].slice(0, 12));
    } catch (err) {
      setError(err.message || "Error generating image");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-zinc-200/70 dark:border-zinc-800/70 bg-white/80 dark:bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto max-w-md px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-bold shadow-sm">
              AI
            </span>
            <h1 className="text-base font-semibold tracking-tight">Image Studio</h1>
          </div>
          <div className="text-xs text-zinc-500 hidden sm:block">
            mobile-first • fast • clean
          </div>
        </div>
      </header>

      {/* Error toast */}
      {error && (
        <div className="mx-auto max-w-md px-4 pt-3">
          <div className="rounded-xl border border-red-300/60 bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-200 dark:border-red-900 px-3 py-2 text-sm flex items-start justify-between gap-3">
            <div className="flex-1">
              <strong className="font-medium">Oops.</strong> {error}
            </div>
            <button
              onClick={() => setError(null)}
              className="shrink-0 rounded-md px-2 py-1 text-xs hover:bg-red-100/70 dark:hover:bg-red-900/30"
              aria-label="Dismiss error"
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Form */}
      <main className="mx-auto max-w-md px-4 pb-24">
        <form
          onSubmit={handleSubmit}
          className="mt-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60 shadow-sm"
        >
          <div className="p-4">
            <label htmlFor="prompt" className="block text-sm font-medium mb-2">
              Describe your image
            </label>

            {/* Textarea with floating affordances */}
            <div className="relative">
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A cozy isometric bedroom with plants, soft morning light, pastel colors"
                rows={4}
                className="w-full resize-none rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/70 px-3 py-3 pr-12 text-sm leading-5 outline-none ring-0 focus:border-blue-500"
                aria-describedby="prompt-hint"
              />
              <div className="pointer-events-none absolute right-2 bottom-2 text-xs text-zinc-500">
                {charCount}/800
              </div>
            </div>

            {/* Suggestions */}
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestionChips.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => chooseChip(s)}
                  className="rounded-full border border-zinc-300 dark:border-zinc-700 bg-zinc-100/70 dark:bg-zinc-800/70 px-3 py-1 text-xs hover:bg-zinc-200/70 dark:hover:bg-zinc-700/70 transition"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Controls */}
                      <div className="mt-4 grid grid-cols-2 gap-3">
                          {/* Aspect Ratio */}
                          <div className="flex flex-col">
                              <label className="text-xs mb-1">Aspect Ratio</label>
                              <div className="flex flex-col gap-2">
                                  {[
                                      { label: "Square", value: "1024x1024", icon: "▢" },
                                      { label: "Portrait", value: "1024x1792", icon: "▯" },
                                      { label: "Landscape", value: "1792x1024", icon: "▭" },
                                  ].map((opt) => (
                                      <button
                                          key={opt.value}
                                          type="button"
                                          onClick={() => setSize(opt.value)}
                                          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition ${size === opt.value
                                                  ? "bg-blue-600 text-white shadow-sm"
                                                  : "border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                              }`}
                                      >
                                          <span>{opt.icon}</span>
                                          {opt.label}
                                      </button>
                                  ))}
                              </div>
                          </div>


                          <div className="flex flex-col">
                              <label className="text-xs mb-1">Style</label>
                              <select
                                  value={style}
                                  onChange={(e) => setStyle(e.target.value)}
                                  className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/70 px-3 py-2 text-sm"
                              >
                                  <option value="vivid">Vivid</option>
                                  <option value="natural">Natural</option>
                              </select>
                          </div>
                      </div>

            {/* Submit */}
            <div className="mt-4 flex gap-2">
              <button
                type="submit"
                disabled={!canSubmit}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-white px-4 py-2.5 text-sm font-medium shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      ></path>
                    </svg>
                    Generating…
                  </>
                ) : (
                  "Generate"
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPrompt("");
                }}
                className="rounded-xl border border-zinc-300 dark:border-zinc-700 px-4 py-2.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                title="Clear prompt"
              >
                Clear
              </button>
            </div>

            <p id="prompt-hint" className="mt-2 text-xs text-zinc-500">
              Be specific: subject, mood, lighting, lens/style, background, and any constraints (e.g., color palette).
            </p>
          </div>
        </form>

        {/* Result */}
        <section ref={mainRef} className="mt-5">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60 shadow-sm overflow-hidden">
            <div className="p-4 flex items-center justify-between">
              <h2 className="text-sm font-medium">Result</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleRegenerate}
                  disabled={isLoading || !prompt}
                  className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50"
                >
                  Regenerate
                </button>
                <button
                  onClick={handleCopyPrompt}
                  className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Copy prompt
                </button>
                <button
                  onClick={handleDownload}
                  disabled={!imageSrc}
                  className="rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-3 py-1.5 text-xs hover:opacity-90 disabled:opacity-50"
                >
                  Download
                </button>
              </div>
            </div>

            {/* Image stage (square, responsive) */}
            <div className="relative w-full aspect-square bg-zinc-100 dark:bg-zinc-800">
              {isLoading && (
                <div className="absolute inset-0 animate-pulse bg-gradient-to-b from-zinc-200 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900" />
              )}
              {!isLoading && imageSrc && (
                <Image
                  alt="Generated"
                  src={imageSrc}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 512px"
                  priority
                />
              )}
              {!isLoading && !imageSrc && (
                <div className="absolute inset-0 grid place-items-center text-center px-6">
                  <div className="text-sm text-zinc-500">
                    Your image will appear here. Try one of the suggestions above to get started.
                  </div>
                </div>
              )}
            </div>

            {/* Prompt recap */}
            {prompt && (
              <div className="px-4 py-3 border-t border-zinc-200 dark:border-zinc-800">
                <div className="text-xs text-zinc-500">
                  Prompt:&nbsp;
                  <span className="text-zinc-800 dark:text-zinc-200">{prompt}</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* History strip */}
        {history.length > 0 && (
          <section className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Recent</h3>
              <button
                className="text-xs text-zinc-500 hover:underline"
                onClick={() => setHistory([])}
              >
                Clear
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {history.map((h, i) => (
                <button
                  key={h.ts}
                  onClick={() => setImageSrc(h.src)}
                  title={h.prompt}
                  className="relative shrink-0 h-20 w-20 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 hover:ring-2 hover:ring-blue-500"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={h.src}
                    alt={`History ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Bottom safe-area spacer for iOS */}
      <div className="h-6" />
    </div>
  );
}
