// api/chat.js
// ──────────────────────────────────────────────────────────────
// Serverless function for Vercel (Node.js 18 runtime)
//
// • Accepts POST { userInput: "…" }
// • Returns { answer: "…" }
// • Adds CORS headers so browsers don’t block the call.
// ──────────────────────────────────────────────────────────────

/*  ░░░ CONFIG ░░░  */
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://zendhandho.com",
  "https://www.zendhandho.com",
];

/*  ░░░ CORS helpers ░░░  */
function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin)
      ? origin
      : "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function applyCors(res, origin) {
  const headers = corsHeaders(origin);
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
}

/*  ░░░ MAIN HANDLER ░░░  */
export default async function handler(req, res) {
  const origin = req.headers.origin || "null";

  // ── 1)  PRE-FLIGHT  ────────────────────────────────────────
  if (req.method === "OPTIONS") {
    applyCors(res, origin);
    res.status(200).end();
    return;
  }

  // ── 2)  METHOD CHECK  ──────────────────────────────────────
  if (req.method !== "POST") {
    applyCors(res, origin);
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  // ── 3)  BODY VALIDATION  ───────────────────────────────────
  const { userInput = "" } = req.body || {};
  if (typeof userInput !== "string") {
    applyCors(res, origin);
    res.status(400).json({ error: "Request must include JSON { userInput }" });
    return;
  }

  // ── 4)  ACTUAL ANSWER  ─────────────────────────────────────
  // TODO: replace this stub with a real OpenAI call.
  const answer = `You said: ${userInput}`;

  // ── 5)  RESPONSE  ──────────────────────────────────────────
  applyCors(res, origin);
  res.status(200).json({ answer });
}
