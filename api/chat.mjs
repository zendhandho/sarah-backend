import OpenAI from "openai";

console.log("🧠 Sarah's Vercel function is online");

export default async function handler(req, res) {
  console.log("📩 Request received:", req.method);
  console.log("🔐 API key exists:", !!process.env.OPENAI_API_KEY);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  const { userInput } = req.body;

  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ Missing OpenAI API key");
    return res.status(500).json({ error: "API key is missing" });
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are Sarah, a warm, patient Zen Dhandho financial guide. You explain concepts clearly using the Financial Temple framework and never give direct financial advice—only education.",
        },
        { role: "user", content: userInput },
      ],
    });

    res.status(200).json({ answer: completion.choices[0].message.content });
  } catch (err) {
    console.error("🔥 OpenAI API Error:", err.message);
    res.status(500).json({ error: "GPT failed", details: err.message });
  }
}