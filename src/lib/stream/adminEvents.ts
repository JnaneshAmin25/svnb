import { db } from "@/lib/db/client";
import { AdminEventType, Prisma } from "@prisma/client";

export type AdminEventPayload = Prisma.InputJsonObject;

export async function emitAdminEvent(params: {
  actorId?: string | null;
  eventType: AdminEventType;
  entity: string;
  entityId: string;
  payload?: AdminEventPayload;
}) {
  try {
    await db.adminEvent.create({
      data: {
        actorId: params.actorId ?? null,
        eventType: params.eventType,
        entity: params.entity,
        entityId: params.entityId,
        payload: params.payload ? params.payload : undefined,
      },
    });
  } catch {
    return;
  }
}

export async function listAdminEvents(since: string, limit = 50) {
  const sinceDate = new Date(since || 0);
  const cap = Math.min(limit || 100, 100);
  return db.adminEvent.findMany({
    where: {
      createdAt: {
        gt: sinceDate,
      },
    },
    orderBy: { createdAt: "asc" },
    take: cap,
  });
}
