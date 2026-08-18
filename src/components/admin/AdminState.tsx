type Props = {
  state: "idle" | "loading" | "success" | "empty" | "error";
  message?: string;
};

export default function AdminState({ state, message }: Props) {
  if (state === "idle" || state === "loading") {
    return <p className="rounded border border-zinc-200 bg-white p-4 text-sm text-zinc-600">Loading...</p>;
  }

  if (state === "error") {
    return <p className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">{message || "Something went wrong"}</p>;
  }

  if (state === "empty") {
    return <p className="rounded border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">{message || "No records found."}</p>;
  }

  return null;
}

