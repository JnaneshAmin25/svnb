"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { ConfirmDialog, Feedback, Modal, PageHeader, Panel, PanelHeader, SearchBox, StatusBadge, buttonClass, inputClass, secondaryButtonClass } from "@/components/admin/AdminUI";
import { fetchAdminJSON } from "@/lib/admin/fetch";
import type { AdminBooking, BookingStatus } from "@/lib/admin/types";

const STATUSES: BookingStatus[] = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];
type FormMode = { kind: "create" } | { kind: "edit"; row: AdminBooking };

export default function AdminBookingsPage() {
  const [rows, setRows] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<BookingStatus | "">("");
  const [form, setForm] = useState<FormMode | null>(null);
  const [deleting, setDeleting] = useState<AdminBooking | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const result = await fetchAdminJSON<{ items: AdminBooking[] }>(`/api/admin/bookings${status ? `?status=${status}` : ""}`);
    if (result.state === "success" && result.data) { setRows(result.data.items); setError(""); }
    else setError(result.error?.detail || result.message || "Unable to load bookings.");
    setLoading(false);
  }, [status]);
  // Data is fetched after mount; load updates state only after its awaited request.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => rows.filter((row) => `${row.user.fullName} ${row.user.email} ${row.user.phone} ${row.eventType} ${row.location}`.toLowerCase().includes(search.toLowerCase())), [rows, search]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!form) return; setBusy(true); setError(""); setMessage("");
    const values = new FormData(event.currentTarget);
    const common = { eventType: String(values.get("eventType")), eventDate: String(values.get("eventDate")), location: String(values.get("location")), specialRequest: String(values.get("specialRequest") || ""), status: String(values.get("status")) };
    const create = form.kind === "create";
    const payload = create ? { ...common, fullName: String(values.get("fullName")), email: String(values.get("email")), phone: String(values.get("phone")) } : common;
    const result = await fetchAdminJSON(create ? "/api/admin/bookings" : `/api/admin/bookings/${form.row.id}`, { method: create ? "POST" : "PATCH", body: JSON.stringify(payload) });
    if (result.state === "success") { setForm(null); setMessage(create ? "Booking created." : "Booking updated."); await load(); } else setError(result.error?.detail || result.message || "Unable to save booking.");
    setBusy(false);
  }

  async function remove() { if (!deleting) return; setBusy(true); const result = await fetchAdminJSON(`/api/admin/bookings/${deleting.id}`, { method: "DELETE" }); if (result.state === "success") { setDeleting(null); setMessage("Booking deleted."); await load(); } else setError(result.error?.detail || result.message || "Unable to delete booking."); setBusy(false); }

  return <div><PageHeader title="Bookings" description="Create, edit, track, and remove customer bookings." action={<button className={buttonClass} onClick={() => setForm({ kind: "create" })}><FiPlus /> Add booking</button>} /><Feedback error={error} message={message} />
    <Panel><PanelHeader title="All bookings" subtitle={`${filtered.length} records`} action={<div className="flex flex-col gap-2 sm:flex-row"><SearchBox value={search} onChange={setSearch} placeholder="Search bookings…" /><select value={status} onChange={(e) => setStatus(e.target.value as BookingStatus | "")} className={`${inputClass} sm:w-40`}><option value="">All statuses</option>{STATUSES.map((item) => <option key={item}>{item}</option>)}</select></div>} />
      <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500"><tr>{["Customer", "Event", "Date", "Location", "Status", "Actions"].map((h) => <th key={h} className="px-5 py-3 font-semibold">{h}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{filtered.map((row) => <tr key={row.id} className="hover:bg-slate-50/70"><td className="px-5 py-4"><p className="font-medium text-slate-800">{row.user.fullName || "Customer"}</p><p className="text-xs text-slate-400">{row.user.email || row.user.phone}</p></td><td className="px-5 py-4">{row.eventType}</td><td className="whitespace-nowrap px-5 py-4 text-slate-500">{new Date(row.eventDate).toLocaleDateString()}</td><td className="px-5 py-4 text-slate-500">{row.location}</td><td className="px-5 py-4"><StatusBadge value={row.status} /></td><td className="px-5 py-4"><div className="flex gap-1"><button aria-label="Edit booking" className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600" onClick={() => setForm({ kind: "edit", row })}><FiEdit2 /></button><button aria-label="Delete booking" className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600" onClick={() => setDeleting(row)}><FiTrash2 /></button></div></td></tr>)}</tbody></table>{!loading && !filtered.length ? <p className="py-14 text-center text-sm text-slate-400">No bookings found.</p> : null}{loading ? <p className="py-14 text-center text-sm text-slate-400">Loading bookings…</p> : null}</div>
    </Panel>
    {form ? <Modal title={form.kind === "create" ? "Add booking" : "Edit booking"} onClose={() => setForm(null)} wide><BookingForm mode={form} onSubmit={save} busy={busy} onCancel={() => setForm(null)} /></Modal> : null}
    {deleting ? <ConfirmDialog title="Delete booking" description={`Delete the booking for ${deleting.user.fullName || "this customer"}? It will no longer appear in the admin or customer booking lists.`} busy={busy} onCancel={() => setDeleting(null)} onConfirm={() => void remove()} /> : null}
  </div>;
}

function BookingForm({ mode, onSubmit, busy, onCancel }: { mode: FormMode; onSubmit: (event: FormEvent<HTMLFormElement>) => void; busy: boolean; onCancel: () => void }) {
  const row = mode.kind === "edit" ? mode.row : null;
  return <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">{mode.kind === "create" ? <><Field label="Customer name"><input name="fullName" required minLength={2} className={inputClass} /></Field><Field label="Email"><input name="email" type="email" required className={inputClass} /></Field><Field label="Mobile number"><input name="phone" required minLength={8} className={inputClass} /></Field></> : null}<Field label="Event type"><input name="eventType" defaultValue={row?.eventType} required minLength={2} className={inputClass} /></Field><Field label="Event date"><input name="eventDate" type="date" defaultValue={row ? row.eventDate.slice(0, 10) : ""} required className={inputClass} /></Field><Field label="Location"><input name="location" defaultValue={row?.location} required minLength={2} className={inputClass} /></Field><Field label="Status"><select name="status" defaultValue={row?.status || "PENDING"} className={inputClass}>{STATUSES.map((item) => <option key={item}>{item}</option>)}</select></Field><div className="sm:col-span-2"><Field label="Special request"><textarea name="specialRequest" defaultValue={row?.specialRequest || ""} rows={3} className={inputClass} /></Field></div><div className="flex justify-end gap-3 sm:col-span-2"><button type="button" className={secondaryButtonClass} onClick={onCancel}>Cancel</button><button disabled={busy} className={buttonClass}>{busy ? "Saving…" : "Save booking"}</button></div></form>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</span>{children}</label>; }
