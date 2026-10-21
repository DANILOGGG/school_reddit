import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import TopNav from "@/components/TopNav";
import VisitTracker from "@/components/VisitTracker";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import "./globals.css";

export const metadata: Metadata = {
  title: "Шкільна дошка",
  description: "Місце для історій, фото та думок нашої школи",
  applicationName: "Шкільна дошка",
  icons: {
    icon: [{ url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    title: "Шкільна дошка",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0F0C",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk">
      <body className="min-h-screen bg-base font-body text-paper">
        <VisitTracker />
        <ServiceWorkerRegister />
        <Suspense
          fallback={<div className="h-[65px] border-b border-border bg-base" />}
        >
          <TopNav />
        </Suspense>
        <main className="mx-auto max-w-2xl px-3 pb-24 pt-5 sm:px-4">
          {children}
        </main>
      </body>
    </html>
  );
}
