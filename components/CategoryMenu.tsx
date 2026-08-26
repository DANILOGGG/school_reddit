"use client";

import { useState } from "react";
import Link from "next/link";

const OPTIONS = [
  { href: "/?category=anonymous", label: "Анонімні пости" },
  { href: "/?category=news", label: "Цікаві новини" },
  { href: "/?category=thoughts", label: "Спонтанні думки" },
  { href: "/", label: "Без категорії (усі пости)" },
];

export default function CategoryMenu({ iconBtn }: { iconBtn: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={iconBtn}
        title="Категорії"
        aria-label="Категорії"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-12 z-20 w-56 overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
            {OPTIONS.map((opt) => (
              <Link
                key={opt.href}
                href={opt.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-3 text-left text-sm text-paper hover:bg-surfaceRaised"
              >
                {opt.label}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
