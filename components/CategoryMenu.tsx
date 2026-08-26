"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

const OPTIONS = [
  { href: "/?category=anonymous", label: "Анонімні пости" },
  { href: "/?category=news", label: "Цікаві новини" },
  { href: "/?category=thoughts", label: "Спонтанні думки" },
  { href: "/", label: "Без категорії (усі пости)" },
];

export default function CategoryMenu({ iconBtn }: { iconBtn: string }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  function toggle() {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 8, left: rect.left });
    }
    setOpen(!open);
  }

  return (
    <>
      <button
        ref={btnRef}
        onClick={toggle}
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

      {mounted && open &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <div
              style={{ top: pos.top, left: pos.left }}
              className="fixed z-50 w-56 overflow-hidden rounded-xl border border-border bg-surface shadow-lg"
            >
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
          </>,
          document.body
        )}
    </>
  );
}
