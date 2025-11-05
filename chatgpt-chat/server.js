import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Security headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

// Serve static files from project root (one level up from this server folder)
const staticRoot = path.resolve(process.cwd(), "..");
app.use(express.static(staticRoot));

// Runtime config endpoint (returns non-sensitive runtime values)
app.get("/config", (req, res) => {
  res.json({ port: process.env.PORT || null });
});

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;

  // Input validation
  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({ error: "Invalid message: message must be a non-empty string" });
  }

  if (history && !Array.isArray(history)) {
    return res.status(400).json({ error: "Invalid history: must be an array" });
  }

  // Validate history array items if provided
  if (history) {
    for (const msg of history) {
      if (!msg.role || !msg.content || typeof msg.content !== "string") {
        return res.status(400).json({ error: "Invalid history format: each message must have role and content" });
      }
    }
  }

  try {
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    const response = await client.chat.completions.create({
      model: model,
      messages: [
        ...(history || []),
        { role: "user", content: message },
      ],
    });

    res.json({
      reply: response.choices[0].message.content,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error contacting ChatGPT" });
  }
});

app.listen(process.env.PORT, () => console.log("Server running on http://localhost:" + process.env.PORT));
