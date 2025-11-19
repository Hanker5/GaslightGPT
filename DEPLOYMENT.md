# Deployment Guide - Share Feature

## What I Just Fixed

You were getting a JSON parse error because the share API didn't exist in production. I've now created:

1. ✅ **`api/share.js`** - Vercel serverless function for share feature
2. ✅ **Updated `src/lib/shareApi.ts`** - Now handles both dev (path params) and production (query params)
3. ✅ **Installed `@vercel/kv`** - Required for Vercel KV database

## Steps to Deploy

### 1. Set up Vercel KV Database

In your Vercel dashboard:

1. Go to your project → **Storage** tab
2. Click **Create Database**
3. Select **KV (Redis)**
4. Name it something like `gaslightgpt-shares`
5. Click **Create**

**Important:** Vercel will automatically inject the KV environment variables into your serverless functions. You don't need to manually add them!

### 2. Deploy Your Code

Commit and push your changes:

```bash
git add .
git commit -m "Add share feature serverless function for Vercel"
git push
```

Vercel will automatically deploy when you push to your main branch.

### 3. Test in Production

After deployment:

1. Open your production URL (e.g., `https://gaslightgpt.vercel.app`)
2. Send some messages to create a conversation
3. Click the **Share** button
4. Create a share link
5. The link should now work!

## How It Works

### Development (localhost)
- **Backend:** `server-dev.ts` on port 3001
- **Database:** Mock KV (in-memory)
- **API endpoint:** `GET /api/share/:shareId` (path parameter)

### Production (Vercel)
- **Backend:** `api/share.js` (serverless function)
- **Database:** Vercel KV (real Redis)
- **API endpoint:** `GET /api/share?shareId=xxx` (query parameter)

The frontend (`src/lib/shareApi.ts`) automatically detects the environment and uses the correct format!

## Troubleshooting

### "Failed to create share" error
- Make sure you created a Vercel KV database in the dashboard
- Redeploy after creating the KV database (Vercel needs to inject the env vars)

### Share link doesn't work
- Check the browser console for errors
- Verify the KV database is connected in Vercel dashboard
- Check Vercel function logs for errors

### 404 on /api/share
- Make sure `api/share.js` was deployed
- Check Vercel deployment logs to confirm the function was built

## Environment Variables

Vercel KV automatically adds these (you don't need to set them):
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`
- `KV_URL`

Your existing variable:
- `GROQ_API_KEY` - Already set in Vercel dashboard

## File Structure

```
api/
├── chat.js         # Existing chat API (already working)
└── share.js        # NEW: Share API for production

src/lib/
└── shareApi.ts     # UPDATED: Handles dev + production

lib/
├── kv-mock.ts      # Dev only: Mock Redis
└── kv.ts           # Dev only: Abstraction layer

server-dev.ts       # Dev only: Local Express server
```

## Next Steps

After deploying:

1. ✅ Test creating a share in production
2. ✅ Test opening the share link
3. ✅ Verify expiration works (shares expire after 30 days)
4. ✅ Test error cases (invalid share ID, expired share)

That's it! Your share feature should now work in production! 🎉
