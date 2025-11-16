import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize client lazily to avoid crashes when API key is missing
let client = null;

function getClient() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY environment variable is not set');
  }
  if (!client) {
    client = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return client;
}

app.post('/api/chat', async (req, res) => {
  const { message, history } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'Invalid message' });
  }

  try {
    const apiClient = getClient();
    const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

    const response = await apiClient.chat.completions.create({
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
    if (err.message.includes('GROQ_API_KEY')) {
      res.status(500).json({ error: 'GROQ_API_KEY is not configured. Please add it to your .env file.' });
    } else {
      res.status(500).json({ error: 'Error contacting Groq' });
    }
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🔥 Dev API server running on http://localhost:${PORT}`);
});
