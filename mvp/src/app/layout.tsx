import type { Metadata } from "next";
import "./globals.css";
import { LangProvider } from "@/lib/lang-context";

export const metadata: Metadata = {
  title: "WEAVE — Where everything connects",
  description: "Модульная платформа: мессенджер, соцсеть, Git и маркетплейс в одном профиле",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
