import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Шкільна дошка",
  description: "Місце для історій, фото та думок нашої школи",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk">
      <body className="min-h-screen font-body">
        <header className="border-b-4 border-board bg-board text-paper">
          <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
            <Link href="/" className="font-display text-xl tracking-tight">
              Шкільна дошка
            </Link>
            <Link
              href="/new"
              className="rounded-full bg-chalk px-4 py-1.5 text-sm font-medium text-paper transition hover:bg-chalk/90"
            >
              + Новий пост
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-2xl px-4 pb-24 pt-6">{children}</main>
      </body>
    </html>
  );
}
