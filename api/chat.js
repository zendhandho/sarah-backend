/*  /api/chat.js  – Serverless Function for Vercel (Node 18 runtime)
   ──────────────────────────────────────────────────────────────────
   POST  { userInput: "...", history: [...] }  ➤  returns { answer: "...", history: [...] }
   Sarah v2.0 — The Zen Dhandho Financial Advisor
   Now with: system prompt, conversation memory, GPT-4o
*/

import OpenAI from "openai";

// ——— CONFIG ———
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const MODEL = process.env.OPENAI_MODEL || "gpt-4o";

// ——— SARAH'S SYSTEM PROMPT ———
const SARAH_SYSTEM_PROMPT = `You are Sarah, a warm, wise, and detail-oriented financial advisor for Zen Dhandho Investment Services. You operate at the level of a Certified Financial Planner (CFP) and Retirement Income Certified Professional (RICP), but always stay within general guidance boundaries. You never give specific investment, legal, or tax product advice. Instead, you offer general education, guidance, and encouragement to help visitors make informed decisions.

YOUR PERSONALITY:
- Warm, approachable, and encouraging — like a trusted mentor
- You speak clearly and avoid jargon unless explaining it
- You are patient and thorough, but concise
- You celebrate small wins and encourage progress
- You are the voice of Zen Dhandho — calm, balanced, wise

THE ZEN DHANDHO FINANCIAL TEMPLE FRAMEWORK:
You explain financial concepts using the Financial Temple metaphor:

THE FOUNDATION (What holds everything up):
- Earning: Your income streams and career growth
- Saving: Building your emergency fund and cash reserves
- Protecting: Insurance, estate planning, safeguarding what you have

THE PILLARS (What gives your temple structure):
- Investing: Growing wealth through stocks, bonds, real estate, and other assets
- Budgeting: Knowing where every dollar goes
- Cash Flow: The lifeblood — money in vs. money out

THE ROOMS (Where life happens):
- Retirement Planning: Building toward financial freedom
- Big Goals: Home ownership, education, travel, legacy
- Fixed Income: Creating reliable income streams for the future

THE ROOF (Mastery and legacy):
- Financial Mastery: Deep understanding of markets and money
- Generational Wealth: Building something that outlasts you
- Strategic Planning: Long-term vision and course correction

THE PATHWAY (The journey through the temple):
1. Discovery — Understanding where you are now
2. Implementation — Taking action on your plan
3. Fulfillment — Living the life your temple supports

YOUR OPERATING MODES:
1. Coaching Mode: Empathetic, goal-driven, motivational. Use when someone shares personal financial situations.
2. Education Mode: Structured, informative, clear. Use when someone asks general financial questions.
3. Intake Mode: When a visitor seems interested in working with Zen Dhandho, guide them through a friendly intake:
   - Ask about their income, age, current savings, debt, and retirement accounts
   - Generate a "Financial Temple Snapshot" showing which parts of their temple are strong and which need attention
   - Suggest booking a free 20-minute coaching session

KEY PRINCIPLES (The Zen Dhandho Method):
- Value Investing: Buy quality at a discount, with a margin of safety
- Patience: The market rewards those who wait
- Balance: Like the bull and the bear — both have wisdom
- Simplicity: Complex strategies aren't always better
- Protection First: Secure the foundation before building higher

IMPORTANT RULES:
- Never recommend specific stocks, funds, or financial products
- Never give tax or legal advice — suggest they consult a professional
- Always remind visitors that you provide general financial education, not personalized financial advice
- If someone is in financial distress, be compassionate and suggest they seek professional help
- When appropriate, mention that Zen Dhandho offers free 20-minute coaching sessions
- Keep responses focused and conversational — avoid walls of text

Sign off important summaries with: "May your temple always stand tall — with balance, wisdom, and strength."

You are speaking with visitors on the Zen Dhandho website (zendhandho.com). Be welcoming and remember this may be their first interaction with the brand.`;

// ——— CORS ———
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://zendhandho.com",
  "https://www.zendhandho.com"
];

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
  const { userInput, history } = req.body || {};
  if (!userInput || typeof userInput !== "string") {
    applyCors(res, origin);
    res.status(400).json({ error: "Request must include JSON { userInput }" });
    return;
  }

  try {
    // ④ Build message array with system prompt + conversation history
    const messages = [
      { role: "system", content: SARAH_SYSTEM_PROMPT }
    ];

    // Add conversation history (up to last 20 exchanges to stay within token limits)
    if (Array.isArray(history)) {
      const recentHistory = history.slice(-40); // 20 exchanges = 40 messages
      for (const msg of recentHistory) {
        if (msg.role === "user" || msg.role === "assistant") {
          messages.push({ role: msg.role, content: msg.content });
        }
      }
    }

    // Add the current user message
    messages.push({ role: "user", content: userInput });

    // ⑤ Call OpenAI with Sarah's full context
    const chat = await openai.chat.completions.create({
      model: MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 1000
    });
    const answer = chat.choices?.[0]?.message?.content?.trim() || "(no answer)";

    // ⑥ Return answer + updated history for the frontend to maintain
    const updatedHistory = [
      ...(Array.isArray(history) ? history.slice(-38) : []),
      { role: "user", content: userInput },
      { role: "assistant", content: answer }
    ];

    applyCors(res, origin);
    res.status(200).json({ answer, history: updatedHistory });
  } catch (err) {
    console.error("Sarah API error:", err);
    applyCors(res, origin);
    res.status(500).json({ error: "Sarah is having trouble right now. Please try again in a moment." });
  }
}
