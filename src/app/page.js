"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  MessageSquarePlus,
  Image as ImageIcon,
  FileScan,
  Table2,
  Workflow,
  FileUp,
  Search,
  ArrowRight,
  Home,
} from "lucide-react";

// Mobile‑first feature config. Update hrefs to match your routes.
const FEATURES = [
  { title: "Text Generator", href: "/ui/completion", desc: "Draft, re‑write, summarize.", icon: MessageSquarePlus, accent: "from-indigo-500/15 to-indigo-500/0" },
  { title: "Chat Bot", href: "/ui/chat", desc: "Multi‑turn conversations.", icon: Bot, accent: "from-sky-500/15 to-sky-500/0" },
  { title: "Project Management", href: "/ui/goal-achievment", desc: "JSON/Zod‑validated outputs.", icon: Table2, accent: "from-emerald-500/15 to-emerald-500/0" }, 
  { title: "PDF-Image Analysis Chat Bot", href: "/ui/multi-modal-chat", desc: "Summarize & extract tables && understand images.", icon: FileScan, accent: "from-amber-500/15 to-amber-500/0" },
  { title: "Image Generator", href: "/ui/generate-image", desc: "Give a description and generate image.", icon: ImageIcon, accent: "from-fuchsia-500/15 to-fuchsia-500/0" },
  { title: "File Uploader", href: "/files", desc: "Upload & query docs.", icon: FileUp, accent: "from-pink-500/15 to-pink-500/0" },
  { title: "Workflows", href: "/workflows", desc: "Chain utilities into flows.", icon: Workflow, accent: "from-violet-500/15 to-violet-500/0" },
  { title: "Quick Ask", href: "/ask", desc: "One‑shot answers.", icon: Search, accent: "from-cyan-500/15 to-cyan-500/0" },
];

export default function HomePage() {
  return (
    <main className="min-h-[100dvh] bg-gradient-to-b from-white to-slate-50 text-slate-900 dark:from-slate-950 dark:to-slate-950 dark:text-slate-100 pb-20 sm:pb-0 [padding-bottom:env(safe-area-inset-bottom)]">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/50 border-b border-slate-200/60 dark:border-slate-800">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-7 sm:size-8 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500" />
            <span className="font-semibold tracking-tight">AI Super Agent</span>
          </div>
          {/* Desktop quick links */}
          <nav className="hidden sm:flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
            <Link href="/chat" className="hover:text-slate-900 dark:hover:text-white">Chat</Link>
            <Link href="/text" className="hover:text-slate-900 dark:hover:text-white">Text</Link>
            <Link href="/structured" className="hover:text-slate-900 dark:hover:text-white">Structured</Link>
            <Link href="/vision" className="hover:text-slate-900 dark:hover:text-white">Vision</Link>
            <Link href="/pdf" className="hover:text-slate-900 dark:hover:text-white">PDF</Link>
          </nav>
        </div>
      </header>

      {/* Hero – compact on mobile */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 items-center">
          <div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              All your AI utilities, one clean home
            </h1>
            <p className="mt-3 sm:mt-4 text-sm sm:text-lg text-slate-600 dark:text-slate-300 max-w-prose">
              Jump into text, chat, structured JSON, image & PDF analysis. Each tile opens its own route.
            </p>
            <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link
                href="/chat"
                className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm sm:text-base font-medium bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90"
              >
                Open Chat <ArrowRight className="size-4" />
              </Link>
              <a
                href="https://github.com/"
                target="_blank"
                className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm sm:text-base font-medium border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                View on GitHub
              </a>
            </div>
          </div>

          {/* Highlight Card */}
          <div className="relative order-first md:order-none">
            <div className="absolute -inset-4 sm:-inset-6 -z-10 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-sky-500/5 to-transparent blur-xl sm:blur-2xl" />
            <div className="rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-4 sm:p-6 shadow-lg">
              <div className="flex items-center gap-3">
                <Bot className="size-5 sm:size-6" />
                <div>
                  <h3 className="font-semibold">Unified interface</h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    Every capability is a separate route—this page is the fast launcher.
                  </p>            
                </div>
              </div>
              <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-2 sm:gap-3 text-sm">
                {FEATURES.slice(0, 4).map((f) => (
                  <Link key={f.href} href={f.href} className="group rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                    <div className="flex items-center gap-2">
                      <f.icon className="size-4" />
                      <span className="font-medium line-clamp-1">{f.title}</span>
                    </div>
                    <p className="mt-1 text-slate-600 dark:text-slate-400 hidden sm:block">
                      {f.desc}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid – mobile friendly tiles */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-24 sm:pb-16">
        <div className="mb-3 sm:mb-4 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-semibold tracking-tight">Utilities</h2>
        </div>
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <FeatureCard key={f.href} {...f} />
          ))}
        </div>
      </section>

      {/* Bottom Tab Bar – mobile only */}
      <MobileTabBar />

      {/* Footer (desktop only) */}
      <footer className="hidden sm:block border-t border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between text-sm text-slate-500">
          <p>© {new Date().getFullYear()} AI Super Agent</p>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:text-slate-700 dark:hover:text-slate-300">About</Link>
            <Link href="/privacy" className="hover:text-slate-700 dark:hover:text-slate-300">Privacy</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ title, href, desc, icon: Icon, accent }) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow active:scale-[0.99]"
    >
      <div className={`pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-gradient-to-br ${accent ?? "from-indigo-500/10 to-transparent"}`} />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
            <Icon className="size-5" />
          </span>
          <div>
            <h3 className="text-sm sm:text-base font-semibold tracking-tight line-clamp-1">
              {title}
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
              {desc}
            </p>
          </div>
        </div>
        <ArrowRight className="size-5 opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition" />
      </div>
    </Link>
  );
}

function MobileTabBar() {
  const pathname = usePathname();
  const tabs = [
    { href: "/", label: "Home", icon: Home },
    { href: "/ui/chat", label: "Chat", icon: Bot },
    { href: "/ui/text", label: "Text", icon: MessageSquarePlus },
    { href: "/vision", label: "Vision", icon: ImageIcon },
    { href: "/pdf", label: "PDF", icon: FileScan },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 inset-x-0 z-50 border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/50 [padding-bottom:env(safe-area-inset-bottom)]">
      <ul className="grid grid-cols-5">
        {tabs.map((t) => {
          const active = pathname === t.href;
          const Icon = t.icon;
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                className={`flex flex-col items-center justify-center py-2.5 gap-1 text-xs ${active ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}
              >
                <Icon className="size-5" />
                <span className="leading-none">{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
