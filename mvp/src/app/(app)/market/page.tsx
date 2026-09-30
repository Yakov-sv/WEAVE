"use client";

import { useState } from "react";
import { listings, subscriptionPlans, formatPrice, formatNumber } from "@/lib/mock-data";

const categories = [
  { id: "all", label: "All", icon: "✨" },
  { id: "code", label: "Code", icon: "📦" },
  { id: "template", label: "Templates", icon: "🎨" },
  { id: "course", label: "Courses", icon: "🎓" },
  { id: "media", label: "Media", icon: "🎬" },
  { id: "service", label: "Services", icon: "🤝" },
];

export default function MarketPage() {
  const [tab, setTab] = useState<"market" | "subscriptions" | "dashboard">("market");
  const [category, setCategory] = useState("all");

  const filtered = category === "all" ? listings : listings.filter((l) => l.type === category);

  return (
    <div>
      <div className="sticky top-0 z-10 glass border-b border-[var(--border)]">
        <div className="flex items-center px-4">
          {[
            { id: "market", label: "🛒 Marketplace" },
            { id: "subscriptions", label: "💎 Subscriptions" },
            { id: "dashboard", label: "📊 Dashboard" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as typeof tab)}
              className={`px-5 py-3.5 text-sm font-medium relative transition-colors ${
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

      {tab === "market" && (
        <div className="max-w-5xl mx-auto p-6">
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
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

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((l) => (
              <div key={l.id} className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] overflow-hidden hover:border-[var(--primary)]/50 transition-all hover:scale-[1.02]">
                <div className="aspect-[2:1] bg-gradient-to-br from-[var(--surface-hover)] to-[var(--background)] flex items-center justify-center text-5xl">
                  {l.coverImage}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs text-[var(--muted)]">{l.seller.avatar}</span>
                    <span className="text-xs text-[var(--muted)]">@{l.seller.username}</span>
                    {l.featured && (
                      <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-medium">
                        ⭐ Featured
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm leading-snug mb-1">{l.title}</h3>
                  <p className="text-xs text-[var(--muted)] line-clamp-2 mb-3">{l.description}</p>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-[var(--muted)]">⭐ {l.rating}</span>
                    <span className="text-xs text-[var(--muted)]">({l.ratingCount})</span>
                    <span className="text-xs text-[var(--muted)] ml-auto">{formatNumber(l.salesCount)} sold</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-bold">{formatPrice(l.price)}</span>
                      {l.compareAt && (
                        <span className="text-xs text-[var(--muted)] line-through">{formatPrice(l.compareAt)}</span>
                      )}
                    </div>
                    <button className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-amber-500 text-white text-xs font-medium hover:opacity-90 transition-opacity">
                      Buy now
                    </button>
                  </div>

                  {l.linkedRepo && (
                    <div className="mt-2 text-[10px] text-[var(--muted)] flex items-center gap-1">
                      📦 Linked: <span className="font-mono">{l.linkedRepo}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "subscriptions" && (
        <div className="max-w-3xl mx-auto p-6">
          <h2 className="text-xl font-bold mb-1">Subscription Plans</h2>
          <p className="text-sm text-[var(--muted)] mb-6">Support creators and get exclusive access</p>

          <div className="grid gap-4">
            {subscriptionPlans.map((plan) => (
              <div key={plan.id} className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)]/50 transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-2xl shrink-0">
                    {plan.creator.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{plan.name}</h3>
                      <span className="text-xs text-[var(--muted)]">by @{plan.creator.username}</span>
                      {plan.creator.verified && <span className="text-[var(--primary)] text-xs">✓</span>}
                    </div>
                    <p className="text-sm text-[var(--muted)] mt-1">{plan.description}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {plan.features.map((f, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-[var(--surface-hover)] text-[var(--muted)]">
                          ✓ {f}
                        </span>
                      ))}
                    </div>
                    <div className="text-xs text-[var(--muted)] mt-2">
                      {formatNumber(plan.subscriberCount)} subscribers
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-2xl font-bold">{formatPrice(plan.price)}</div>
                    <div className="text-xs text-[var(--muted)]">/{plan.interval === "monthly" ? "month" : "year"}</div>
                    <button className="mt-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-amber-500 text-white text-xs font-medium hover:opacity-90 transition-opacity">
                      Subscribe
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "dashboard" && (
        <div className="max-w-3xl mx-auto p-6">
          <h2 className="text-xl font-bold mb-6">Creator Dashboard</h2>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
              <div className="text-xs text-[var(--muted)] mb-1">Available</div>
              <div className="text-2xl font-bold text-green-400">$245.00</div>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
              <div className="text-xs text-[var(--muted)] mb-1">Pending</div>
              <div className="text-2xl font-bold text-amber-400">$245.00</div>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
              <div className="text-xs text-[var(--muted)] mb-1">Lifetime</div>
              <div className="text-2xl font-bold">$1,580.00</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Recent transactions</h3>
              <button className="text-xs text-[var(--primary-hover)] hover:underline">View all</button>
            </div>
            <div className="space-y-2">
              {[
                { type: "subscription", desc: "Alex Chen — Premium Access", amount: 1000, fee: 100, date: "2h ago", status: "completed" },
                { type: "purchase", desc: "Design System Pro", amount: 4900, fee: 490, date: "2d ago", status: "completed" },
                { type: "tip", desc: "Tip from @codeforge", amount: 500, fee: 25, date: "3d ago", status: "completed" },
                { type: "payout", desc: "Payout to ••••4521", amount: -24500, fee: 0, date: "4d ago", status: "pending" },
              ].map((t, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-t border-[var(--border)] first:border-0">
                  <div className="w-8 h-8 rounded-lg bg-[var(--background)] flex items-center justify-center text-sm">
                    {t.type === "subscription" ? "💎" : t.type === "purchase" ? "🛒" : t.type === "tip" ? "💰" : "🏦"}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm">{t.desc}</div>
                    <div className="text-xs text-[var(--muted)]">{t.date} · fee ${(t.fee / 100).toFixed(2)}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${t.amount < 0 ? "text-amber-400" : "text-green-400"}`}>
                      {t.amount < 0 ? "-" : "+"}${Math.abs(t.amount / 100).toFixed(2)}
                    </div>
                    <div className={`text-[10px] ${t.status === "completed" ? "text-green-400" : "text-amber-400"}`}>
                      {t.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-amber-500 text-white font-medium hover:opacity-90 transition-opacity">
            💸 Request payout ($245.00)
          </button>
        </div>
      )}
    </div>
  );
}
