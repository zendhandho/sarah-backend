import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  const { userInput } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are Sarah, a Zen Dhandho financial advisor using the Temple framework. You give educational financial insight only.",
        },
        { role: "user", content: userInput },
      ],
    });

    res.status(200).json({ answer: completion.choices[0].message.content });
  } catch (err) {
    console.error("OpenAI Error:", err.message);
    res.status(500).json({ error: "Something went wrong", details: err.message });
  }
}

