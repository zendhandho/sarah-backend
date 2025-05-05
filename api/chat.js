/**
 * api/chat.js  — Vercel Function
 * - Uses OpenAI GPT-3.5-Turbo
 * - Adds proper CORS handling so any web page can call it
 */

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY    // make sure this is set in Vercel
});

// --  Vercel Edge / Node 18  --------------------------------------------------

export default async function handler(req, res) {
  // 1️⃣  ANSWER THE CORS PREFLIGHT FIRST
  if (req.method === "OPTIONS") {
    return res
      .setHeader("Access-Control-Allow-Origin", "*")           // allow all origins; change '*' → 'https://zendhandho.com' in prod
      .setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
      .setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
      .status(200)
      .end();
  }

  if (req.method !== "POST") {
    return res
      .setHeader("Access-Control-Allow-Origin", "*")
      .status(405)
      .json({ error: "Method not allowed" });
  }

  try {
    const { userInput } = req.body || {};
    if (!userInput) {
      throw new Error("No userInput provided");
    }

    // 2️⃣  Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are Sarah, the friendly Zen Dhandho guide." },
        { role: "user", content: userInput }
      ]
    });

    const answer = completion.choices[0].message.content.trim();

    // 3️⃣  Send the answer back with CORS header
    res
      .setHeader("Access-Control-Allow-Origin", "*")
      .status(200)
      .json({ answer });
  } catch (err) {
    console.error("Chat error:", err);
    res
      .setHeader("Access-Control-Allow-Origin", "*")
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
}

/**
 * Optional (if you want Node 18 on Vercel):
 * export const config = { runtime: "nodejs18.x" };
 */
