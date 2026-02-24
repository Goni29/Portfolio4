"use client";

import type { Locale } from "@/lib/types";
import { cn } from "@/lib/utils";

interface LocaleToggleProps {
  locale: Locale;
  onChange: (locale: Locale) => void;
  className?: string;
}

export function LocaleToggle({ locale, onChange, className }: LocaleToggleProps) {
  return (
    <div
      className={cn(
        "relative inline-flex items-center rounded-full border border-[#e6d9dd] bg-white/90 p-0.5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]",
        className,
      )}
      role="group"
      aria-label={locale === "ko" ? "언어 선택" : "Language selector"}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute left-0.5 top-0.5 h-7 w-11 rounded-full bg-[#e6194c] shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
          locale === "en" && "translate-x-11",
        )}
      />
      {(["ko", "en"] as const).map((entry) => {
        const active = locale === entry;

        return (
          <button
            key={entry}
            type="button"
            onClick={() => {
              if (!active) {
                onChange(entry);
              }
            }}
            aria-pressed={active}
            className={cn(
              "relative z-10 h-7 w-11 rounded-full px-2 text-[10px] leading-none font-semibold uppercase tracking-[0.1em] whitespace-nowrap [overflow-wrap:normal] transition-colors",
              active ? "text-white" : "text-[#6f5560] hover:text-[#1b0e11]",
            )}
          >
            {entry.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
