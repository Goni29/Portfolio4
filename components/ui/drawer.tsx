"use client";

import { useEffect, type ReactNode } from "react";
import { useStore } from "@/components/providers/store-provider";
import { cn } from "@/lib/utils";

interface DrawerProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  side?: "left" | "right";
}

export function Drawer({ open, title, onClose, children, side = "left" }: DrawerProps) {
  const { locale } = useStore();

  useEffect(() => {
    if (!open) {
      return;
    }

    const original = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label={locale === "ko" ? "서랍 닫기" : "Close drawer"}
        onClick={onClose}
      />
      <aside
        className={cn(
          "absolute top-0 h-full w-[88vw] max-w-sm bg-[#f8f6f6] shadow-2xl overflow-y-auto",
          side === "left" ? "left-0" : "right-0",
        )}
      >
        <div className="sticky top-0 z-10 border-b border-[#f3e7ea] bg-[#f8f6f6] px-6 py-5 flex items-center justify-between">
          <h2 className="font-semibold tracking-wide uppercase text-sm">{title}</h2>
          <button
            type="button"
            className="h-11 w-11 rounded-full border border-[#e1d4d8] grid place-items-center"
            aria-label={locale === "ko" ? "닫기" : "Close"}
            onClick={onClose}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </aside>
    </div>
  );
}
