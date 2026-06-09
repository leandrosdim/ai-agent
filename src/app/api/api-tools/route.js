import {
  streamText,
  tool,
  stepCountIs,
} from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { messagesSchema, validateBody } from "../_lib/validation";



const tools = {
  convertCurrency: tool({
    description: "Convert an amount from one currency to another (ECB rates via frankfurter.app).",
    inputSchema: z.object({
      amount: z.number().positive().describe("Amount to convert"),
      from: z.string().length(3).describe("From currency, 3-letter ISO (e.g., EUR, USD, JPY)"),
      to: z.string().length(3).describe("To currency, 3-letter ISO (e.g., USD, EUR, GBP)"),
    }),
    execute: async ({ amount, from, to }) => {
      const f = from.toUpperCase();
      const t = to.toUpperCase();

      const res = await fetch(
        `https://api.frankfurter.app/latest?amount=${encodeURIComponent(amount)}&from=${encodeURIComponent(f)}&to=${encodeURIComponent(t)}`,
        { cache: "no-store" }
      );
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Frankfurter error (${res.status}): ${text || "unknown"}`);
      }
      const data = await res.json();
      const converted = data?.rates?.[t];
      if (typeof converted !== "number") throw new Error(`Unable to convert ${f} -> ${t}`);

      const unitRes = await fetch(
        `https://api.frankfurter.app/latest?amount=1&from=${encodeURIComponent(f)}&to=${encodeURIComponent(t)}`,
        { cache: "no-store" }
      );
      const unitData = await unitRes.json();
      const unitRate = unitData?.rates?.[t];

      return {
        query: { amount, from: f, to: t },
        convertedAmount: converted,
        unitRate,
        date: data?.date,
        source: "frankfurter.app",
      };
    },
  }),
};

export async function POST(req) {
  try {
    const body = await req.json();
    const parsed = validateBody(messagesSchema, body);
    if (!parsed.ok) {
      return Response.json({ error: parsed.error }, { status: 400 });
    }

    const result = streamText({
      model: openai(process.env.OPENAI_MODEL || "gpt-4.1-mini"),
      messages: parsed.data.messages,
      tools,
      stopWhen: stepCountIs(2),
    });

    return result.toUIMessageStreamResponse();
  } catch (err) {
    console.error("[api-tools] error", err);
    return new Response(JSON.stringify({ error: "Failed to process request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}


