/**
 * api/chat.js  – Vercel Serverless Function
 * POST  /api/chat   { "userInput": "<question>" }
 * Returns         { "answer"   : "<assistant reply>" }
 *
 * CORS: allows localhost:* and zendhandho.com
 * Change the ALLOWED_ORIGINS array to whatever domains you need.
 */

import OpenAI from "openai";

// 1) ————— env var must exist on Vercel  (Settings ▸ Environment Variables)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 2) ————— COMMA-separated list of domains you want to allow
const ALLOWED_ORIGINS = [
  "http://localhost:5173",          // dev server
  "http://127.0.0.1:5173",          // alt dev URL
  "https://zendhandho.com",         // prod site
];

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin)
      ? origin
      : "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

// 3) ————— Vercel handler
export default async function handler(req, res) {
  const origin = req.headers.origin || "null";

  // Handle the browser’s pre-flight
  if (req.method === "OPTIONS") {
    res.status(200).set(corsHeaders(origin)).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).set(corsHeaders(origin)).json({ error: "Method Not Allowed" });
    return;
  }

  // Parse payload
  const { userInput } = req.body || {};
  if (!userInput) {
    res.status(400).set(corsHeaders(origin)).json({ error: "No userInput" });
    return;
  }

  try {
    // 4) ——— call GPT-3.5
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are Sarah, the Zen Dhandho personal-finance guide." },
        { role: "user", content: userInput },
      ],
    });

    const answer = completion.choices[0]?.message?.content?.trim() || "Hmm…";

    res
      .status(200)
      .set(corsHeaders(origin))
      .json({ answer });
  } catch (err) {
    console.error("GPT error →", err);
    res
      .status(500)
      .set(corsHeaders(origin))
      .json({
        error: "GPT failed",
        details: err.message || err.toString(),
      });
  }
}
