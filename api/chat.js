// api/chat.js
//
// Serverless function for Vercel (Node.js 18 runtime)
// --------------------------------------------------
// • Accepts POST { userInput: "..." }                |
// • Calls OpenAI chat-completion (GPT-3.5/4)         |
// • Returns { answer: "..." }                        |
// • Adds CORS headers for localhost:5173 and         |
//   zendhandho.com so browsers don’t block the call. |
// --------------------------------------------------

import OpenAI from "openai";

// ---------- CONFIG -----------------------------------------------------------
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // set this in your Vercel “Environment Variables”
});

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://zendhandho.com",
];
// ---------------------------------------------------------------------------

// Helper: build the header object for a given request origin
function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin)
      ? origin
      : "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

// Helper: attach those headers to the Vercel response object
function applyCors(res, origin) {
  const headers = corsHeaders(origin);
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
}

// ---------------------------------------------------------------------------
// Main handler
export default async function handler(req, res) {
  const origin = req.headers.origin || "null";

  // ----- 1) PRE-FLIGHT ------------------------------------------------------
  if (req.method === "OPTIONS") {
    applyCors(res, origin);
    res.status(200).end();
    return;
  }

  // ----- 2) METHOD CHECK ----------------------------------------------------
  if (req.method !== "POST") {
    applyCors(res, origin);
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  // ----- 3) BODY VALIDATION -------------------------------------------------
  const { userInput } = req.body || {};
  if (!userInput || typeof userInput !== "string") {
    applyCors(res, origin);
    res.status(400).json({ error: "Request must include JSON { userInput }" });
    return;
  }

  // ----- 4) CALL OPENAI -----------------------------------------------------
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // or "gpt-4o" if your key has access
      messages: [
        {
          role: "system",
          content:
            "You are Sarah, the friendly Zen Dhandho financial guide. " +
            "Answer clearly, simply, and with a calm tone.",
        },
        { role: "user", content: userInput },
      ],
      temperature: 0.7,
    });

    const answer = completion.choices[0]?.message?.content || "Sorry, no answer";

    applyCors(res, origin);
    res.status(200).json({ answer });
  } catch (err) {
    console.error("OpenAI error →", err);
    applyCors(res, origin);
    res.status(500).json({
      error: "GPT failed",
      details: err.message || String(err),
    });
  }
}
