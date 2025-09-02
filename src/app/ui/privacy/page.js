"use client";

export default function PrivacyPage() {
  return (
    <main className="min-h-[100dvh] bg-gradient-to-b from-white to-slate-50 text-slate-900 
      dark:from-slate-950 dark:to-slate-950 dark:text-slate-100 flex items-center justify-center px-6">
      <div className="max-w-2xl text-center">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Privacy Policy</h1>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
          This project does not collect or store personal data.  
          Any inputs you provide are only used to generate responses from the AI models.  
          Please avoid sharing sensitive information while using the utilities.
        </p>
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          For more details, check the{" "}
          <a
            href="https://github.com/leandrosdim/ai-agent"
            target="_blank"
            className="underline hover:text-slate-900 dark:hover:text-white"
          >
            GitHub repository
          </a>.
        </p>
      </div>
    </main>
  );
}
