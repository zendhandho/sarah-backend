const express = require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const { OpenAI } = require("openai");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post('/api/chat', async (req, res) => {
  const { userInput } = req.body;

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are Sarah, a wise and patient financial advisor. You use the Zen Dhandho Financial Temple to guide clients based on their goals, risk tolerance, and purpose." },
        { role: "user", content: userInput }
      ]
    });

    const reply = completion.data.choices[0].message.content;
    res.json({ answer: reply });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error with OpenAI API');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Sarah's server is running on port ${PORT}`));
