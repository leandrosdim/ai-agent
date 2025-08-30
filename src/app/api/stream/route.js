import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req) {
  try {

    const { prompt } = await req.json(); //take the prompt from the request

    const result =  streamText({ //use streamText in order for the user not to wait for generating the whole text
      model: openai("gpt-4.1-nano"),
      prompt
    });


    //understanding tokens and pricing
    result.usage.then((usage) => {
        console.log('This is the usage->', {
            inputTokens: usage.inputTokens,
            outputTokens: usage.outputTokens,
            totalTokens: usage.totalTokens,
        })

    })

  return result.toUIMessageStreamResponse();  //method for returning Stream to the user  

  } catch (error) {//error handling
    console.error("Error streaming text->", error);
    return new Response.json({error: "Failed to stream text"}, {status: 500});
  }
 
}
