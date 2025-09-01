import {
  streamText,
  tool,
  convertToModelMessages,
  stepCountIs,
} from "ai";
import { openai } from "@ai-sdk/openai";



const tools = {
    web_search_preview: openai.tools.webSearchPreview({})
};

export async function POST(req) {
  try {
    const { messages } = await req.json();

    const result = streamText({
      // You can change to any model you have access to
      model: openai.responses("gpt-5-nano"),
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


