import { z } from "zod";

export function safeJson<T>(schema: z.ZodType<T>, payload: unknown): T {
  return schema.parse(payload);
}

