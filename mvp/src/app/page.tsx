import Link from "next/link";

const features = [
  { icon: "📋", title: "Feed", desc: "Посты, медиа, код — как X и Instagram. Лента с реакциями, тредами и хештегами.", color: "from-blue-500 to-indigo-500" },
  { icon: "💬", title: "Messaging", desc: "Чаты, группы, каналы — как Telegram. Платные подписки на каналы.", color: "from-cyan-500 to-blue-500" },
  { icon: "📦", title: "Git", desc: "Репозитории, PR, issues — как GitHub. Импорт из GitHub, платные репо.", color: "from-amber-500 to-orange-500" },
  { icon: "🛒", title: "Market", desc: "Маркетплейс кода, курсов, шаблонов — как Patreon и Gumroad. Эскроу, чаевые.", color: "from-purple-500 to-pink-500" },
  { icon: "💳", title: "Payments", desc: "Stripe Connect для подписок и выплат. Комиссия 10%, 0% для OSS.", color: "from-green-500 to-emerald-500" },
  { icon: "⚡", title: "Realtime", desc: "WebSocket-доставка сообщений, уведомлений, presence — в реальном времени.", color: "from-red-500 to-rose-500" },
];

const stats = [
  { value: "6", label: "модулей в одном профиле" },
  { value: "10%", label: "комиссия с транзакций" },
  { value: "0%", label: "для open-source" },
  { value: "1", label: "профиль вместо 5 сервисов" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] overflow-x-hidden">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-amber-500/10" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--muted)] mb-8">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse-dot" />
            Pre-alpha · MVP ready for demo
          </div>

          <h1 className="text-6xl md:text-7xl font-bold tracking-tight mb-6">
            <span className="gradient-text">WEAVE</span>
          </h1>
          <p className="text-xl md:text-2xl text-[var(--muted)] mb-4 font-light">
            Where everything connects
          </p>
          <p className="text-base md:text-lg text-[var(--muted)] max-w-2xl mx-auto mb-10">
            Модульная платформа, объединяющая мессенджер, соцсеть, Git и маркетплейс
            монетизации в единую ткань. Один профиль — бесконечные возможности.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/feed"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-amber-500 text-white font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/25"
            >
              Открыть демо →
            </Link>
            <a
              href="#features"
              className="px-8 py-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] font-semibold hover:bg-[var(--surface-hover)] transition-colors"
            >
              Узнать больше
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-3xl md:text-4xl font-bold gradient-text">{s.value}</div>
                <div className="text-xs text-[var(--muted)] mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">6 модулей. 1 профиль.</h2>
            <p className="text-[var(--muted)] max-w-2xl mx-auto">
              Каждый модуль — нить. Вместе они сплетаются в ткань вашего цифрового присутствия.
              Включайте только нужные.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="group p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)]/50 transition-all hover:scale-[1.02]"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                  {f.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-24 px-6 bg-[var(--surface)]/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Зачем 5 сервисов?</h2>
            <p className="text-[var(--muted)]">WEAVE заменяет их все одним профилем</p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[var(--border)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--surface)]">
                  <th className="text-left p-4 font-medium text-[var(--muted)]">Платформа</th>
                  <th className="text-center p-4 font-medium">Мессенджер</th>
                  <th className="text-center p-4 font-medium">Соцсеть</th>
                  <th className="text-center p-4 font-medium">Git</th>
                  <th className="text-center p-4 font-medium">Монетизация</th>
                  <th className="text-center p-4 font-medium">Маркетплейс</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Telegram", v: ["✅", "🟡", "❌", "✅", "❌"] },
                  { name: "X (Twitter)", v: ["🟡", "✅", "❌", "🟡", "❌"] },
                  { name: "GitHub", v: ["🟡", "🟡", "✅", "🟡", "🟡"] },
                  { name: "Patreon", v: ["❌", "🟡", "❌", "✅", "🟡"] },
                  { name: "Discord", v: ["✅", "❌", "❌", "🟡", "🟡"] },
                  { name: "WEAVE", v: ["✅", "✅", "✅", "✅", "✅"], highlight: true },
                ].map((row) => (
                  <tr
                    key={row.name}
                    className={row.highlight ? "bg-gradient-to-r from-indigo-500/20 to-amber-500/20 border-y border-[var(--primary)]/30" : "border-t border-[var(--border)]"}
                  >
                    <td className={`p-4 font-${row.highlight ? "bold gradient-text" : "medium"}`}>{row.name}</td>
                    {row.v.map((cell, i) => (
                      <td key={i} className="text-center p-4 text-lg">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/feed"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-amber-500 text-white font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/25"
            >
              Попробовать демо →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-amber-500 flex items-center justify-center text-white font-bold">
              W
            </div>
            <span className="font-bold">WEAVE</span>
            <span className="text-[var(--muted)] text-sm">— where everything connects</span>
          </div>
          <div className="text-xs text-[var(--muted)]">
            © 2026 WEAVE. Pre-alpha v0.3.0. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
