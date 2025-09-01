import {
  streamText,
  tool,
  convertToModelMessages,
  stepCountIs,
} from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";



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

      // main conversion
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

      // unit rate for transparency (1 FROM -> TO)
      const unitRes = await fetch(
        `https://api.frankfurter.app/latest?amount=1&from=${encodeURIComponent(f)}&to=${encodeURIComponent(t)}`,
        { cache: "no-store" }
      );
      const unitData = await unitRes.json();
      const unitRate = unitData?.rates?.[t];

      return {
        query: { amount, from: f, to: t },
        convertedAmount: converted,
        unitRate,            // 1 FROM = unitRate TO
        date: data?.date,    // ECB rates date
        source: "frankfurter.app",
      };
    },
  }),
};

export async function POST(req) {
  try {
    const { messages } = await req.json();

    const result = streamText({
      // You can change to any model you have access to
      model: openai(process.env.OPENAI_MODEL || "gpt-4.1-mini"),
      messages: convertToModelMessages(messages),
      tools,
      // keep it short like your teacher’s example
      stopWhen: stepCountIs(2),
    });

    // IMPORTANT: UI message stream (matches DefaultChatTransport on client)
    return result.toUIMessageStreamResponse();
  } catch (err) {
    console.error("[api-tool] error", err);
    return new Response(JSON.stringify({ error: err?.message || "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}


