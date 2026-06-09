import { z } from "zod";

export const promptSchema = z.object({
  prompt: z.string().min(1).max(4000),
});

export const messagesSchema = z.object({
  messages: z.array(z.any()).min(1).max(100),
});

export const projectSchema = z.object({
  project: z.string().min(1).max(2000),
});

export function validateBody(schema, body) {
  const result = schema.safeParse(body);
  if (!result.success) {
    const errors = result.error.issues.map((i) => i.message).join(", ");
    return { ok: false, error: errors };
  }
  return { ok: true, data: result.data };
}