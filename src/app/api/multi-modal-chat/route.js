import { streamText, convertToModelMessages } from "ai";
import { openai } from "@ai-sdk/openai";
import { messagesSchema, validateBody } from "../_lib/validation";

export async function POST(req) {
  try {
    const body = await req.json();
    const parsed = validateBody(messagesSchema, body);
    if (!parsed.ok) {
      return Response.json({ error: parsed.error }, { status: 400 });
    }

    const modelMessages = await convertToModelMessages(parsed.data.messages);

    const result = streamText({
      model: openai("gpt-4.1-nano"),
      system: 'You are a clever bot for presentation of web app chatbot. Keep answers to max 3 sentences.',
      messages: modelMessages,
    });

    return result.toUIMessageStreamResponse();

  } catch (error) {
    console.error("Error streaming text:", error);
    return Response.json({ error: "Failed to stream text" }, { status: 500 });
  }
}