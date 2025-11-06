import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // Handle preflight
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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

    res.status(200).json({
      reply: response.choices[0].message.content,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error contacting ChatGPT" });
  }
}
