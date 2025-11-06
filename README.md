# GaslightGPT

A modern, polished web application for experimenting with OpenAI's ChatGPT API. Built with React, Vite, Tailwind CSS, and Shadcn/ui components for a premium user experience.

## ✨ Features

- ⚛️ Built with **React 18** + **Vite** for lightning-fast performance
- 🎨 **Tailwind CSS** + **Shadcn/ui** for a polished, modern UI
- 🌙 Beautiful dark theme with purple gradient accents
- 💬 Real-time chat with smooth typing indicators
- 📋 One-click copy for any message
- ✏️ Edit both user and assistant messages inline
- 🗑️ Clear chat history with confirmation
- ☁️ **Vercel-ready** serverless deployment
- 🔒 Secure API key handling (server-side only)
- 📱 Fully responsive design

## 🏗️ Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS, Shadcn/ui components
- **Markdown**: React Markdown with GitHub Flavored Markdown
- **Backend**: Vercel Serverless Functions
- **AI**: OpenAI API (GPT-4o-mini by default)

## 📁 Project Structure

```
GaslightGPT/
├── api/                      # Vercel serverless functions
│   └── chat.js              # ChatGPT API endpoint
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Shadcn/ui components
│   │   ├── Chat.jsx        # Main chat component
│   │   ├── ChatMessage.jsx # Message display with copy/edit
│   │   ├── ErrorBoundary.jsx # Error boundary
│   │   └── TypingIndicator.jsx
│   ├── lib/
│   │   └── utils.js        # Utility functions
│   ├── App.jsx             # Root component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles & Tailwind
├── public/
│   └── glgpt-logo.png      # Application logo
├── index.html              # HTML entry point
├── server-dev.js           # Local development API server
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind configuration
├── vercel.json             # Vercel deployment config
└── package.json            # Dependencies
```

## Quick Start - Vercel Deployment (Recommended)

### 1. Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/GaslightGPT)

Or manually:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### 2. Configure Environment Variables

In your Vercel dashboard:
1. Go to Settings → Environment Variables
2. Add these variables:
   - `OPENAI_API_KEY`: Your OpenAI API key ([get one here](https://platform.openai.com/api-keys))
   - `OPENAI_MODEL`: (optional) Model to use (default: `gpt-4o-mini`)

### 3. Redeploy

After adding environment variables, trigger a new deployment or use:

```bash
vercel --prod
```

## 🚀 Local Development

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- An OpenAI API key ([get one here](https://platform.openai.com/api-keys))

### Quick Start

1. **Clone and install dependencies**

```bash
git clone https://github.com/YOUR_USERNAME/GaslightGPT.git
cd GaslightGPT
npm install
```

2. **Set up environment variables**

```bash
# Create .env file
cp .env.example .env

# Edit .env and add your OPENAI_API_KEY
# OPENAI_API_KEY=your_key_here
# OPENAI_MODEL=gpt-4o-mini
```

3. **Start the development server**

```bash
# Runs both the API server (port 3001) and Vite dev server (port 5173)
npm run dev
```

Open http://localhost:5173 in your browser.

> **Note:** The `npm run dev` command uses `concurrently` to run both the Express API server and the Vite frontend dev server simultaneously. For production deployment, use Vercel's serverless functions instead (see deployment section above).

### Alternative: Vercel Dev (Optional)

If you prefer to test with Vercel's serverless environment locally:

```bash
# Install Vercel CLI globally
npm install -g vercel

# Run with Vercel Dev
npm run vercel-dev
```

This will start at http://localhost:3000 but requires answering setup prompts on first run.

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_api_key_here

# Optional: Model selection
OPENAI_MODEL=gpt-4o-mini
```

**Available models:**
- `gpt-4o-mini` (default, fast and cost-effective)
- `gpt-4o`
- `gpt-3.5-turbo`
- `o1-preview`
- `o1-mini`

## Usage

1. Type your message in the input box
2. Press Enter or click "Send"
3. Watch the typing indicator as the AI responds
4. Click any message to edit it
5. Use the copy button (📋) to copy messages
6. Click "Clear Chat" to reset the conversation

## Security

- Never commit your `.env` file to the repository
- `.env.example` contains placeholder names only
- For Vercel: Add secrets in the dashboard under Environment Variables
- API keys are only used server-side, never exposed to the client

## Troubleshooting

**Vercel Deployment:**
- Make sure environment variables are set in Vercel dashboard
- Check deployment logs in Vercel dashboard for errors
- Verify your OpenAI API key is valid and has credits

**Local Development:**
- Ensure all dependencies are installed (`npm install`)
- Check that your `.env` file exists and contains valid values
- Verify ports 3001 (API) and 5173 (frontend) are not in use (`lsof -i :3001` on Mac/Linux)
- If you see "EADDRINUSE" errors, another process is using the port - kill it first
- Check browser console for errors (F12 → Console tab)

**API Errors:**
- Verify your `OPENAI_API_KEY` is correct and active
- Ensure you have API credits in your OpenAI account
- Check if you're hitting rate limits
- Try a different model if one isn't working

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
