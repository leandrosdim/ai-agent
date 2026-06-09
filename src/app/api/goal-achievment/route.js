import { openai } from "@ai-sdk/openai";
import { projectSchema } from "./schema";
import { streamObject } from "ai";
import { validateBody, projectSchema as projectInputSchema } from "../_lib/validation";

export async function POST(req) {
    try {
        const body = await req.json();
        const parsed = validateBody(projectInputSchema, body);
        if (!parsed.ok) {
            return new Response(JSON.stringify({ error: parsed.error }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const result = streamObject({
            model: openai("gpt-5-nano"),
            schema: projectSchema,
            prompt:
                `Generate a plan for this project: ${parsed.data.project}. Split into tasks and estimate hours for each. ` +
                `Also include a "details" field per task (succinct steps, tools, tips).`,
        });

        return result.toTextStreamResponse();

    } catch (error) {
        console.error("Error generating project tasks:", error);
        return new Response(JSON.stringify({ error: "Failed to generate project tasks" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}