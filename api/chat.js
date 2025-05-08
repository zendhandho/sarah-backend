/*  /api/chat.js  – Serverless Function for Vercel (Node 18 runtime)
   ────────────────────────────────────────────────────────────────
   POST  { userInput: "..." }  ➜  returns { answer: "..." }
   Adds CORS headers (localhost + zendhandho.com) so browsers don’t block the call.
*/

import OpenAI from "openai";

// ——— CONFIG ———
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY        // set this in Vercel → Settings → Environment
});

// Replace / add more origins if you need them
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://zendhandho.com",
  "https://www.zendhandho.com"
];

// ——— Helpers ———
function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}
function applyCors(res, origin) {
  Object.entries(corsHeaders(origin)).forEach(([k, v]) => res.setHeader(k, v));
}

// ——— Main handler ———
export default async function handler(req, res) {
  const origin = req.headers.origin ?? "null";

  // ① PRE-FLIGHT
  if (req.method === "OPTIONS") {
    applyCors(res, origin);
    res.status(200).end();
    return;
  }

  // ② ONLY allow POST
  if (req.method !== "POST") {
    applyCors(res, origin);
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  // ③ BODY validation
  const { userInput } = req.body || {};
  if (!userInput || typeof userInput !== "string") {
    applyCors(res, origin);
    res.status(400).json({ error: "Request must include JSON { userInput }" });
    return;
  }

  try {
    // ④ Your business logic — ask OpenAI
    const chat = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: userInput }]
    });
    const answer = chat.choices?.[0]?.message?.content?.trim() || "(no answer)";

    applyCors(res, origin);
    res.status(200).json({ answer });
  } catch (err) {
    console.error(err);
    applyCors(res, origin);
    res.status(500).json({ error: "AI request failed" });
  }
}
