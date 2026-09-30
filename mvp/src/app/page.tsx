"use client";

import Link from "next/link";
import { useLang } from "@/lib/lang-context";

export default function LandingPage() {
  const { t } = useLang();

  const features = [
    { icon: "📋", title: t("feed"), desc: t("featFeed"), color: "from-blue-500 to-indigo-500" },
    { icon: "💬", title: t("messages"), desc: t("featMessaging"), color: "from-cyan-500 to-blue-500" },
    { icon: "📦", title: "Git", desc: t("featGit"), color: "from-amber-500 to-orange-500" },
    { icon: "🛒", title: t("market"), desc: t("featMarket"), color: "from-purple-500 to-pink-500" },
    { icon: "💳", title: "Payments", desc: t("featPayments"), color: "from-green-500 to-emerald-500" },
    { icon: "⚡", title: "Realtime", desc: t("featRealtime"), color: "from-red-500 to-rose-500" },
  ];

  const stats = [
    { value: "6", label: t("statModules") },
    { value: "10%", label: t("statCommission") },
    { value: "0%", label: t("statOSS") },
    { value: "1", label: t("statProfile") },
  ];

  const platforms = [
    { name: "Telegram", v: ["✅", "🟡", "❌", "✅", "❌"] },
    { name: "X (Twitter)", v: ["🟡", "✅", "❌", "🟡", "❌"] },
    { name: "GitHub", v: ["🟡", "🟡", "✅", "🟡", "🟡"] },
    { name: "Patreon", v: ["❌", "🟡", "❌", "✅", "🟡"] },
    { name: "Discord", v: ["✅", "❌", "❌", "🟡", "🟡"] },
    { name: "WEAVE", v: ["✅", "✅", "✅", "✅", "✅"], highlight: true },
  ];

  const tableCols = [t("colMessenger"), t("colSocial"), "Git", t("colMonetization"), t("colMarketplace")];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] overflow-x-hidden">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-amber-500/10" />
        <div className="absolute top-1/4 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-amber-500/20 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--muted)] mb-6 sm:mb-8">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse-dot" />
            {t("badge")}
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-4 sm:mb-6">
            <span className="gradient-text">{t("heroTitle")}</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-[var(--muted)] mb-3 sm:mb-4 font-light">
            {t("heroSubtitle")}
          </p>
          <p className="text-sm sm:text-base md:text-lg text-[var(--muted)] max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">
            {t("heroDesc")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/feed"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-amber-500 text-white font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/25 text-center"
            >
              {t("openDemo")}
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] font-semibold hover:bg-[var(--surface-hover)] transition-colors text-center"
            >
              {t("learnMore")}
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-12 sm:mt-20">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text">{s.value}</div>
                <div className="text-[10px] sm:text-xs text-[var(--muted)] mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">{t("featuresTitle")}</h2>
            <p className="text-sm sm:text-base text-[var(--muted)] max-w-2xl mx-auto">
              {t("featuresDesc")}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="group p-5 sm:p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)]/50 transition-all hover:scale-[1.02]"
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-xl sm:text-2xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform`}>
                  {f.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-[var(--surface)]/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">{t("compareTitle")}</h2>
            <p className="text-sm sm:text-base text-[var(--muted)]">{t("compareDesc")}</p>
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-hidden rounded-2xl border border-[var(--border)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--surface)]">
                  <th className="text-left p-4 font-medium text-[var(--muted)]">{t("colPlatform")}</th>
                  {tableCols.map((col) => (
                    <th key={col} className="text-center p-4 font-medium">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {platforms.map((row) => (
                  <tr
                    key={row.name}
                    className={row.highlight ? "bg-gradient-to-r from-indigo-500/20 to-amber-500/20 border-y border-[var(--primary)]/30" : "border-t border-[var(--border)]"}
                  >
                    <td className={`p-4 ${row.highlight ? "font-bold gradient-text" : "font-medium"}`}>{row.name}</td>
                    {row.v.map((cell, i) => (
                      <td key={i} className="text-center p-4 text-lg">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {platforms.map((row) => (
              <div
                key={row.name}
                className={`p-4 rounded-xl border ${row.highlight ? "bg-gradient-to-r from-indigo-500/20 to-amber-500/20 border-[var(--primary)]/30" : "bg-[var(--surface)] border-[var(--border)]"}`}
              >
                <div className={`font-bold mb-2 ${row.highlight ? "gradient-text" : ""}`}>{row.name}</div>
                <div className="flex items-center justify-between text-xs">
                  {row.v.map((cell, i) => (
                    <div key={i} className="flex flex-col items-center gap-0.5">
                      <span className="text-base">{cell}</span>
                      <span className="text-[var(--muted)] text-[9px]">{tableCols[i]}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10 sm:mt-12">
            <Link
              href="/feed"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-amber-500 text-white font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/25 text-sm sm:text-base"
            >
              {t("tryDemo")}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 px-4 sm:px-6 border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-amber-500 flex items-center justify-center text-white font-bold">
              W
            </div>
            <span className="font-bold">WEAVE</span>
            <span className="text-[var(--muted)] text-sm hidden sm:inline">{t("tagline")}</span>
          </div>
          <div className="text-xs text-[var(--muted)]">
            {t("copyright")}
          </div>
        </div>
      </footer>
    </div>
  );
}
