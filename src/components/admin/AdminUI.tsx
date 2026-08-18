"use client";

import { FiSearch, FiX } from "react-icons/fi";

export const inputClass = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#e63946] focus:ring-2 focus:ring-[#e63946]/10";
export const buttonClass = "inline-flex items-center justify-center gap-2 rounded-lg bg-[#e63946] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#c1121f] disabled:cursor-not-allowed disabled:opacity-50";
export const secondaryButtonClass = "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50";

export function PageHeader({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-2xl font-bold tracking-tight text-slate-950">{title}</h1><p className="mt-1 text-sm text-slate-500">{description}</p></div>{action}</div>;
}

export function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</section>;
}

export function PanelHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-sm font-semibold text-slate-900">{title}</h2>{subtitle ? <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p> : null}</div>{action}</div>;
}

export function SearchBox({ value, onChange, placeholder = "Search…" }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <label className="relative block min-w-0 sm:w-72"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={`${inputClass} pl-9`} /></label>;
}

export function StatusBadge({ value }: { value: string }) {
  const palette = value === "CONFIRMED" || value === "APPROVED" || value === "COMPLETED" || value === "ACTIVE" || value === "PUBLISHED" ? "bg-emerald-50 text-emerald-700" : value === "CANCELLED" || value === "REJECTED" || value === "CLOSED" || value === "INACTIVE" ? "bg-rose-50 text-rose-700" : value === "CONTACTED" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700";
  return <span className={`inline-flex rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${palette}`}>{value}</span>;
}

export function Modal({ title, children, onClose, wide = false }: { title: string; children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  return <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/45 p-4" role="dialog" aria-modal="true" aria-label={title}><div className={`max-h-[92vh] w-full overflow-y-auto rounded-xl bg-white shadow-2xl ${wide ? "max-w-3xl" : "max-w-lg"}`}><div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4"><h2 className="text-base font-semibold">{title}</h2><button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><FiX /></button></div><div className="p-5">{children}</div></div></div>;
}

export function ConfirmDialog({ title, description, busy, onConfirm, onCancel }: { title: string; description: string; busy?: boolean; onConfirm: () => void; onCancel: () => void }) {
  return <Modal title={title} onClose={onCancel}><p className="text-sm leading-6 text-slate-600">{description}</p><div className="mt-6 flex justify-end gap-3"><button type="button" className={secondaryButtonClass} onClick={onCancel}>Cancel</button><button type="button" className={buttonClass} disabled={busy} onClick={onConfirm}>{busy ? "Please wait…" : "Confirm"}</button></div></Modal>;
}

export function Feedback({ error, message }: { error?: string; message?: string }) {
  if (!error && !message) return null;
  return <p role={error ? "alert" : undefined} className={`mb-5 rounded-lg border px-4 py-3 text-sm ${error ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{error || message}</p>;
}
