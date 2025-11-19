/**
 * Vercel Serverless Function: Share API
 *
 * This handles both creating and retrieving shared chats in production.
 * Uses Vercel KV for storage.
 */

import { kv } from '@vercel/kv';
import { v4 as uuidv4 } from 'uuid';

/**
 * Main handler function for Vercel
 * Handles both POST (create share) and GET (retrieve share) requests
 */
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Route based on HTTP method
  if (req.method === 'POST') {
    return handleCreateShare(req, res);
  } else if (req.method === 'GET') {
    return handleGetShare(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

/**
 * POST /api/share - Create a new shared chat
 */
async function handleCreateShare(req, res) {
  console.log('[POST /api/share] Share creation request received');

  const { conversation } = req.body;

  // ===== VALIDATION =====
  if (!conversation) {
    console.error('[POST /api/share] Missing conversation in request body');
    return res.status(400).json({
      error: 'Missing conversation data'
    });
  }

  // Validate conversation structure
  if (!conversation.id || !conversation.title || !Array.isArray(conversation.messages)) {
    console.error('[POST /api/share] Invalid conversation structure');
    return res.status(400).json({
      error: 'Invalid conversation structure'
    });
  }

  // Validate messages array
  if (conversation.messages.length === 0) {
    console.error('[POST /api/share] Cannot share empty conversation');
    return res.status(400).json({
      error: 'Cannot share empty conversation'
    });
  }

  try {
    // ===== GENERATE SHARE ID =====
    const shareId = uuidv4();
    console.log(`[POST /api/share] Generated share ID: ${shareId}`);

    // ===== CALCULATE EXPIRATION =====
    const TTL_DAYS = 30;
    const TTL_SECONDS = TTL_DAYS * 24 * 60 * 60; // 30 days in seconds
    const now = Date.now();
    const expiresAt = now + (TTL_DAYS * 24 * 60 * 60 * 1000); // milliseconds

    console.log(`[POST /api/share] Expiration: ${new Date(expiresAt).toISOString()} (${TTL_DAYS} days)`);

    // ===== PREPARE DATA FOR STORAGE =====
    const sharedConversation = {
      conversation,
      sharedAt: now,
      expiresAt
    };

    // ===== STORE IN VERCEL KV =====
    const key = `share:${shareId}`;
    await kv.set(key, sharedConversation, { ex: TTL_SECONDS });

    console.log(`[POST /api/share] Stored in Vercel KV with key: ${key}`);

    // ===== CONSTRUCT SHAREABLE URL =====
    // In production, use the request's host
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host || req.headers['x-forwarded-host'];
    const shareUrl = `${protocol}://${host}/share/${shareId}`;

    console.log(`[POST /api/share] Share URL: ${shareUrl}`);

    // ===== SEND RESPONSE =====
    const response = {
      shareId,
      url: shareUrl,
      expiresAt
    };

    res.status(201)
      .setHeader('Location', `/api/share/${shareId}`)
      .json(response);

    console.log(`[POST /api/share] ✅ Share created successfully`);

  } catch (error) {
    console.error('[POST /api/share] Error creating share:', error);

    res.status(500).json({
      error: 'Failed to create share',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * GET /api/share?shareId=... - Retrieve a shared chat
 *
 * Note: Vercel serverless functions use query parameters, not path parameters
 * So we access shareId via req.query.shareId instead of req.params.shareId
 */
async function handleGetShare(req, res) {
  // Extract share ID from query parameter
  const { shareId } = req.query;

  console.log(`[GET /api/share] Retrieving shared chat: ${shareId}`);

  // ===== VALIDATION =====
  if (!shareId) {
    return res.status(400).json({
      error: 'Missing shareId parameter'
    });
  }

  // UUID format validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(shareId)) {
    console.error(`[GET /api/share] Invalid UUID format: ${shareId}`);
    return res.status(400).json({
      error: 'Invalid share ID format'
    });
  }

  try {
    // ===== RETRIEVE FROM VERCEL KV =====
    const key = `share:${shareId}`;
    const sharedConversation = await kv.get(key);

    // ===== HANDLE NOT FOUND =====
    if (!sharedConversation) {
      console.log(`[GET /api/share] Not found (doesn't exist or expired): ${shareId}`);

      return res.status(404).json({
        error: 'Share not found or expired'
      });
    }

    console.log(`[GET /api/share] ✅ Found, returning conversation`);
    console.log(`  - Title: "${sharedConversation.conversation.title}"`);
    console.log(`  - Messages: ${sharedConversation.conversation.messages.length}`);

    // ===== SEND RESPONSE =====
    res.status(200).json(sharedConversation);

  } catch (error) {
    console.error(`[GET /api/share] Error retrieving share:`, error);

    res.status(500).json({
      error: 'Failed to retrieve share',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
