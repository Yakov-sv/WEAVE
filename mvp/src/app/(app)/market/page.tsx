"use client";

import { useState } from "react";
import { listings, subscriptionPlans, formatPrice, formatNumber } from "@/lib/mock-data";
import { useLang } from "@/lib/lang-context";

export default function MarketPage() {
  const [tab, setTab] = useState<"market" | "subscriptions" | "dashboard">("market");
  const [category, setCategory] = useState("all");
  const { t } = useLang();

  const categories = [
    { id: "all", label: t("allCategories"), icon: "✨" },
    { id: "code", label: t("code"), icon: "📦" },
    { id: "template", label: t("templates"), icon: "🎨" },
    { id: "course", label: t("courses"), icon: "🎓" },
    { id: "media", label: t("media"), icon: "🎬" },
    { id: "service", label: t("services"), icon: "🤝" },
  ];

  const tabs = [
    { id: "market" as const, label: t("marketplace") },
    { id: "subscriptions" as const, label: t("subscriptions") },
    { id: "dashboard" as const, label: t("dashboard") },
  ];

  const filtered = category === "all" ? listings : listings.filter((l) => l.type === category);

  return (
    <div>
      {/* Tabs */}
      <div className="sticky top-0 z-10 glass border-b border-[var(--border)]">
        <div className="flex items-center px-2 sm:px-4 overflow-x-auto">
          {[
            { id: "market", label: "🛒 Marketplace" },
            { id: "subscriptions", label: "💎 Subscriptions" },
            { id: "dashboard", label: "📊 Dashboard" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as typeof tab)}
              className={`px-3 sm:px-5 py-3.5 text-sm font-medium relative transition-colors whitespace-nowrap ${
                tab === t.id ? "text-[var(--foreground)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {t.label}
              {tab === t.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-amber-500" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Marketplace */}
      {tab === "market" && (
        <div className="max-w-5xl mx-auto p-4 sm:p-6">
          <div className="flex gap-2 mb-5 sm:mb-6 overflow-x-auto pb-1">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                  category === c.id
                    ? "bg-[var(--primary)]/15 text-[var(--primary-hover)]"
                    : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {c.icon} {c.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((l) => (
              <div key={l.id} className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] overflow-hidden hover:border-[var(--primary)]/50 transition-all hover:scale-[1.02]">
                <div className="aspect-[2:1] bg-gradient-to-br from-[var(--surface-hover)] to-[var(--background)] flex items-center justify-center text-4xl sm:text-5xl">
                  {l.coverImage}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs text-[var(--muted)]">{l.seller.avatar}</span>
                    <span className="text-xs text-[var(--muted)] truncate">@{l.seller.username}</span>
                    {l.featured && (
                      <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-medium shrink-0">
                        ⭐
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm leading-snug mb-1 line-clamp-2">{l.title}</h3>
                  <p className="text-xs text-[var(--muted)] line-clamp-2 mb-3">{l.description}</p>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-[var(--muted)]">⭐ {l.rating}</span>
                    <span className="text-xs text-[var(--muted)]">({l.ratingCount})</span>
                    <span className="text-xs text-[var(--muted)] ml-auto">{formatNumber(l.salesCount)} {t("sold")}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-bold">{formatPrice(l.price)}</span>
                      {l.compareAt && (
                        <span className="text-xs text-[var(--muted)] line-through">{formatPrice(l.compareAt)}</span>
                      )}
                    </div>
                    <button className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-amber-500 text-white text-xs font-medium hover:opacity-90 transition-opacity">
                      {t("buyNow")}
                    </button>
                  </div>

                  {l.linkedRepo && (
                    <div className="mt-2 text-[10px] text-[var(--muted)] flex items-center gap-1 truncate">
                      📦 <span className="font-mono truncate">{l.linkedRepo}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subscriptions */}
      {tab === "subscriptions" && (
        <div className="max-w-3xl mx-auto p-4 sm:p-6">
          <h2 className="text-xl font-bold mb-1">{t("subscriptionPlans")}</h2>
          <p className="text-sm text-[var(--muted)] mb-5 sm:mb-6">{t("supportCreators")}</p>

          <div className="grid gap-4">
            {subscriptionPlans.map((plan) => (
              <div key={plan.id} className="p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)]/50 transition-all">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-xl sm:text-2xl shrink-0">
                    {plan.creator.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm sm:text-base">{plan.name}</h3>
                      <span className="text-xs text-[var(--muted)]">by @{plan.creator.username}</span>
                      {plan.creator.verified && <span className="text-[var(--primary)] text-xs">✓</span>}
                    </div>
                    <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">{plan.description}</p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {plan.features.map((f, i) => (
                        <span key={i} className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-[var(--surface-hover)] text-[var(--muted)]">
                          ✓ {f}
                        </span>
                      ))}
                    </div>
                    <div className="text-xs text-[var(--muted)] mt-2">
                      {formatNumber(plan.subscriberCount)} {t("subscribers")}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xl sm:text-2xl font-bold">{formatPrice(plan.price)}</div>
                    <div className="text-xs text-[var(--muted)]">/{plan.interval === "monthly" ? "mo" : "yr"}</div>
                    <button className="mt-2 px-3 sm:px-4 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-amber-500 text-white text-xs font-medium hover:opacity-90 transition-opacity">
                      {t("subscribe")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dashboard */}
      {tab === "dashboard" && (
        <div className="max-w-3xl mx-auto p-4 sm:p-6">
          <h2 className="text-xl font-bold mb-5 sm:mb-6">{t("creatorDashboard")}</h2>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5 sm:mb-6">
            <div className="p-3 sm:p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
              <div className="text-[10px] sm:text-xs text-[var(--muted)] mb-1">{t("available")}</div>
              <div className="text-base sm:text-2xl font-bold text-green-400">$245</div>
            </div>
            <div className="p-3 sm:p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
              <div className="text-[10px] sm:text-xs text-[var(--muted)] mb-1">{t("pending")}</div>
              <div className="text-base sm:text-2xl font-bold text-amber-400">$245</div>
            </div>
            <div className="p-3 sm:p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
              <div className="text-[10px] sm:text-xs text-[var(--muted)] mb-1">{t("lifetime")}</div>
              <div className="text-base sm:text-2xl font-bold">$1,580</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] mb-5 sm:mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">{t("recentTransactions")}</h3>
              <button className="text-xs text-[var(--primary-hover)] hover:underline">{t("viewAll")}</button>
            </div>
            <div className="space-y-2">
              {[
                { type: "subscription", desc: "Alex Chen — Premium Access", amount: 1000, fee: 100, date: "2h ago", status: "completed" },
                { type: "purchase", desc: "Design System Pro", amount: 4900, fee: 490, date: "2d ago", status: "completed" },
                { type: "tip", desc: "Tip from @codeforge", amount: 500, fee: 25, date: "3d ago", status: "completed" },
                { type: "payout", desc: "Payout to ••••4521", amount: -24500, fee: 0, date: "4d ago", status: "pending" },
              ].map((t, i) => (
                <div key={i} className="flex items-center gap-2 sm:gap-3 py-2 border-t border-[var(--border)] first:border-0">
                  <div className="w-8 h-8 rounded-lg bg-[var(--background)] flex items-center justify-center text-sm shrink-0">
                    {t.type === "subscription" ? "💎" : t.type === "purchase" ? "🛒" : t.type === "tip" ? "💰" : "🏦"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs sm:text-sm truncate">{t.desc}</div>
                    <div className="text-[10px] sm:text-xs text-[var(--muted)]">{t.date} · fee ${(t.fee / 100).toFixed(2)}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`text-xs sm:text-sm font-medium ${t.amount < 0 ? "text-amber-400" : "text-green-400"}`}>
                      {t.amount < 0 ? "-" : "+"}${Math.abs(t.amount / 100).toFixed(2)}
                    </div>
                    <div className={`text-[9px] sm:text-[10px] ${t.status === "completed" ? "text-green-400" : "text-amber-400"}`}>
                      {t.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-amber-500 text-white font-medium hover:opacity-90 transition-opacity text-sm sm:text-base">
            💸 {t("requestPayout")} ($245.00)
          </button>
        </div>
      )}
    </div>
  );
}
