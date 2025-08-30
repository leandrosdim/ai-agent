import { streamText,convertToModelMessages, UIMessage } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req) {
  try {

    const { messages } = await req.json(); //take the prompt from the request

    const result =  streamText({ //use streamText in order for the user not to wait for generating the whole text
      model: openai("gpt-4.1-nano"),
      messages: [
        { 
          role: 'system',
          content: 'You are a clever bot for presentation of web app chatbot. Keep answers to max 3 sentences.'
        },
        ...convertToModelMessages(messages),
      ]
    });


    //understanding tokens and pricing
    result.usage.then((usage) => {
        console.log('This is the usage->', {
            messageCount: messages.length,
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
