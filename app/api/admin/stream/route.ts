import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { listAdminEvents } from "@/lib/stream/adminEvents";

export const runtime = "nodejs";

const HEARTBEAT_MS = 12000;

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) return new Response("unauthorized", { status: 401 });

  const since = request.nextUrl.searchParams.get("since") || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  let last = since;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = async () => {
        const events = await listAdminEvents(last, 50);
        for (const item of events) {
          const payload = JSON.stringify({
            id: item.id,
            type: item.eventType,
            entity: item.entity,
            entityId: item.entityId,
            payload: item.payload,
            createdAt: item.createdAt,
          });
          controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
          last = item.createdAt.toISOString();
        }
      };

      await send();

      const interval = setInterval(async () => {
        try {
          await send();
        } catch {
          // noop
        }
      }, 3500);

      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(`: keep-alive\n\n`));
      }, HEARTBEAT_MS);

      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        clearInterval(heartbeat);
      });
    },
  });

  return new Response(stream, {
    headers: {
      "cache-control": "no-cache",
      "connection": "keep-alive",
      "content-type": "text/event-stream",
      "x-accel-buffering": "no",
      "Access-Control-Allow-Origin": request.headers.get("origin") || "*",
    },
  });
}
