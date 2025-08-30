"use client";

import { useMemo, useState } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { projectSchema } from "@/app/api/goal-achievment/schema";

export default function ProjectManagement() {


  const [projectName, setProjectName] = useState('');
  const [expandedMap, setExpandedMap] = useState({}); // { [index]: true|false }
  const [isOpen, setIsOpen] = useState(false);




  const toggleExpanded = (idx) =>
    setExpandedMap((m) => ({ ...m, [idx]: !m[idx] }));

  const { submit, object, isLoading, error, stop } = useObject({
    api: "/api/goal-achievment",
    schema: projectSchema
  })

  //function for formating the hours. Sometimes the AI responses with h at the end and sometimes not because the schema expects string there. 
  function formatHours(hoursStr) {
    if (!hoursStr) return "";
    const n = parseFloat(hoursStr);
    if (Number.isNaN(n)) return hoursStr; // fallback if it's weird
    return `${n}h`;
  }


  const handleSubmit = (e) => {
    e.preventDefault();
    submit({ project: projectName });
    setProjectName('');
  }

  // Safely compute total hours (schema provides hours as string)
  const totalHours = useMemo(() => {
    const items = object?.project?.tasks ?? [];
    return items.reduce((sum, t) => {
      const n = parseFloat(t?.hours ?? "0");
      return sum + (Number.isFinite(n) ? n : 0);
    }, 0);
  }, [object]);

  return (
    <div className="min-h-dvh bg-gradient-to-b from-white to-slate-50 text-slate-900 dark:from-slate-900 dark:to-slate-950 dark:text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200/60 bg-white/80 backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/80">
        <div className="mx-auto max-w-screen-md px-4 py-4">
          <h1 className="text-xl font-semibold tracking-tight">Goal Achiever</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Generate a project plan with tasks and estimated hours.
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-screen-md px-4 py-6 space-y-6">
        {/* Form Card */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <form onSubmit={handleSubmit} className="space-y-3">
            <label htmlFor="project" className="block text-sm font-medium">
              Project / Goal
            </label>
            <div className="flex items-stretch gap-2">
              <div className="relative flex-1">
                <input
                  id="project"
                  placeholder="e.g. Build a Next.js AI assistant"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm outline-none ring-0 transition focus:border-sky-500 dark:border-slate-700 dark:bg-slate-950"
                />
                {/* inline icon */}
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  🔎
                </span>
              </div>

              {isLoading ? (
                <button
                  type="button"
                  onClick={stop}
                  className="inline-flex items-center justify-center rounded-xl bg-rose-600 px-4 text-sm font-medium text-white transition hover:bg-rose-700 disabled:opacity-50"
                >
                  Stop
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!projectName.trim()}
                  className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-4 text-sm font-medium text-white transition hover:bg-sky-700 disabled:opacity-50"
                >
                  Generate
                </button>
              )}
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="mt-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300"
              >
                {error.message}
              </div>
            )}

            {/* Subtle hint */}
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tip: Be specific—include scope, tech stack, or deadline.
            </p>
          </form>
        </section>

        {/* Loading state */}
        {isLoading && (
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-sky-600 dark:border-slate-700 dark:border-t-sky-400" />
              <p className="text-sm text-slate-600 dark:text-slate-300">Generating plan…</p>
            </div>
          </section>
        )}

        {/* Results */}
        {object?.project && (
          <section className="space-y-4">
            {/* Project Header Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold leading-tight">
                    {object.project.name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Generated project plan
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:text-slate-300">
                    Tasks: {object.project.tasks?.length ?? 0}
                  </span>
                  <span className="rounded-full bg-sky-600/10 px-3 py-1 text-xs font-semibold text-sky-700 ring-1 ring-inset ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-400/20">
                    Total: {totalHours.toFixed(1)}h
                  </span>
                </div>
              </div>
            </div>

            {/* Task List */}
            {/* Task List */}
            {object.project.tasks?.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="px-1 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Tasks
                </h3>
                <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                  {object.project.tasks.map((t, idx) => {
                    const isOpen = !!expandedMap[idx];
                    return (
                      <li key={`${t.task}-${t.hours}-${idx}`} className="px-1 py-3">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 text-lg leading-none">•</div>

                          <div className="flex-1">
                            <p className="text-sm font-medium">{t.task}</p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                              Estimated: <span className="font-semibold">{formatHours(t.hours)}</span> 
                            </p>
                          </div>

                          {/* Hours badge + expand button */}
                          <div className="flex items-center gap-2">
                            <span className="shrink-0 rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                              {formatHours(t.hours)}
                            </span>
                            {t.details && (
                              <button
                                type="button"
                                onClick={() => toggleExpanded(idx)}
                                className="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                                aria-expanded={isOpen}
                                aria-controls={`task-details-${idx}`}
                                title={isOpen ? "Hide details" : "Show details"}
                              >
                                <svg
                                  className={`h-4 w-4 transform transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>

                            )}
                          </div>
                        </div>

                        {/* Expanded details */}
                        {isOpen && t.details && (
                          <div
                            id={`task-details-${idx}`}
                            className="mt-2 ml-6 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300"
                          >
                            <div className="whitespace-pre-line">{t.details}</div>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}


            {/* Conclusion */}
            {object.project.conclusion && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Conclusion
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
                  {object.project.conclusion}
                </p>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Footer space on mobile */}
      <div className="h-8" />
    </div>
  );
}