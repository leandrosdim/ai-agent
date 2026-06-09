import { streamText, tool, convertToModelMessages, stepCountIs } from "ai";
import { openai } from "@ai-sdk/openai";
import { messagesSchema, validateBody } from "../_lib/validation";

const SYSTEM_PROMPT = `
    You are a sharp, fast research assistant that answers precisely and cites sources when you browse.
    The user will give you some car characteristics and you need to find the price through this link: https://seaa.gr/meli-seaa/
    In every brand there is a link called "Τιμοκατάλογος" open it. It can be a pdf that will give you the price of the car or it can be a link to navigate to another page that you will find the price in another pdf there.
    Open pdf and return the retail price to the user.
    You cant use other sites. You must search through https://seaa.gr/meli-seaa/ or the domain that will open if you choose "Τιμοκαταλογοι".
    Bring only the last updated price you find and the final link of the pdf you found it.
    
    example 1.
    User:DET1 Qashqai TDNALG9J12HGAUA--C e-Power 190PS Techna 118 
    Agent:DET1 Qashqai TDNALG9J12HGAUA--C e-Power 190PS Techna 118
        - Retail price: €32,741.05 (LTΦ price with VAT/charges)  
        - Last updated: 04 February 2025
        - PDF link (source): https://www-europe.nissan-cdn.net/content/dam/Nissan/greece/LTPF/LTPF.pdf

        Source: Nissan LTΦ (Greece) PDF, updated 2025-02-04. ([www-europe.nissan-cdn.net](https://www-europe.nissan-cdn.net/content/dam/Nissan/greece/LTPF/LTPF.pdf))

    example 2.
    User: Porche 95BAM1_Macan-MY-20 20 95BBH1 Macan S 0Q Χρώμα μη μεταλλικό Λευκό-White
    Agent: Porche 95BAM1_Macan-MY-20 20 95BBH1 Macan S 0Q Χρώμα μη μεταλλικό Λευκό-White

        - Retail price: €51,000 (Macan base price for MY-20, color 0Q White has no additional charge)
        - Last updated: 04 July 2019
        - PDF link (source): https://motodynamics.gr/wp-content/uploads/2022/11/95BAM1_Macan-MY-20-1.pdf

        Source: MOTODYNAMIKI Porsche price list for Macan-MY-20, 95BAM1/Macan-MY-20, 04.07.2019. ([motodynamics.gr](https://motodynamics.gr/wp-content/uploads/2022/11/95BAM1_Macan-MY-20-1.pdf))
    `;

const tools = {
  web_search_preview: openai.tools.webSearchPreview({}),
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
      system: SYSTEM_PROMPT,
      messages: modelMessages,
      tools,
      stopWhen: stepCountIs(2),
    });

    return result.toUIMessageStreamResponse();
  } catch (err) {
    console.error("[web-search-tool-trial] error", err);
    return new Response(
      JSON.stringify({ error: "Failed to process search request" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}