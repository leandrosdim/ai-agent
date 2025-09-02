"use client";

export default function DocsPage() {
  return (
    <main className="min-h-[100dvh] bg-gradient-to-b from-white to-slate-50 text-slate-900 
      dark:from-slate-950 dark:to-slate-950 dark:text-slate-100 flex items-center justify-center px-6">
      <div className="max-w-2xl text-center">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Documentation</h1>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
          This project is a showcase of multiple AI utilities — text, chat, vision, PDF, image generation and more.  
          Each feature is exposed as a route, making it easy to explore and extend.
        </p>
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          Full setup and developer notes are available on{" "}
          <a
            href="https://github.com/leandrosdim/ai-agent"
            target="_blank"
            className="underline hover:text-slate-900 dark:hover:text-white"
          >
            GitHub
          </a>.
        </p>
      </div>
    </main>
  );
}
