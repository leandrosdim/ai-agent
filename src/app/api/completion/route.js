import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { promptSchema, validateBody } from "../_lib/validation";

export async function POST(req) {
  try {
    const body = await req.json();
    const parsed = validateBody(promptSchema, body);
    if (!parsed.ok) {
      return Response.json({ error: parsed.error }, { status: 400 });
    }

    const result = await generateText({
      model: openai("gpt-4.1-nano"),
      prompt: parsed.data.prompt,
      system: "You are a helpful AI. Always provide a single, concise one-shot answer without asking follow-up questions."
    });

    return Response.json({ text: result.text });

  } catch (error) {
    console.error("Error generating text:", error);
    return Response.json({ error: "Failed to generate text" }, { status: 500 });
  }
}
