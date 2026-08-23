import type { Metadata } from "next";
import TopNav from "@/components/TopNav";
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
      <body className="min-h-screen bg-base font-body text-paper">
        <TopNav />
        <main className="mx-auto max-w-2xl px-3 pb-24 pt-5 sm:px-4">
          {children}
        </main>
      </body>
    </html>
  );
}
