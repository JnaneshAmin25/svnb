"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FiArrowUpRight, FiCalendar, FiImage, FiMessageSquare, FiStar, FiUsers } from "react-icons/fi";
import { Feedback, PageHeader, Panel, PanelHeader, StatusBadge } from "@/components/admin/AdminUI";
import { fetchAdminJSON } from "@/lib/admin/fetch";

type Dashboard = { counts: { bookingCount: number; reviewCount: number; contactCount: number; userCount: number; galleryCount: number }; recentEvents: Array<{ id: string; eventType: string; entity: string; entityId: string; createdAt: string }> };

export default function AdminHomePage() {
  const pathname = usePathname();
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [liveEvents, setLiveEvents] = useState<Dashboard["recentEvents"]>([]);

  useEffect(() => {
    let active = true;
    void fetchAdminJSON<Dashboard>("/api/admin/events").then((response) => {
      if (!active) return;
      if (response.state === "success" && response.data) setData(response.data);
      else setError(response.error?.detail || response.message || "Unable to load dashboard.");
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const stream = new EventSource(`/api/admin/stream?since=${encodeURIComponent(since)}`);
    stream.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as { id: string; type: string; entity: string; entityId: string; createdAt: string };
        setLiveEvents((current) => [{ ...payload, eventType: payload.type }, ...current.filter((item) => item.id !== payload.id)].slice(0, 8));
      } catch { /* Ignore malformed events. */ }
    };
    return () => stream.close();
  }, []);

  const base = `/${pathname.split("/").filter(Boolean)[0] || "admin"}`;
  const cards = useMemo(() => [
    { label: "Bookings", value: data?.counts.bookingCount ?? 0, icon: FiCalendar, href: `${base}/bookings`, color: "bg-blue-50 text-blue-600" },
    { label: "Messages", value: data?.counts.contactCount ?? 0, icon: FiMessageSquare, href: `${base}/contacts`, color: "bg-violet-50 text-violet-600" },
    { label: "Reviews", value: data?.counts.reviewCount ?? 0, icon: FiStar, href: `${base}/reviews`, color: "bg-amber-50 text-amber-600" },
    { label: "Users", value: data?.counts.userCount ?? 0, icon: FiUsers, href: `${base}/users`, color: "bg-emerald-50 text-emerald-600" },
    { label: "Gallery", value: data?.counts.galleryCount ?? 0, icon: FiImage, href: `${base}/gallery`, color: "bg-rose-50 text-[#e63946]" },
  ], [base, data]);
  const activity = liveEvents.length ? liveEvents : data?.recentEvents ?? [];

  return <div><PageHeader title="Dashboard" description="A live overview of your website operations." /><Feedback error={error} />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{cards.map(({ label, value, icon: Icon, href, color }) => <Link key={label} href={href} className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-start justify-between"><span className={`grid h-11 w-11 place-items-center rounded-xl ${color}`}><Icon className="h-5 w-5" /></span><FiArrowUpRight className="text-slate-300 transition group-hover:text-[#e63946]" /></div><p className="mt-5 text-3xl font-bold text-slate-950">{loading ? "—" : value}</p><p className="mt-1 text-xs font-medium text-slate-500">{label}</p></Link>)}</div>
    <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]"><Panel><PanelHeader title="Recent activity" subtitle="Latest changes across the admin workspace" /><div className="divide-y divide-slate-100 px-5">{activity.length ? activity.map((event) => <div key={event.id} className="grid gap-2 py-4 sm:grid-cols-[1fr_auto] sm:items-center"><div><p className="text-sm font-medium text-slate-800">{event.eventType.replaceAll("_", " ")}</p><p className="mt-1 text-xs text-slate-400">{event.entity} · {event.entityId.slice(0, 12)}</p></div><p className="text-xs text-slate-400">{new Date(event.createdAt).toLocaleString()}</p></div>) : <p className="py-12 text-center text-sm text-slate-400">No activity yet.</p>}</div></Panel>
      <Panel><PanelHeader title="System status" subtitle="Backend services used by this panel" /><div className="space-y-4 p-5">{["PostgreSQL database", "Admin authentication", "Realtime activity"].map((label) => <div key={label} className="flex items-center justify-between"><span className="text-sm text-slate-600">{label}</span><StatusBadge value={error ? "CHECK" : "ACTIVE"} /></div>)}</div></Panel></div>
  </div>;
}
