const { OpenAI } = require("openai");

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
            "You are Sarah, a CFP-level Zen Dhandho advisor. You explain concepts using the Zen Temple method and never give product-specific investment advice.",
        },
        { role: "user", content: userInput },
      ],
    });

    res.status(200).json({ answer: completion.choices[0].message.content });
  } catch (err) {
    console.error("OpenAI Error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
}
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Sarah's server is running on port ${PORT}`));
