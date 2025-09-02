import { NextResponse } from "next/server";


const MY_INSTRUCTIONS = `
You are my realtime voice assistant for the AI Super Agent app.
• Keep answers brief and practical (10-25 seconds max).
• If I speak Greek, answer in Greek. Otherwise, use English.
• Prefer step-by-step guidance only when I ask “explain” or “why”.
• When unsure, ask a short clarifying question rather than guessing.

`;

export async function GET() {
    try {
        if (!process.env.OPENAI_API_KEY) {
            console.error("[realtime/secret] Missing OPENAI_API_KEY");
            return NextResponse.json({ error: "OPENAI_API_KEY missing" }, { status: 500 });
        }

        const r = await fetch("https://api.openai.com/v1/realtime/sessions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json",
                "OpenAI-Beta": "realtime=v1",
            },
            body: JSON.stringify({
                model: "gpt-realtime",
                voice: "alloy",
                turn_detection: { type: "server_vad" },
                max_response_output_tokens: 250,
                instructions: MY_INSTRUCTIONS.trim(), // always use my instructions
            }),
        });


        if (!r.ok) {
            const errText = await r.text();
            console.error("[realtime/secret] OpenAI error:", errText);
            return NextResponse.json({ error: errText }, { status: 500 });
        }

        const json = await r.json(); // contains client_secret.value
        //console.log("[realtime/secret] session resp:", json);
        return NextResponse.json(json);
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
