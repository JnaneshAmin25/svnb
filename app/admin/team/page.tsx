"use client";

import { FormEvent, useEffect, useState } from "react";
import AdminState from "@/components/admin/AdminState";
import { fetchAdminJSON } from "@/lib/admin/fetch";
import type { AdminTeamMember } from "@/lib/admin/types";

type TeamPayload = { items: AdminTeamMember[] };

export default function AdminTeamPage() {
  const [state, setState] = useState<"idle" | "loading" | "success" | "empty" | "error">("idle");
  const [message, setMessage] = useState("");
  const [rows, setRows] = useState<AdminTeamMember[]>([]);

  const load = async () => {
    setState("loading");
    const result = await fetchAdminJSON<TeamPayload>("/api/admin/team");
    if (result.state === "success" && result.data) {
      const items = result.data.items || [];
      setRows(items);
      setState(items.length ? "success" : "empty");
      return;
    }

    setState(result.state === "empty" ? "empty" : "error");
    setMessage(result.message || "Unable to load team.");
  };

  useEffect(() => {
    void load();
  }, []);

  const createMember = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const payload = {
      fullName: String(data.get("fullName") || ""),
      phone: String(data.get("phone") || ""),
      roleName: String(data.get("roleName") || ""),
      isActive: String(data.get("isActive") || "true") === "true",
      displayOrder: Number(data.get("displayOrder") || 0),
    };

    const result = await fetchAdminJSON("/api/admin/team", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (result.state !== "success") {
      setState("error");
      setMessage(result.message || "Unable to create team member.");
      return;
    }

    event.currentTarget.reset();
    await load();
    setState("success");
    setMessage("Team member added.");
  };

  const updateMember = async (member: AdminTeamMember, form: HTMLFormElement) => {
    const data = new FormData(form);
    const payload = {
      fullName: String(data.get("fullName") || member.fullName || ""),
      phone: String(data.get("phone") || member.phone || ""),
      roleName: String(data.get("roleName") || member.roleName),
      displayOrder: Number(data.get("displayOrder") || 0),
      isActive: String(data.get("isActive") || "false") === "true",
    };

    const response = await fetchAdminJSON(`/api/admin/team/${member.id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });

    if (response.state !== "success") {
      setState("error");
      setMessage(response.message || "Unable to update team member.");
      return;
    }

    await load();
  };

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-title text-zinc-900">Team Management</h2>

      <section className="rounded-sm border border-zinc-200 bg-white p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-700">Add team member</h3>
        <form onSubmit={createMember} className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input name="fullName" required placeholder="Full Name" className="rounded-sm border border-zinc-300 px-3 py-2 text-sm" />
          <input name="phone" required placeholder="Phone" className="rounded-sm border border-zinc-300 px-3 py-2 text-sm" />
          <input name="roleName" required placeholder="Role" className="rounded-sm border border-zinc-300 px-3 py-2 text-sm" />
          <input name="displayOrder" type="number" min={0} defaultValue={0} className="rounded-sm border border-zinc-300 px-3 py-2 text-sm" />
          <button type="submit" className="rounded-sm bg-[#e63946] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white sm:col-span-2">
            Add member
          </button>
        </form>
      </section>

      <AdminState state={state} message={message} />

      <section className="rounded-sm border border-zinc-200 bg-white p-4">
        {state === "success" ? (
          <div className="grid gap-3">
            {rows.map((member) => (
              <form
                key={member.id}
                onSubmit={(event) => {
                  event.preventDefault();
                  void updateMember(member, event.currentTarget);
                }}
                className="grid grid-cols-1 gap-2 rounded-sm border border-zinc-200 p-3 sm:grid-cols-6"
              >
                <input
                  name="fullName"
                  defaultValue={member.fullName || ""}
                  className="rounded-sm border border-zinc-300 px-3 py-2 text-sm sm:col-span-2"
                />
                <input
                  name="phone"
                  defaultValue={member.phone || ""}
                  className="rounded-sm border border-zinc-300 px-3 py-2 text-sm sm:col-span-2"
                />
                <input
                  name="roleName"
                  defaultValue={member.roleName}
                  className="rounded-sm border border-zinc-300 px-3 py-2 text-sm sm:col-span-2"
                />
                <input
                  name="displayOrder"
                  type="number"
                  defaultValue={member.displayOrder}
                  className="rounded-sm border border-zinc-300 px-3 py-2 text-sm sm:col-span-1"
                />
                <label className="col-span-1 text-xs font-medium text-zinc-700 sm:col-span-1">
                  <input
                    name="isActive"
                    type="checkbox"
                    defaultChecked={member.isActive}
                    value="true"
                    className="mr-2"
                  />
                  Active
                </label>
                <button type="submit" className="col-span-1 rounded-sm bg-[#e63946] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white">
                  Update
                </button>
              </form>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}

