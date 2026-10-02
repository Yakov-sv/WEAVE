"use client";

import { useState } from "react";
import { useLang } from "@/lib/lang-context";

export default function SettingsPage() {
  const { lang, toggleLang, t, theme, setTheme } = useLang();
  const [notifications, setNotifications] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(false);
  const [privateProfile, setPrivateProfile] = useState(false);
  const [showReputation, setShowReputation] = useState(true);

  const sections = [
    { id: "account", label: t("account") },
    { id: "appearance", label: t("appearance") },
    { id: "notifications", label: t("notifications") },
    { id: "privacy", label: t("privacy") },
    { id: "payments", label: t("payments") },
  ];

  const [activeSection, setActiveSection] = useState("account");

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">{t("settings")}</h1>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
              activeSection === s.id
                ? "bg-[var(--primary)]/15 text-[var(--primary-hover)]"
                : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {activeSection === "account" && (
        <div className="space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
            <h3 className="font-semibold text-sm mb-4">{t("profileInfo")}</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[var(--muted)] block mb-1">{t("displayName")}</label>
                <input
                  defaultValue="You"
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--muted)] block mb-1">{t("username")}</label>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--muted)] text-sm">@</span>
                  <input
                    defaultValue="you"
                    className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-[var(--muted)] block mb-1">{t("bio")}</label>
                <textarea
                  defaultValue="Building the future at WEAVE. Full-stack developer & creator."
                  rows={3}
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>
              <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-amber-500 text-white text-sm font-medium hover:opacity-90 transition-opacity">
                {t("save")}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeSection === "appearance" && (
        <div className="space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
            <h3 className="font-semibold text-sm mb-4">{t("language")}</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--muted)]">{t("interfaceLanguage")}</span>
              <button
                onClick={toggleLang}
                className="px-4 py-2 rounded-xl bg-[var(--background)] border border-[var(--border)] text-sm font-medium hover:bg-[var(--surface-hover)] transition-colors"
              >
                {lang === "ru" ? "🇷🇺 Русский" : "🇬🇧 English"}
              </button>
            </div>
          </div>
          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
            <h3 className="font-semibold text-sm mb-4">{t("theme")}</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setTheme("dark")}
                className={`flex-1 p-3 rounded-xl text-sm font-medium transition-all ${
                  theme === "dark"
                    ? "bg-[var(--background)] border-2 border-[var(--primary)]"
                    : "bg-[var(--background)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                🌙 Dark
              </button>
              <button
                onClick={() => setTheme("light")}
                className={`flex-1 p-3 rounded-xl text-sm font-medium transition-all ${
                  theme === "light"
                    ? "bg-[var(--background)] border-2 border-[var(--primary)]"
                    : "bg-[var(--background)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                ☀️ Light
              </button>
            </div>
          </div>
        </div>
      )}

      {activeSection === "notifications" && (
        <div className="space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-4">
            <ToggleRow
              label={t("pushNotifications")}
              desc={t("pushNotificationsDesc")}
              value={notifications}
              onChange={setNotifications}
            />
            <ToggleRow
              label={t("emailNotifications")}
              desc={t("emailNotificationsDesc")}
              value={emailNotifs}
              onChange={setEmailNotifs}
            />
          </div>
        </div>
      )}

      {activeSection === "privacy" && (
        <div className="space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-4">
            <ToggleRow
              label={t("privateProfile")}
              desc={t("privateProfileDesc")}
              value={privateProfile}
              onChange={setPrivateProfile}
            />
            <ToggleRow
              label={t("showReputation")}
              desc={t("showReputationDesc")}
              value={showReputation}
              onChange={setShowReputation}
            />
          </div>
        </div>
      )}

      {activeSection === "payments" && (
        <div className="space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
            <h3 className="font-semibold text-sm mb-4">{t("stripeAccount")}</h3>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--background)] border border-[var(--border)]">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg">
                💳
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">Stripe Connect</div>
                <div className="text-xs text-[var(--muted)]">••••4521 · {t("active")}</div>
              </div>
              <button className="text-xs text-[var(--primary-hover)] hover:underline">{t("manage")}</button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[var(--background)] border border-[var(--border)]">
                <div className="text-xs text-[var(--muted)] mb-1">{t("availableBalance")}</div>
                <div className="text-lg font-bold text-green-400">$245.00</div>
              </div>
              <div className="p-3 rounded-xl bg-[var(--background)] border border-[var(--border)]">
                <div className="text-xs text-[var(--muted)] mb-1">{t("pendingBalance")}</div>
                <div className="text-lg font-bold text-amber-400">$245.00</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ToggleRow({
  label,
  desc,
  value,
  onChange,
}: {
  label: string;
  desc: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-[var(--muted)] mt-0.5">{desc}</div>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 mt-0.5 ${
          value ? "bg-[var(--primary)]" : "bg-[var(--border)]"
        }`}
      >
        <div
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
            value ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
