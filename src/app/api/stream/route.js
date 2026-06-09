import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { promptSchema, validateBody } from "../_lib/validation";

export async function POST(req) {
  try {
    const body = await req.json();
    const parsed = validateBody(promptSchema, body);
    if (!parsed.ok) {
      return Response.json({ error: parsed.error }, { status: 400 });
    }

    const result = streamText({
      model: openai("gpt-4.1-nano"),
      prompt: parsed.data.prompt,
    });

    return result.toUIMessageStreamResponse();

  } catch (error) {
    console.error("Error streaming text:", error);
    return new Response.json({ error: "Failed to stream text" }, { status: 500 });
  }
}
