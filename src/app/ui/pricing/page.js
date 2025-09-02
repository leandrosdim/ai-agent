"use client";

export default function PricingPage() {
  const tiers = [
    {
      name: "Free",
      price: "€0",
      desc: "For testing and personal use",
      features: [
        "Access to basic AI utilities",
        "Text & Chat tools",
        "Limited PDF/Image analysis",
        "Community support",
      ],
    },
    {
      name: "Pro",
      price: "€9 /mo",
      desc: "For individuals & freelancers",
      features: [
        "All Free features",
        "Full access to all utilities",
        "Faster response times",
        "Priority updates",
      ],
      highlight: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      desc: "For teams & companies",
      features: [
        "All Pro features",
        "Custom workflows & integration",
        "Dedicated support",
        "SLAs available",
      ],
    },
  ];

  return (
    <main className="min-h-[100dvh] bg-gradient-to-b from-white to-slate-50 text-slate-900 
      dark:from-slate-950 dark:to-slate-950 dark:text-slate-100 py-16 px-6 flex items-center justify-center">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-6">Pricing Plans</h1>
        <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-12">
          Choose a plan that fits your needs. You can start for free, upgrade anytime, 
          and scale as your usage grows.
        </p>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl border p-6 shadow-sm transition hover:shadow-md 
                ${tier.highlight 
                  ? "border-indigo-500 bg-white dark:bg-slate-900" 
                  : "border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60"
                }`}
            >
              {tier.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs px-3 py-1 rounded-full">
                  Most Popular
                </span>
              )}

              <h2 className="text-xl font-semibold">{tier.name}</h2>
              <p className="mt-2 text-3xl font-bold">{tier.price}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{tier.desc}</p>

              <ul className="mt-6 space-y-2 text-sm text-slate-600 dark:text-slate-300 text-left">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-indigo-500">✔</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button                
                className={`mt-8 w-full rounded-xl px-4 py-2 font-medium transition 
                  ${tier.highlight 
                    ? "bg-indigo-600 text-white hover:bg-indigo-700" 
                    : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
              >
                {tier.name === "Enterprise" ? "Contact Us" : "Get Started"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
