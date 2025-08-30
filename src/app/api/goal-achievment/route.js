import { openai } from "@ai-sdk/openai";
import { projectSchema } from "./schema"; //take the shema we have already created
import { streamObject } from "ai"; //use streamObject for structured data analysis


export async function POST(req) {
    try {

        const { project } = await req.json();

        console.log({project});

        const result = streamObject({
            model: openai("gpt-5-nano"),
            schema: projectSchema,
            prompt:
                `Generate a plan for this project: ${project}. Split into tasks and estimate hours for each. ` +
                `Also include a "details" field per task (succinct steps, tools, tips).`

        })

        //understanding tokens and pricing
        result.usage.then((usage) => {
            console.log('This is the usage->', {
                inputTokens: usage.inputTokens,
                outputTokens: usage.outputTokens,
                totalTokens: usage.totalTokens,
            })

        })

        //console.log('result', result);

        return result.toTextStreamResponse();

    } catch (error) {
        console.error("Error generating project tasks:", error);
        return new Response("Failed to generate  project tasks", { status: 500 });
    }
}