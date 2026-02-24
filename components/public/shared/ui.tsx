"use client";

import Link from "next/link";
import { useStore } from "@/components/providers/store-provider";
import { cn } from "@/lib/utils";

export const STYLE_INPUT =
  "h-11 w-full rounded-xl border border-[#e8dce0] bg-white px-4 text-sm placeholder:text-[#9a7d87]";

export const STYLE_LABEL = "text-xs uppercase tracking-[0.15em] font-semibold text-[#6f5560]";

export function EmptyState({
  title,
  body,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  body: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <div className="rounded-3xl border border-[#f0e3e7] bg-white p-8 sm:p-10 text-center">
      <h2 className="font-serif text-4xl">{title}</h2>
      <p className="text-[#6f5560] mt-3">{body}</p>
      {ctaHref && ctaLabel && (
        <Link href={ctaHref} className="mt-6 inline-flex h-11 px-6 rounded-full bg-[#e6194c] text-white !text-white text-sm font-semibold items-center hover:bg-[#cb1743] transition-colors">
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}

export function CardText({ title, body }: { title: string; body: string }) {
  return (
    <article className="rounded-2xl border border-[#f0e3e7] bg-white p-6">
      <h3 className="font-serif text-3xl">{title}</h3>
      <p className="mt-3 text-[#6f5560] leading-relaxed">{body}</p>
    </article>
  );
}

export function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between gap-4 text-sm", bold && "font-semibold text-base")}>
      <span className="text-[#6f5560]">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

export function QuantityPicker({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const { locale } = useStore();
  return (
    <div className="h-11 rounded-xl border border-[#e8dce0] bg-white grid grid-cols-[44px_minmax(0,1fr)_44px]">
      <button
        type="button"
        className="text-[#6f5560]"
        onClick={() => onChange(Math.max(1, value - 1))}
        aria-label={locale === "ko" ? "수량 줄이기" : "Decrease"}
      >
        <span className="material-symbols-outlined">remove</span>
      </button>
      <div className="grid place-items-center text-sm font-semibold">{value}</div>
      <button
        type="button"
        className="text-[#6f5560]"
        onClick={() => onChange(Math.min(99, value + 1))}
        aria-label={locale === "ko" ? "수량 늘리기" : "Increase"}
      >
        <span className="material-symbols-outlined">add</span>
      </button>
    </div>
  );
}

export function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  const { locale } = useStore();
  return (
    <div>
      <label className={STYLE_LABEL}>{label}</label>
      <select className={`${STYLE_INPUT} mt-2`} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option === "all" ? (locale === "ko" ? "전체" : "All") : option}
          </option>
        ))}
      </select>
    </div>
  );
}

export function FieldSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<[string, string]>;
}) {
  return (
    <div>
      <label className={STYLE_LABEL}>{label}</label>
      <select className={`${STYLE_INPUT} mt-2`} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </div>
  );
}

export function InputField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className={STYLE_LABEL}>{label}</label>
      <input className={`${STYLE_INPUT} mt-2`} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}
