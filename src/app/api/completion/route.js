import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req) {
  try {
    const { prompt } = await req.json();
    const result = await generateText({
      model: openai("gpt-4.1-nano"),
      prompt,
      system: "You are a helpful AI. Always provide a single, concise one-shot answer without asking follow-up questions."
    });

  return Response.json({ text: result.text });
    
  } catch (error) {
    console.error("error generating text->",error);
    return Response.json({error: "Failed to generate text"}, {status: 500});
  }
 
}
