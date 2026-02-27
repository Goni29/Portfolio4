"use client";

import type { Locale } from "@/lib/types";
import { cn } from "@/lib/utils";

interface LocaleToggleProps {
  locale: Locale;
  onChange: (locale: Locale) => void;
  className?: string;
  size?: "default" | "compact";
}

export function LocaleToggle({ locale, onChange, className, size = "default" }: LocaleToggleProps) {
  const compact = size === "compact";
  const hasDisplayClass = /\b(hidden|block|inline-block|inline|flex|inline-flex|grid|inline-grid|table|contents)\b/.test(className ?? "");

  return (
    <div
      className={cn(
        !hasDisplayClass && "inline-flex",
        "relative items-center rounded-full border border-[#e6d9dd] bg-white/90 p-0.5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]",
        className,
      )}
      role="group"
      aria-label={locale === "ko" ? "언어 선택" : "Language selector"}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute left-0.5 top-0.5 rounded-full bg-[#e6194c] shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
          compact ? "h-6 w-9" : "h-7 w-11",
          locale === "en" && (compact ? "translate-x-9" : "translate-x-11"),
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
              "relative z-10 rounded-full leading-none font-semibold uppercase whitespace-nowrap [overflow-wrap:normal] transition-colors",
              compact ? "h-6 w-9 px-1.5 text-[9px] tracking-[0.08em]" : "h-7 w-11 px-2 text-[10px] tracking-[0.1em]",
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
