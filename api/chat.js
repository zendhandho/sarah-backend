import OpenAI from "openai";

console.log("🧠 Sarah's Vercel function is loaded");

export default async function handler(req, res) {
  console.log("📩 Incoming request:", req.method);
  console.log("🔐 API key exists:", !!process.env.OPENAI_API_KEY);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  const { userInput } = req.body;

  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ Missing OpenAI API key");
    return res.status(500).json({ error: "OpenAI API key is missing" });
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are Sarah, a warm and wise Zen Dhandho financial advisor. Use the Temple framework. Never give product recommendations. Offer clear, educational insight.",
        },
        { role: "user", content: userInput },
      ],
    });

    console.log("✅ GPT Response:", completion.choices[0].message.content);
    res.status(200).json({ answer: completion.choices[0].message.content });
  } catch (err) {
    console.error("🔥 OpenAI API call failed:", err.message);
    res.status(500).json({ error: "GPT failed", details: err.message });
  }
}
