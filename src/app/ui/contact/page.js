"use client";

export default function ContactPage() {
  return (
    <main className="min-h-[100dvh] bg-gradient-to-b from-white to-slate-50 text-slate-900 
      dark:from-slate-950 dark:to-slate-950 dark:text-slate-100 flex items-center justify-center px-6">
      <div className="max-w-2xl text-center">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Contact</h1>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
          This project is experimental and open-source.  
          If you’d like to reach out, feel free to connect through{" "}
          <a
            href="https://github.com/leandrosdim"
            target="_blank"
            className="underline hover:text-slate-900 dark:hover:text-white"
          >
            GitHub
          </a>{" "}
          or send me an email at{" "}
          <a
            href="mailto:leandrosdim777@gmail.com"
            className="underline hover:text-slate-900 dark:hover:text-white"
          >
            leandrosdim777@gmail.com
          </a>.
        </p>
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          Future versions may include a proper contact form or support page.
        </p>
      </div>
    </main>
  );
}
