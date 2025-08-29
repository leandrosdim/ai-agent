import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST() {
  const result = await generateText({
    model: openai("gpt-4.1-nano"),
    prompt: "Explain what an LLM is in simple terms"
  });

  return Response.json({ text: result.text });
}
