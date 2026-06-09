import {
  streamText,
  tool,
  convertToModelMessages,
  stepCountIs,
} from "ai";
import { openai } from "@ai-sdk/openai";
import { messagesSchema, validateBody } from "../_lib/validation";



const tools = {
    web_search_preview: openai.tools.webSearchPreview({})
};

export async function POST(req) {
  try {
    const body = await req.json();
    const parsed = validateBody(messagesSchema, body);
    if (!parsed.ok) {
      return Response.json({ error: parsed.error }, { status: 400 });
    }

    const modelMessages = await convertToModelMessages(parsed.data.messages);

    const result = streamText({
      model: openai.responses("gpt-5-nano"),
      messages: modelMessages,
      tools,
      stopWhen: stepCountIs(2),
    });

    return result.toUIMessageStreamResponse();
  } catch (err) {
    console.error("[web-search-tool] error", err);
    return new Response(JSON.stringify({ error: "Failed to process search request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}