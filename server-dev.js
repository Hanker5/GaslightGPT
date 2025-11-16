import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/api/chat', async (req, res) => {
  const { message, history } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'Invalid message' });
  }

  try {
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    const response = await client.chat.completions.create({
      model: model,
      messages: [
        ...(history || []),
        { role: 'user', content: message },
      ],
    });

    res.json({
      reply: response.choices[0].message.content,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error contacting ChatGPT' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🔥 Dev API server running on http://localhost:${PORT}`);
});
