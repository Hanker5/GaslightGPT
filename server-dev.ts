import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { kv } from './lib/kv.js';
import type { ShareRequest, ShareResponse, SharedConversation, ShareError } from './src/types/index.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Provider configurations with baseURL and default models
const PROVIDERS = {
  groq: {
    baseURL: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
  },
  openrouter: {
    baseURL: 'https://openrouter.ai/api/v1',
    defaultModel: 'meta-llama/llama-3.2-3b-instruct:free',
  },
  together: {
    baseURL: 'https://api.together.xyz/v1',
    defaultModel: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
  },
  openai: {
    baseURL: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
  },
} as const;

type ProviderName = keyof typeof PROVIDERS;

app.post('/api/chat', async (req, res) => {
  const { message, history, apiProvider = 'groq', apiKey, model } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'Invalid message' });
  }

  // Validate API provider
  if (!PROVIDERS[apiProvider as ProviderName]) {
    return res.status(400).json({ error: 'Invalid API provider' });
  }

  // Get provider configuration (now TypeScript knows apiProvider is valid)
  const config = PROVIDERS[apiProvider as ProviderName];

  // For GROQ: use environment variable if no API key provided
  // For other providers: require user-provided API key
  let effectiveApiKey = apiKey;
  if (apiProvider === 'groq' && !effectiveApiKey) {
    effectiveApiKey = process.env.GROQ_API_KEY;
  }

  if (!effectiveApiKey) {
    return res.status(400).json({
      error: apiProvider === 'groq'
        ? 'GROQ_API_KEY environment variable not set'
        : `API key required for ${apiProvider}`
    });
  }

  try {
    // Create OpenAI client with provider-specific baseURL
    const client = new OpenAI({
      baseURL: config.baseURL,
      apiKey: effectiveApiKey,
    });

    // Use provided model or provider's default model
    const selectedModel = model || config.defaultModel;

    const response = await client.chat.completions.create({
      model: selectedModel,
      messages: [
        ...(history || []).map((msg: any) => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content
        })),
        { role: 'user' as const, content: message },
      ],
    });

    res.json({
      reply: response.choices[0].message.content,
    });
  } catch (err) {
    console.error(err);
    const errorMessage = err instanceof Error ? err.message : 'Error contacting API';
    res.status(500).json({ error: errorMessage });
  }
});

/**
 * ============================================================
 * SHARE ROUTES
 * ============================================================
 *
 * These routes handle creating and retrieving shared chats.
 * Learn about REST API design, UUID generation, and database storage.
 */

/**
 * POST /api/share - Create a new shared chat
 *
 * REST Pattern Analysis:
 * - Method: POST (creating a new resource)
 * - URL: /api/share (collection endpoint, no ID yet)
 * - Request body: Full conversation data
 * - Response: 201 Created with share metadata
 * - Error responses: 400 Bad Request, 500 Internal Server Error
 *
 * Security Considerations:
 * - Use UUID v4 for unpredictable IDs (prevents enumeration)
 * - Store expiration timestamp (30 days)
 * - Validate conversation structure before storing
 *
 * @request {ShareRequest} - Contains conversation to share
 * @response {ShareResponse} - Share ID, URL, and expiration
 */
app.post('/api/share', async (req, res) => {
  console.log('[POST /api/share] Share creation request received');

  // Type assertion for better IDE support
  // In production, you'd use validation library like Zod or Joi
  const { conversation } = req.body as ShareRequest;

  // ===== VALIDATION =====
  // Always validate input! Never trust client data.

  if (!conversation) {
    console.error('[POST /api/share] Missing conversation in request body');
    return res.status(400).json({
      error: 'Missing conversation data'
    } as ShareError);
  }

  // Validate conversation structure
  if (!conversation.id || !conversation.title || !Array.isArray(conversation.messages)) {
    console.error('[POST /api/share] Invalid conversation structure');
    return res.status(400).json({
      error: 'Invalid conversation structure'
    } as ShareError);
  }

  // Validate messages array
  if (conversation.messages.length === 0) {
    console.error('[POST /api/share] Cannot share empty conversation');
    return res.status(400).json({
      error: 'Cannot share empty conversation'
    } as ShareError);
  }

  try {
    // ===== GENERATE SHARE ID =====
    // UUID v4: Cryptographically random 128-bit identifier
    // Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    // Example: a1b2c3d4-e5f6-7890-abcd-ef1234567890
    //
    // Why UUID v4?
    // - 2^122 possible values (extremely low collision probability)
    // - Unpredictable (can't guess other shares)
    // - No central coordination needed
    // - URL-safe (no special characters)
    const shareId = uuidv4();
    console.log(`[POST /api/share] Generated share ID: ${shareId}`);

    // ===== CALCULATE EXPIRATION =====
    const TTL_DAYS = 30;
    const TTL_SECONDS = TTL_DAYS * 24 * 60 * 60; // 30 days in seconds
    const now = Date.now();
    const expiresAt = now + (TTL_DAYS * 24 * 60 * 60 * 1000); // milliseconds

    console.log(`[POST /api/share] Expiration: ${new Date(expiresAt).toISOString()} (${TTL_DAYS} days)`);

    // ===== PREPARE DATA FOR STORAGE =====
    // SharedConversation includes metadata alongside the conversation
    const sharedConversation: SharedConversation = {
      conversation,
      sharedAt: now,
      expiresAt
    };

    // ===== STORE IN DATABASE =====
    // Key pattern: "share:{uuid}"
    // Value: SharedConversation object (automatically serialized to JSON by KV)
    // TTL: 30 days (Redis will auto-delete after expiration)
    //
    // Why store metadata (sharedAt, expiresAt)?
    // - Display "Shared on January 1, 2024" to viewers
    // - Show "Expires in 15 days" warning
    // - Analytics (when are shares created?)
    const key = `share:${shareId}`;
    await kv.set(key, sharedConversation, { ex: TTL_SECONDS });

    console.log(`[POST /api/share] Stored in database with key: ${key}`);

    // ===== CONSTRUCT SHAREABLE URL =====
    // In development: http://localhost:5173/share/{shareId}
    // In production: https://gaslightgpt.com/share/{shareId}
    //
    // In development, we need to return the frontend URL (Vite), not the API URL
    // Check if we're in development (localhost API) or production
    const isDevelopment = req.get('host')?.includes('localhost') || req.get('host')?.includes('127.0.0.1');

    let shareUrl: string;
    if (isDevelopment) {
      // Development: Frontend is on port 5173+ (Vite auto-increments if port is busy)
      // Vite proxy forwards the original frontend host in X-Forwarded-Host header
      const forwardedHost = req.get('x-forwarded-host');
      const forwardedProto = req.get('x-forwarded-proto') || 'http';
      const origin = req.get('origin');
      const referer = req.get('referer');

      let frontendUrl: string;
      if (forwardedHost) {
        // Best: Vite proxy sent us the original host
        frontendUrl = `${forwardedProto}://${forwardedHost}`;
      } else if (origin) {
        frontendUrl = origin;
      } else if (referer) {
        // Extract origin from referer (e.g., http://localhost:5176/some/page -> http://localhost:5176)
        const refererUrl = new URL(referer);
        frontendUrl = `${refererUrl.protocol}//${refererUrl.host}`;
      } else {
        frontendUrl = 'http://localhost:5173';
      }

      shareUrl = `${frontendUrl}/share/${shareId}`;
      console.log(`[POST /api/share] Frontend URL detected: ${frontendUrl} (from ${forwardedHost ? 'X-Forwarded-Host' : origin ? 'Origin' : referer ? 'Referer' : 'fallback'})`);
    } else {
      // Production: Same domain, use request protocol and host
      const protocol = req.protocol;
      const host = req.get('host');
      shareUrl = `${protocol}://${host}/share/${shareId}`;
    }

    console.log(`[POST /api/share] Share URL: ${shareUrl}`);

    // ===== SEND RESPONSE =====
    // Status 201 Created: New resource was successfully created
    // Include Location header (REST best practice)
    const response: ShareResponse = {
      shareId,
      url: shareUrl,
      expiresAt
    };

    res.status(201)
      .header('Location', `/api/share/${shareId}`) // Where to find the resource
      .json(response);

    console.log(`[POST /api/share] ✅ Share created successfully`);

  } catch (error) {
    // ===== ERROR HANDLING =====
    console.error('[POST /api/share] Error creating share:', error);

    // In production, don't expose internal errors to clients
    // Log the full error, send generic message
    res.status(500).json({
      error: 'Failed to create share',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    } as ShareError);
  }
});

/**
 * GET /api/share/:shareId - Retrieve a shared chat
 *
 * REST Pattern Analysis:
 * - Method: GET (reading a resource)
 * - URL: /api/share/:shareId (specific resource endpoint)
 * - Request body: None (GET requests don't have bodies)
 * - Response: 200 OK with SharedConversation, or 404 Not Found
 *
 * URL Parameters:
 * - :shareId is a route parameter (captured from URL)
 * - Accessed via req.params.shareId
 * - Example: /api/share/abc123 → req.params.shareId === "abc123"
 *
 * @param {string} shareId - UUID from URL path
 * @response {SharedConversation} - Full conversation with metadata
 */
app.get('/api/share/:shareId', async (req, res) => {
  // Extract share ID from URL path
  const { shareId } = req.params;

  console.log(`[GET /api/share/${shareId}] Retrieving shared chat`);

  // ===== VALIDATION =====
  // Basic UUID format validation (optional but good practice)
  // UUID format: 8-4-4-4-12 hexadecimal digits separated by hyphens
  // We use a relaxed pattern that accepts any UUID, not just v4
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(shareId)) {
    console.error(`[GET /api/share/${shareId}] Invalid UUID format`);
    return res.status(400).json({
      error: 'Invalid share ID format'
    } as ShareError);
  }

  try {
    // ===== RETRIEVE FROM DATABASE =====
    const key = `share:${shareId}`;
    const sharedConversation = await kv.get<SharedConversation>(key);

    // ===== HANDLE NOT FOUND =====
    // kv.get() returns null if:
    // - Key doesn't exist
    // - Key expired (TTL elapsed)
    if (!sharedConversation) {
      console.log(`[GET /api/share/${shareId}] Not found (doesn't exist or expired)`);

      // Status 404 Not Found: Resource doesn't exist
      return res.status(404).json({
        error: 'Share not found or expired'
      } as ShareError);
    }

    console.log(`[GET /api/share/${shareId}] ✅ Found, returning conversation`);
    console.log(`  - Title: "${sharedConversation.conversation.title}"`);
    console.log(`  - Messages: ${sharedConversation.conversation.messages.length}`);
    console.log(`  - Shared at: ${new Date(sharedConversation.sharedAt).toISOString()}`);
    console.log(`  - Expires at: ${new Date(sharedConversation.expiresAt).toISOString()}`);

    // ===== SEND RESPONSE =====
    // Status 200 OK: Successful retrieval
    // Return full SharedConversation (includes conversation + metadata)
    res.status(200).json(sharedConversation);

  } catch (error) {
    // ===== ERROR HANDLING =====
    console.error(`[GET /api/share/${shareId}] Error retrieving share:`, error);

    res.status(500).json({
      error: 'Failed to retrieve share',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    } as ShareError);
  }
});

/**
 * ============================================================
 * SERVER STARTUP
 * ============================================================
 */
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🔥 Dev API server running on http://localhost:${PORT}`);
  console.log(`📡 Endpoints:`);
  console.log(`   POST http://localhost:${PORT}/api/chat`);
  console.log(`   POST http://localhost:${PORT}/api/share`);
  console.log(`   GET  http://localhost:${PORT}/api/share/:shareId`);
});
