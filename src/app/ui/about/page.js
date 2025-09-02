"use client";

export default function AboutPage() {
  return (
    <main className="min-h-[100dvh] bg-gradient-to-b from-white to-slate-50 text-slate-900 
      dark:from-slate-950 dark:to-slate-950 dark:text-slate-100 flex items-center justify-center px-6">
      <div className="max-w-2xl text-center">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">About AI Super Agent</h1>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
          Hi 👋 I’m a developer building this project as a collection of AI utilities.  
          It’s meant as a personal playground and for showcasing on GitHub.  
          Here you can explore text generation, chat, image creation, PDF analysis and more — all in one unified interface.
        </p>
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          This project is open-source and evolving.  
          Check it out on{" "}
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
