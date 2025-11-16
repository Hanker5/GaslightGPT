# GaslightGPT

A modern, type-safe ChatGPT web client with advanced message editing and chat history management. Built with React 18, TypeScript, Vite, Tailwind CSS, and Shadcn/ui components for a premium user experience.

## ✨ Features

- ⚛️ Built with **React 18** + **TypeScript** for type safety and reliability
- 🎨 **Tailwind CSS** + **Shadcn/ui** + **Radix UI** for a polished, accessible UI
- 🌙 Beautiful **light/dark theme** toggle with clean, modern design
- 💬 Real-time chat with smooth typing indicators
- 📚 **Chat history** with localStorage persistence
- 🔄 **Multiple conversations** with sidebar navigation
- ✏️ **Edit both user and assistant messages** inline
- 🔥 **"Gaslit!" badges** on edited messages (toggle on/off)
- 📋 One-click copy for any message
- 🗑️ Delete individual chats or clear all history
- 🎯 **Keyboard shortcuts** (Cmd/Ctrl+K for new chat, Escape to close dialogs)
- 🔔 **Toast notifications** for user actions
- ☁️ **Vercel-ready** serverless deployment
- 🔒 Secure API key handling (server-side only)
- 📱 Fully responsive design

## 🏗️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Shadcn/ui components, Radix UI primitives
- **UI Components**: Badge, Button, Card, Dialog, Input, Label, ScrollArea, Separator, Switch, Textarea
- **Notifications**: Sonner (toast library)
- **Markdown**: React Markdown with GitHub Flavored Markdown
- **Backend**: Vercel Serverless Functions / Express (local dev)
- **AI**: OpenAI API (GPT-4o-mini by default)
- **Storage**: localStorage for chat history and preferences

## 📁 Project Structure

```
GaslightGPT/
├── api/                          # Vercel serverless functions
│   └── chat.js                   # ChatGPT API endpoint (production)
├── src/
│   ├── components/               # React components
│   │   ├── ui/                   # Shadcn/ui components
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── switch.tsx
│   │   │   └── textarea.tsx
│   │   ├── Chat.tsx              # Main chat component
│   │   ├── ChatMessage.tsx       # Message display with copy/edit
│   │   ├── ErrorBoundary.tsx     # Error boundary wrapper
│   │   ├── Header.tsx            # Top navigation bar
│   │   ├── Logo.tsx              # Logo wrapper component
│   │   ├── LogoIcon.tsx          # SVG logo icon
│   │   ├── SettingsDialog.tsx    # Settings modal
│   │   ├── Sidebar.tsx           # Chat history sidebar
│   │   └── TypingIndicator.tsx   # Loading animation
│   ├── hooks/                    # Custom React hooks
│   │   ├── index.ts
│   │   ├── useAutoResize.ts      # Textarea auto-resize
│   │   ├── useAutoScroll.ts      # Chat auto-scroll
│   │   └── useLocalStorage.ts    # Generic localStorage hook
│   ├── lib/
│   │   ├── chatStorage.ts        # Chat history management
│   │   └── utils.ts              # Utility functions (cn)
│   ├── types/                    # TypeScript definitions
│   │   ├── api.ts                # API request/response types
│   │   ├── chat.ts               # Chat and message types
│   │   └── index.ts              # Type exports
│   ├── App.tsx                   # Root component with state
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Global styles & Tailwind
├── public/
│   ├── favicon.ico               # Favicon (32x32)
│   ├── favicon-16.png            # 16x16 favicon
│   ├── favicon-32.png            # 32x32 favicon
│   ├── favicon-48.png            # 48x48 favicon
│   ├── favicon-192.png           # 192x192 PWA icon
│   ├── favicon-512.png           # 512x512 PWA icon
│   ├── apple-touch-icon.png      # iOS home screen icon (180x180)
│   ├── logo.svg                  # Merged SVG logo
│   └── manifest.json             # PWA manifest
├── index.html                    # HTML entry point
├── server-dev.js                 # Local development API server
├── vite.config.js                # Vite configuration
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.js            # Tailwind configuration
├── vercel.json                   # Vercel deployment config
└── package.json                  # Dependencies
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

## 🎯 Usage

### Basic Chat
1. Type your message in the input box
2. Press Enter or click "Send"
3. Watch the typing indicator as the AI responds

### Advanced Features
- **Edit Messages**: Click any message to edit it inline, then save
- **Copy Messages**: Click the copy button (📋) to copy message content
- **New Chat**: Click the "+" button or press `Cmd/Ctrl+K`
- **Chat History**: Click the hamburger menu to view past conversations
- **Delete Chats**: Hover over a chat in the sidebar and click the trash icon
- **Settings**: Click the gear icon to access theme toggle, clear chat options
- **Theme Toggle**: Switch between light and dark mode in settings
- **Gaslit Labels**: Toggle the "Gaslit!" badges on edited messages

### Keyboard Shortcuts
- `Cmd/Ctrl + K`: Start a new chat
- `Escape`: Close settings dialog or sidebar (on mobile)

## 🎨 Design Philosophy

GaslightGPT follows a clean, modern design approach:
- **No AI slop**: Removed excessive purple gradients, over-centered layouts, and stacked backdrop blurs
- **Varied spacing**: Different border radii and padding for visual hierarchy
- **Subtle shadows**: Single-layer shadows for depth without complexity
- **Theme-aware**: Colors adapt to light/dark mode using CSS custom properties
- **Accessibility**: Built on Radix UI primitives for keyboard navigation and screen readers

## Security

- Never commit your `.env` file to the repository
- `.env.example` contains placeholder names only
- For Vercel: Add secrets in the dashboard under Environment Variables
- API keys are only used server-side, never exposed to the client
- Chat history is stored locally in browser localStorage only

## Troubleshooting

**Vercel Deployment:**
- Make sure environment variables are set in Vercel dashboard
- Check deployment logs in Vercel dashboard for errors
- Verify your OpenAI API key is valid and has credits

**Local Development:**
- Ensure all dependencies are installed (`npm install`)
- Check that your `.env` file exists and contains valid values
- Verify ports 3001 (API) and 5173 (frontend) are not in use
- If you see "EADDRINUSE" errors, kill the process using the port
- Check browser console for errors (F12 → Console tab)

**API Errors:**
- Verify your `OPENAI_API_KEY` is correct and active
- Ensure you have API credits in your OpenAI account
- Check if you're hitting rate limits
- Try a different model if one isn't working

**TypeScript Errors:**
- Run `npm run build` to check for type errors
- Ensure all `.tsx` files import types from `@/types`
- Check that `tsconfig.json` is properly configured

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
