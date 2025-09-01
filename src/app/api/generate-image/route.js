// app/api/generate-image/route.js
import { openai } from "@ai-sdk/openai";
import { experimental_generateImage as generateImage } from "ai";

export async function POST(req) {
  try {
      const { prompt, size: rawSize = "1024x1024", style = "vivid" } = await req.json();
      const allowed = new Set(["1024x1024", "1024x1792", "1792x1024", "512x512", "768x768"]);
      const size = allowed.has(rawSize) ? rawSize : "1024x1024";

    const result = await generateImage({
      model: openai.imageModel("dall-e-3"),
      prompt,
      size,
      providerOptions: {
        openai: { style, quality: "hd" },
      },
    });

  

    const base64 =
      (typeof result?.image === "string" && result.image) ||
      result?.image?.base64 ||
      result?.images?.[0]?.base64 ||
      null;

    if (!base64) {
      return Response.json({ error: "No image data" }, { status: 500 });
    }

    return Response.json({ image: base64, usage }); // you can return usage to frontend if needed
  } catch (error) {
    console.error("Error generating image ->", error);
    return Response.json({ error: "Failed to generate image" }, { status: 500 });
  }
}
